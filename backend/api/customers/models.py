from django.db import models

from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
import json

class Customer(models.Model):
    # Basic Info
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=50, default='US')
    
    # E-commerce metrics
    total_orders = models.IntegerField(default=0)
    lifetime_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_order_date = models.DateTimeField(null=True, blank=True)
    avg_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Marketing
    email_subscribed = models.BooleanField(default=True)
    acquisition_source = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def days_since_last_order(self):
        if not self.last_order_date:
            return None
        return (timezone.now() - self.last_order_date).days

class Segment(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    conditions = models.JSONField()  # Store segment conditions as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def get_customers(self):
        """Apply segment conditions to filter customers"""
        queryset = Customer.objects.all()
        
        for condition in self.conditions:
            field = condition['field']
            operator = condition['operator']
            value = condition['value']
            
            if operator == 'equals':
                queryset = queryset.filter(**{field: value})
            elif operator == 'contains':
                queryset = queryset.filter(**{f"{field}__icontains": value})
            elif operator == 'greater_than':
                queryset = queryset.filter(**{f"{field}__gt": value})
            elif operator == 'less_than':
                queryset = queryset.filter(**{f"{field}__lt": value})
            elif operator == 'in_last_days':
                days_ago = timezone.now() - timedelta(days=int(value))
                queryset = queryset.filter(**{f"{field}__gte": days_ago})
        
        return queryset

class Flow(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class FlowStep(models.Model):
    flow = models.ForeignKey(Flow, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField()
    email_subject = models.CharField(max_length=200)
    email_content = models.TextField()
    delay_days = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['step_number']
    
    def __str__(self):
        return f"{self.flow.name} - Step {self.step_number}"

class Campaign(models.Model):
    name = models.CharField(max_length=200)
    segment = models.ForeignKey(Segment, on_delete=models.CASCADE)
    flow = models.ForeignKey(Flow, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
