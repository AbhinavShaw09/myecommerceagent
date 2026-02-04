# Email Marketing Platform - Production Setup Guide

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                            │
│                    (NGINX / AWS ALB)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │   Frontend  │ │   Backend   │ │    Redis    │
    │   (Next.js) │ │   (Django)  │ │   (Cache)   │
    └──────┬──────┘ └──────┬──────┘ └─────────────┘
           │               │
           │      ┌────────┴────────┐
           │      │                 │
           │   ┌──▼───┐         ┌──▼───┐
           │   │PostgreSQL│      │ Celery │
           │   │  DB     │      │ Workers│
           │   └─────────┘      └────────┘
           │
    ┌──────▼───────────────────────────────────────────────┐
    │                  External Services                    │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
    │  │   Gemini    │  │    SMTP     │  │  Analytics  │  │
    │  │    API      │  │   Service   │  │    API      │  │
    │  └─────────────┘  └─────────────┘  └─────────────┘  │
    └───────────────────────────────────────────────────────┘
```

### 1.2 Component Description

- **Frontend (Next.js 16)**: React-based UI for managing customers, segments, flows, and campaigns
- **Backend (Django REST Framework)**: RESTful API for business logic and data management
- **Database (PostgreSQL)**: Primary data storage for all entities
- **Redis**: Caching layer and Celery broker
- **Celery**: Async task queue for email delivery and scheduled operations
- **Gemini API**: AI-powered generation of segments and campaign content

## 2. Database Design

### 2.1 Core Entities

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Customer     │     │    Segment      │     │      Flow       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ email           │     │ name            │     │ name            │
│ first_name      │     │ description     │     │ description     │
│ last_name       │     │ conditions (JSON)│    │ is_active       │
│ phone           │◄────┤ campaign (FK)   │◄────┤ steps (1:N)     │
│ address fields  │     └─────────────────┘     └────────┬────────┘
│ total_orders    │                                      │
│ lifetime_value  │                               ┌───────▼───────┐
│ last_order_date │                               │   FlowStep    │
│ avg_order_value │                               ├───────────────┤
│ email_subscribed│                               │ id (PK)       │
│ created_at      │                               │ flow_id (FK)  │
│ updated_at      │                               │ step_number   │
└─────────────────┘                               │ email_subject │
                                                  │ email_content │
┌─────────────────┐                               │ delay_days    │
│    Campaign     │                               └───────────────┘
├─────────────────┤
│ id (PK)         │                               ┌─────────────────┐
│ name            │                               │  EmailLog       │
│ segment_id (FK) │                               ├─────────────────┤
│ flow_id (FK)    │                               │ id (PK)         │
│ is_active       │                               │ campaign_id     │
│ created_at      │                               │ customer_id     │
└─────────────────┘                               │ status         │
                                                  │ sent_at        │
                                                  │ opened_at       │
                                                  │ clicked_at      │
                                                  └─────────────────┘
```

### 2.2 Index Strategy

```sql
-- Customer table indexes for common queries
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_customer_ltv ON customers(lifetime_value DESC);
CREATE INDEX idx_customer_last_order ON customers(last_order_date DESC);
CREATE INDEX idx_customer_created_at ON customers(created_at DESC);

-- Segment performance indexes
CREATE INDEX idx_segment_conditions ON segments USING GIN (conditions jsonb_path_ops);

-- Campaign targeting indexes
CREATE INDEX idx_campaign_active ON campaigns(is_active) WHERE is_active = true;
```

## 3. API Endpoints

### 3.1 Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers/` | List all customers |
| POST | `/api/customers/` | Create new customer |
| GET | `/api/customers/{id}/` | Get customer details |
| PUT | `/api/customers/{id}/` | Update customer |
| DELETE | `/api/customers/{id}/` | Delete customer |

### 3.2 Segment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/segments/` | List all segments |
| POST | `/api/segments/` | Create new segment |
| GET | `/api/segments/{id}/` | Get segment details |
| PUT | `/api/segments/{id}/` | Update segment |
| DELETE | `/api/segments/{id}/` | Delete segment |
| GET | `/api/segments/{id}/preview/` | Preview matching customers |

### 3.3 Flow Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flows/` | List all flows |
| POST | `/api/flows/` | Create new flow |
| GET | `/api/flows/{id}/` | Get flow details |
| PUT | `/api/flows/{id}/` | Update flow |
| DELETE | `/api/flows/{id}/` | Delete flow |
| GET | `/api/flows/{id}/steps/` | Get all steps in flow |
| GET | `/api/flows/{id}/preview_customers/` | Preview enrolled customers |

### 3.4 Flow Step Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flow-steps/` | List all flow steps |
| POST | `/api/flow-steps/` | Create new flow step |
| GET | `/api/flow-steps/{id}/` | Get step details |
| PUT | `/api/flow-steps/{id}/` | Update step |
| DELETE | `/api/flow-steps/{id}/` | Delete step |
| GET | `/api/flow-steps/{id}/preview/` | Preview customers for step |

### 3.5 Campaign Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns/` | List all campaigns |
| POST | `/api/campaigns/` | Create new campaign |
| GET | `/api/campaigns/{id}/` | Get campaign details |
| PUT | `/api/campaigns/{id}/` | Update campaign |
| DELETE | `/api/campaigns/{id}/` | Delete campaign |
| POST | `/api/campaigns/{id}/enroll/` | Enroll segment customers |

### 3.6 AI Generation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate/` | Generate segment + campaign from prompt |
| POST | `/api/generate/flow/` | Generate multi-step flow from prompt |

**Usage Example:**
```bash
POST /api/generate/
{
  "prompt": "I want to improve revenue from high lifetime value customers that haven't purchased recently."
}
```

## 4. AI Integration with Gemini API

### 4.1 Setup

```bash
# Set environment variable
export GEMINI_API_KEY="your_api_key_here"

# Or create .env file in backend/
GEMINI_API_KEY=your_api_key_here
```

### 4.2 Prompt Engineering Strategy

#### Segment Generation Prompt
```python
SEGMENT_PROMPT = """
Generate a detailed customer segment for a marketing campaign based on the following business objective:

Business Objective: {prompt}

Requirements:
1. The segment should be specific and actionable
2. Include clear criteria (demographic, behavioral, transactional)
3. Use standard marketing metrics (LTV, purchase frequency, recency, etc.)
4. Provide exact thresholds and conditions
5. Make it implementable in a marketing automation system

Output Format:
Return only the segment definition in JSON format like:
{{
  "segment_name": "Descriptive name",
  "criteria": [
    {{"field": "metric_name", "operator": "condition", "value": "threshold"}}
  ],
  "description": "Brief explanation of the segment"
}}
"""
```

#### Campaign Elements Prompt
```python
CAMPAIGN_PROMPT = """
Generate complete campaign elements for an email marketing campaign based on the following business objective:

Business Objective: {prompt}

Requirements:
1. Generate an engaging email subject line (max 50 characters)
2. Suggest optimal send time (hour of day in 24-hour format)
3. Suggest optimal send date (relative to today, e.g., "tomorrow", "next Monday")
4. Provide 3 plain-text content ideas for the email body
5. Include specific product recommendations or offers if applicable
6. Make suggestions data-driven and relevant to the segment

Output Format:
Return only the campaign elements in JSON format like:
{{
  "subject": "Engaging subject line",
  "send_time": "14:00",
  "send_date": "tomorrow",
  "content_ideas": [
    "First content idea with specific details"
  ],
  "recommendations": "Any additional recommendations"
}}
"""
```

#### Flow Generation Prompt
```python
FLOW_PROMPT = """
Generate a multi-step email marketing flow based on the following business objective:

Business Objective: {prompt}

Requirements:
1. Create a sequence of 3-5 email steps with delays between them
2. Each step should have an email subject and content guidelines
3. Include specific delays (in days) between steps
4. Make each step progressively move the customer toward the goal
5. Each step should have a clear purpose (e.g., awareness, engagement, conversion, retention)

Output Format:
Return only the flow definition in JSON format like:
{{
  "flow_name": "Descriptive name for the flow",
  "description": "Brief description of the flow's purpose",
  "steps": [
    {{
      "step_number": 1,
      "email_subject": "Engaging subject line (max 50 chars)",
      "email_content_guidelines": "Specific guidelines",
      "delay_days": 0
    }}
  ]
}}
"""
```

### 4.3 Response Parsing

```python
import json
import re
from typing import Dict, Any

def extract_json_from_response(response: str) -> Dict[str, Any]:
    """Extract JSON from Gemini response"""
    json_pattern = r'\{.*?\}'
    matches = re.findall(json_pattern, response, re.DOTALL)
    
    for match in matches:
        try:
            return json.loads(match)
        except json.JSONDecodeError:
            continue
    
    raise ValueError("Could not extract JSON from response")
```

## 5. Production Deployment

### 5.1 Docker Configuration

```dockerfile
# Dockerfile.backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations
RUN python manage.py migrate

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "api.wsgi:application"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    environment:
      - DJANGO_SETTINGS_MODULE=api.settings.production
      - DATABASE_URL=postgresql://user:pass@db:5432/email_marketing
      - REDIS_URL=redis://redis:6379/0
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
      - static_volume:/app/static

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=email_marketing
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  celery-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    command: celery -A api worker -l info
    environment:
      - DJANGO_SETTINGS_MODULE=api.settings.production
      - DATABASE_URL=postgresql://user:pass@db:5432/email_marketing
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
  static_volume:
```

### 5.2 Environment Variables

```bash
# .env.production

# Django
DJANGO_SETTINGS_MODULE=api.settings.production
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@db:5432/email_marketing

# Redis
REDIS_URL=redis://redis:6379/0

# AI
GEMINI_API_KEY=your-gemini-api-key

# Email (SMTP)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Security
SSL_ENABLED=True
SECURE_SSL_REDIRECT=True
```

### 5.3 Nginx Configuration

```nginx
# nginx.conf
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /app/static/;
    }

    # Health check
    location /health/ {
        proxy_pass http://backend/health/;
    }
}
```

## 6. Security Considerations

### 6.1 API Security

```python
# api/settings/production.py

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

# Rate Limiting
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    }
}

# Authentication
AUTHENTICATION_CLASSES = [
    'rest_framework.authentication.SessionAuthentication',
    'rest_framework.authentication.TokenAuthentication',
]

# Permission Classes
PERMISSION_CLASSES = [
    'rest_framework.permissions.IsAuthenticated',
]
```

### 6.2 Data Protection

```python
# Encrypt sensitive data at rest
from django.db import models
from django_cryptography.fields import encrypt

class Customer(models.Model):
    email = models.EmailField()
    phone = encrypt(models.CharField(max_length=20))
    # Other fields...
```

### 6.3 Audit Logging

```python
# Track all modifications
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Customer)
def log_customer_save(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    logger.info(f"Customer {instance.id} {action} by user {kwargs.get('request').user}")

@receiver(post_delete, sender=Customer)
def log_customer_delete(sender, instance, **kwargs):
    logger.info(f"Customer {instance.id} deleted")
```

## 7. Scalability

### 7.1 Horizontal Scaling

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/backend:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        envFrom:
        - secretRef:
            name: api-secrets
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 7.2 Database Optimization

```sql
-- Read replica configuration for PostgreSQL
-- Primary handles writes, replicas handle reads

-- In settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'email_marketing',
        'HOST': 'primary-db',
        'OPTIONS': {
            'connect_timeout': 10,
        },
    },
    'replica': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'email_marketing',
        'HOST': 'replica-db',
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}

# Use replica for read operations
import random

class PrimaryReplicaRouter:
    def db_for_read(self, model, **hints):
        return 'replica'
    
    def db_for_write(self, model, **hints):
        return 'default'
```

### 7.3 Caching Strategy

```python
# api/settings/production.py

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://redis:6379/0',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'email_marketing',
    }
}

# Cache segment queries for 5 minutes
from django.core.cache import cache

def get_segment_customers(segment_id):
    cache_key = f'segment_customers_{segment_id}'
    customers = cache.get(cache_key)
    
    if customers is None:
        segment = Segment.objects.get(id=segment_id)
        customers = list(segment.get_customers())
        cache.set(cache_key, customers, 300)  # 5 minutes
    
    return customers
```

## 8. Monitoring and Logging

### 8.1 Application Monitoring

```python
# monitoring/middleware.py
import time
from django.utils.deprecation import MiddlewareMixin

class PerformanceMonitoringMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            # Log to monitoring service
            print(f"{request.path}: {response.status_code} ({duration:.2f}s)")
        return response
```

### 8.2 Health Checks

```python
# api/health.py
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import redis

class HealthCheckView(APIView):
    def get(self, request):
        health = {
            'status': 'healthy',
            'components': {}
        }
        
        # Check database
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health['components']['database'] = 'healthy'
        except Exception as e:
            health['components']['database'] = f'unhealthy: {str(e)}'
            health['status'] = 'unhealthy'
        
        # Check Redis
        try:
            r = redis.from_url(settings.REDIS_URL)
            r.ping()
            health['components']['redis'] = 'healthy'
        except Exception as e:
            health['components']['redis'] = f'unhealthy: {str(e)}'
            health['status'] = 'unhealthy'
        
        return Response(health, status=status.HTTP_200_OK if health['status'] == 'healthy' else status.HTTP_503_SERVICE_UNAVAILABLE)
```

### 8.3 Logging Configuration

```python
# api/settings/production.py

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/email_marketing/app.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'api': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
```

## 9. Email Delivery System

### 9.1 Celery Tasks for Email Queue

```python
# tasks/email_tasks.py
from celery import shared_task
from django.core.mail import EmailMessage
from django.template import loader
from .models import Campaign, Customer

@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def send_campaign_email(self, campaign_id, customer_id):
    """Send individual campaign email"""
    from api.models import Campaign, Customer
    
    try:
        campaign = Campaign.objects.get(id=campaign_id)
        customer = Customer.objects.get(id=customer_id)
        
        # Get the first step of the flow
        first_step = campaign.flow.steps.order_by('step_number').first()
        
        # Render email template
        html_message = loader.render_to_string(
            'emails/campaign_email.html',
            {
                'customer': customer,
                'subject': first_step.email_subject,
                'content': first_step.email_content,
            }
        )
        
        # Send email
        email = EmailMessage(
            subject=first_step.email_subject,
            body=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[customer.email],
        )
        email.content_subtype = 'html'
        email.send()
        
        # Log success
        EmailLog.objects.create(
            campaign=campaign,
            customer=customer,
            status='sent',
            sent_at=timezone.now()
        )
        
    except Exception as e:
        # Retry on failure
        raise self.retry(exc=e)

@shared_task
def process_campaign_queue(campaign_id):
    """Queue all emails for a campaign"""
    campaign = Campaign.objects.get(id=campaign_id)
    customers = campaign.customers.all()
    
    for customer in customers:
        send_campaign_email.delay(campaign_id, customer.id)
```

### 9.2 Email Open/Click Tracking

```python
# Track email opens
class TrackOpenView(APIView):
    def get(self, request, log_id):
        log = EmailLog.objects.get(id=log_id)
        log.opened_at = timezone.now()
        log.save()
        
        # Return 1x1 pixel
        image_data = base64.b64decode(
            'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
        )
        return HttpResponse(image_data, content_type='image/gif')

# Track email clicks
class TrackClickView(APIView):
    def get(self, request, log_id, url_hash):
        log = EmailLog.objects.get(id=log_id)
        log.clicked_at = timezone.now()
        log.save()
        
        # Redirect to original URL
        original_url = CampaignLink.objects.get(hash=url_hash).original_url
        return redirect(original_url)
```

## 10. Backup and Recovery

### 10.1 Database Backups

```bash
#!/bin/bash
# backup.sh

# Daily PostgreSQL backup with retention
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Delete old backups
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://your-backup-bucket/postgres/
```

### 10.2 Recovery Procedure

```bash
# Restore from backup
zcat backup_20240115_120000.sql.gz | psql $DATABASE_URL

# Point-in-time recovery (if using PostgreSQL with WAL)
# Stop the database
# Configure recovery.conf
# Start the database
```

## 11. Performance Benchmarks

### 11.1 Expected Performance

| Operation | Expected Response Time |
|-----------|----------------------|
| Customer list (paginated) | < 200ms |
| Segment preview (1000s of customers) | < 1s |
| AI generation | < 5s |
| Email send (async) | Immediate (queued) |

### 11.2 Load Testing

```bash
# Using locust
locust -f load_tests.py --host=http://localhost:8000 --users=100 --spawn-rate=10
```

```python
# load_tests.py
from locust import HttpUser, task, between

class APIUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(1)
    def get_customers(self):
        self.client.get('/api/customers/')
    
    @task(2)
    def get_segments(self):
        self.client.get('/api/segments/')
    
    @task(1)
    def preview_segment(self):
        self.client.get('/api/segments/1/preview/')
```

## 12. Troubleshooting Guide

### 12.1 Common Issues

1. **High memory usage**
   - Check for N+1 queries
   - Enable query logging
   - Use select_related/prefetch_related

2. **Slow segment queries**
   - Add database indexes
   - Implement query caching
   - Consider materialized views for complex segments

3. **Email delivery failures**
   - Verify SMTP credentials
   - Check spam score
   - Monitor bounce rates

### 12.2 Diagnostic Commands

```bash
# Check database connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check Redis memory
redis-cli info memory

# View Celery queue length
celery -A api inspect active_queues

# Check application logs
tail -f /var/log/email_marketing/app.log
```

## 13. Cost Estimation

### 13.1 Monthly Costs (for 100k customers)

| Service | Estimated Cost |
|---------|---------------|
| AWS EC2 (t3.xlarge) | $150/month |
| RDS PostgreSQL | $200/month |
| ElastiCache Redis | $50/month |
| SES (Email) | $50/month |
| Gemini API | $100/month |
| S3 Storage | $10/month |
| **Total** | **$560/month** |

## 14. Compliance

### 14.1 GDPR Compliance

```python
# Data deletion requests
class GDPRDeletionView(APIView):
    def post(self, request):
        customer_email = request.data.get('email')
        
        # Anonymize customer data
        Customer.objects.filter(email=customer_email).update(
            email=f"deleted_{uuid4()}@example.com",
            first_name="Deleted",
            last_name="User",
            phone="",
            address_line1="",
            # ... anonymize all PII fields
        )
        
        # Delete all associated data
        EmailLog.objects.filter(customer__email=customer_email).delete()
        
        return Response({'status': 'deleted'})
```

### 14.2 Email Compliance

```python
# Ensure CAN-SPAM compliance
COMPLIANCE_FIELDS = {
    'physical_address': '123 Main St, City, ST 12345',
    'unsubscribe_url': 'https://yourdomain.com/unsubscribe/',
}
```

This production setup guide provides a comprehensive foundation for deploying a scalable, secure, and performant email marketing platform. Adjust configurations based on your specific infrastructure and compliance requirements.
