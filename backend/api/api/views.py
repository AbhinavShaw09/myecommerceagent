"""Health check views for the API."""

from datetime import datetime, timedelta
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import Customer, Segment, Flow, FlowStep, Campaign
from .serializers import CustomerSerializer, SegmentSerializer, FlowSerializer, CampaignSerializer


@api_view(["GET"])
def health_check(request):
    """Simple health check endpoint to verify backend is running."""
    return Response(
        {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "e-commerce-api",
        },
        status=status.HTTP_200_OK,
    )

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class SegmentViewSet(viewsets.ModelViewSet):
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer

class FlowViewSet(viewsets.ModelViewSet):
    queryset = Flow.objects.all()
    serializer_class = FlowSerializer

class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

@api_view(['POST'])
def generate_segment_and_campaign(request):
    """AI agent endpoint to generate segments and campaigns"""
    prompt = request.data.get('prompt', '')
    
    # Simple AI logic (in production, use OpenAI/Claude)
    segment_data = analyze_prompt_for_segment(prompt)
    campaign_data = generate_campaign_from_prompt(prompt)
    
    return Response({
        'segment': segment_data,
        'campaign': campaign_data
    })

def analyze_prompt_for_segment(prompt):
    """Simple rule-based segment generation"""
    conditions = []
    
    if 'high lifetime value' in prompt.lower() or 'ltv' in prompt.lower():
        # Get 75th percentile LTV
        customers = Customer.objects.all()
        if customers.exists():
            ltv_values = [c.lifetime_value for c in customers]
            percentile_75 = sorted(ltv_values)[int(len(ltv_values) * 0.75)]
            conditions.append({
                'field': 'lifetime_value',
                'operator': 'greater_than',
                'value': float(percentile_75)
            })
    
    if 'subscribed' in prompt.lower():
        conditions.append({
            'field': 'email_subscribed',
            'operator': 'equals',
            'value': True
        })
    
    if 'haven\'t purchased' in prompt.lower() or 'not ordered' in prompt.lower():
        days = 60  # default
        if '60 days' in prompt:
            days = 60
        elif '30 days' in prompt:
            days = 30
        elif '90 days' in prompt:
            days = 90
        
        conditions.append({
            'field': 'last_order_date',
            'operator': 'less_than',
            'value': (timezone.now() - timedelta(days=days)).isoformat()
        })
    
    return {
        'name': 'High LTV Inactive Customers',
        'description': 'Customers with high lifetime value who haven\'t purchased recently',
        'conditions': conditions
    }

def generate_campaign_from_prompt(prompt):
    """Generate campaign elements"""
    return {
        'subject': 'We Miss You! Special Offer Inside',
        'send_time': '10:00',
        'send_date': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
        'content_ideas': [
            'Personalized product recommendations based on past purchases',
            'Exclusive discount code for returning customers',
            'Highlight new arrivals in their favorite categories',
            'Social proof with customer reviews and testimonials'
        ]
    }
