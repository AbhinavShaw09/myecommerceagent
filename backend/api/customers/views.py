from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Customer, Segment, Flow, FlowStep, Campaign
from .serializers import (
    CustomerSerializer,
    SegmentSerializer,
    FlowSerializer,
    CampaignSerializer,
)
import json
from datetime import datetime, timedelta
from django.utils import timezone


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class SegmentViewSet(viewsets.ModelViewSet):
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer

    @action(detail=True, methods=["get"])
    def customers(self, request, pk=None):
        segment = self.get_object()
        customers = segment.get_customers()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def preview(self, request, pk=None):
        segment = self.get_object()
        customers = segment.get_customers()
        count = customers.count()
        sample = customers[:5]
        serializer = CustomerSerializer(sample, many=True)
        return Response({"count": count, "sample": serializer.data})


class FlowViewSet(viewsets.ModelViewSet):
    queryset = Flow.objects.all()
    serializer_class = FlowSerializer


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        was_active = instance.is_active
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        is_active = serializer.validated_data.get("is_active", was_active)
        if is_active and not was_active:
            enrolled_count = instance.enroll_customers_from_segment()
            return Response(
                {
                    **serializer.data,
                    "enrolled_count": enrolled_count,
                    "message": f"Campaign activated. {enrolled_count} customers enrolled.",
                }
            )

        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def enroll_customers(self, request, pk=None):
        campaign = self.get_object()
        enrolled_count = campaign.enroll_customers_from_segment()
        return Response(
            {
                "enrolled_count": enrolled_count,
                "customer_count": campaign.customer_count,
                "message": f"{enrolled_count} customers enrolled in campaign.",
            }
        )

    @action(detail=True, methods=["get"])
    def enrolled_customers(self, request, pk=None):
        campaign = self.get_object()
        customers = campaign.customers.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)


@api_view(["POST"])
def generate_segment_and_campaign(request):
    """AI agent endpoint to generate segments and campaigns"""
    prompt = request.data.get("prompt", "")

    # Simple AI logic (in production, use OpenAI/Claude)
    segment_data = analyze_prompt_for_segment(prompt)
    campaign_data = generate_campaign_from_prompt(prompt)

    return Response({"segment": segment_data, "campaign": campaign_data})


def analyze_prompt_for_segment(prompt):
    """Simple rule-based segment generation"""
    conditions = []

    if "high lifetime value" in prompt.lower() or "ltv" in prompt.lower():
        # Get 75th percentile LTV
        customers = Customer.objects.all()
        if customers.exists():
            ltv_values = [c.lifetime_value for c in customers]
            percentile_75 = sorted(ltv_values)[int(len(ltv_values) * 0.75)]
            conditions.append(
                {
                    "field": "lifetime_value",
                    "operator": "greater_than",
                    "value": float(percentile_75),
                }
            )

    if "subscribed" in prompt.lower():
        conditions.append(
            {"field": "email_subscribed", "operator": "equals", "value": True}
        )

    if "haven't purchased" in prompt.lower() or "not ordered" in prompt.lower():
        days = 60  # default
        if "60 days" in prompt:
            days = 60
        elif "30 days" in prompt:
            days = 30
        elif "90 days" in prompt:
            days = 90

        conditions.append(
            {
                "field": "last_order_date",
                "operator": "less_than",
                "value": (timezone.now() - timedelta(days=days)).isoformat(),
            }
        )

    return {
        "name": "High LTV Inactive Customers",
        "description": "Customers with high lifetime value who haven't purchased recently",
        "conditions": conditions,
    }


def generate_campaign_from_prompt(prompt):
    """Generate campaign elements"""
    return {
        "subject": "We Miss You! Special Offer Inside",
        "send_time": "10:00",
        "send_date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
        "content_ideas": [
            "Personalized product recommendations based on past purchases",
            "Exclusive discount code for returning customers",
            "Highlight new arrivals in their favorite categories",
            "Social proof with customer reviews and testimonials",
        ],
    }
