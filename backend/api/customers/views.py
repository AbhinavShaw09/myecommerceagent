import sys
import os
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

# Add parent directory to path for gemini_campaign_agent import
sys.path.insert(
    0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
from gemini_campaign_agent import GeminiCampaignAgent


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class SegmentViewSet(viewsets.ModelViewSet):
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer

    @action(detail=True, methods=["get"])
    def preview(self, request, pk=None):
        """Preview customers that match this segment"""
        segment = self.get_object()
        customers = segment.get_customers()
        return Response(
            {
                "count": customers.count(),
                "customers": CustomerSerializer(
                    customers[:10], many=True
                ).data,  # First 10 for preview
            }
        )


class FlowViewSet(viewsets.ModelViewSet):
    queryset = Flow.objects.all()
    serializer_class = FlowSerializer

    @action(detail=True, methods=["get"])
    def steps(self, request, pk=None):
        """Get all steps for this flow"""
        flow = self.get_object()
        steps = flow.steps.all()
        from .serializers import FlowStepSerializer

        return Response(
            {"count": steps.count(), "steps": FlowStepSerializer(steps, many=True).data}
        )

    @action(detail=True, methods=["get"])
    def preview_customers(self, request, pk=None):
        """Preview customers enrolled in this flow's campaigns"""
        flow = self.get_object()
        campaigns = flow.campaign_set.all()
        customers = Customer.objects.filter(campaigns__in=campaigns).distinct()
        from .serializers import CustomerSerializer

        return Response(
            {
                "count": customers.count(),
                "customers": CustomerSerializer(customers[:10], many=True).data,
            }
        )


class FlowStepViewSet(viewsets.ModelViewSet):
    queryset = FlowStep.objects.all()
    serializer_class = FlowSerializer

    def get_queryset(self):
        """Order steps by step_number by default"""
        queryset = super().get_queryset()
        if self.action == "list":
            return queryset.order_by("flow", "step_number")
        return queryset

    @action(detail=True, methods=["get"])
    def preview(self, request, pk=None):
        """Preview customers who will receive this step (based on flow's segment)"""
        step = self.get_object()
        flow = step.flow
        campaigns = flow.campaign_set.all()
        customers = Customer.objects.filter(campaigns__in=campaigns).distinct()
        from .serializers import CustomerSerializer

        return Response(
            {
                "count": customers.count(),
                "customers": CustomerSerializer(customers[:10], many=True).data,
                "step_info": {
                    "step_number": step.step_number,
                    "email_subject": step.email_subject,
                    "delay_days": step.delay_days,
                },
            }
        )


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer


@api_view(["POST"])
def generate_segment_and_campaign(request):
    """AI agent endpoint to generate segments and campaigns using Gemini API"""
    prompt = request.data.get("prompt", "")

    if not prompt:
        return Response(
            {"error": "Prompt is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Use GeminiCampaignAgent for intelligent generation
        agent = GeminiCampaignAgent()
        result = agent.generate_complete_campaign(prompt)

        return Response({"segment": result["segment"], "campaign": result["campaign"]})

    except ValueError as e:
        # Fallback to rule-based generation if Gemini API key is not configured
        if "API key not provided" in str(e):
            segment_data = analyze_prompt_for_segment(prompt)
            campaign_data = generate_campaign_from_prompt(prompt)

            return Response(
                {
                    "segment": segment_data,
                    "campaign": campaign_data,
                    "note": "Using rule-based generation. Set GEMINI_API_KEY for AI-powered generation.",
                }
            )
        else:
            raise


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


@api_view(["POST"])
def generate_flow(request):
    """Generate a multi-step email flow using Gemini AI"""
    prompt = request.data.get("prompt", "")

    if not prompt:
        return Response(
            {"error": "Prompt is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Create Gemini agent for flow generation
        agent = GeminiCampaignAgent()

        # Generate flow steps with delays
        prompt_text = f"""
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
              "email_content_guidelines": "Specific guidelines for email content",
              "delay_days": 0  // Days to wait before this step (0 for first step)
            }},
            {{
              "step_number": 2,
              "email_subject": "Engaging subject line (max 50 chars)",
              "email_content_guidelines": "Specific guidelines for email content",
              "delay_days": 10  // Days to wait after step 1
            }}
          ]
        }}
        """

        response = agent.model.generate_content(prompt_text)
        flow_data = agent._extract_json_from_response(response.text)

        return Response({"flow": flow_data})

    except ValueError as e:
        if "API key not provided" in str(e):
            # Fallback to rule-based flow generation
            flow_data = generate_rule_based_flow(prompt)
            return Response(
                {
                    "flow": flow_data,
                    "note": "Using rule-based generation. Set GEMINI_API_KEY for AI-powered generation.",
                }
            )
        else:
            raise
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def generate_rule_based_flow(prompt):
    """Generate a simple rule-based flow for fallback"""
    steps = [
        {
            "step_number": 1,
            "email_subject": "We Miss You!",
            "email_content_guidelines": "Send a friendly reminder about your brand with a special offer",
            "delay_days": 0,
        },
        {
            "step_number": 2,
            "email_subject": "Exclusive Just for You",
            "email_content_guidelines": "Provide a personalized discount code to encourage return purchase",
            "delay_days": 5,
        },
        {
            "step_number": 3,
            "email_subject": "Last Chance!",
            "email_content_guidelines": "Create urgency with a time-limited offer highlighting bestsellers",
            "delay_days": 5,
        },
    ]

    return {
        "flow_name": "Win-Back Campaign",
        "description": "Multi-step campaign to re-engage inactive customers",
        "steps": steps,
    }
