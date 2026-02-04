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
    country = models.CharField(max_length=50, default="US")

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
        queryset = Customer.objects.all()

        for condition in self.conditions:
            field = condition["field"]
            operator = condition["operator"]
            value = condition["value"]

            # Smart handling for email domains
            if field == "email" and operator == "equals":
                # If the value doesn't contain @, treat it as a domain and use contains
                if "@" not in str(value):
                    queryset = queryset.filter(**{f"{field}__icontains": value})
                else:
                    converted_value = self._convert_value(field, value)
                    queryset = queryset.filter(**{field: converted_value})
            else:
                converted_value = self._convert_value(field, value)

                if operator == "equals":
                    queryset = queryset.filter(**{field: converted_value})
                elif operator == "contains":
                    queryset = queryset.filter(**{f"{field}__icontains": value})
                elif operator == "greater_than":
                    queryset = queryset.filter(**{f"{field}__gt": converted_value})
                elif operator == "less_than":
                    queryset = queryset.filter(**{f"{field}__lt": converted_value})
                elif operator == "in_last_days":
                    days_ago = timezone.now() - timedelta(days=int(value))
                    queryset = queryset.filter(**{f"{field}__gte": days_ago})

        return queryset

    def _convert_value(self, field, value):
        numeric_fields = ["lifetime_value", "avg_order_value", "total_orders"]
        boolean_fields = ["email_subscribed"]

        if field in numeric_fields:
            try:
                if field in ["lifetime_value", "avg_order_value"]:
                    return float(value)
                return int(value)
            except (ValueError, TypeError):
                return value

        if field in boolean_fields:
            if isinstance(value, str):
                return value.lower() in ("true", "1", "yes", "on")
            return bool(value)

        return value


class Flow(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class FlowStep(models.Model):
    flow = models.ForeignKey(Flow, on_delete=models.CASCADE, related_name="steps")
    step_number = models.IntegerField()
    email_subject = models.CharField(max_length=200)
    email_content = models.TextField()
    delay_days = models.IntegerField(default=0)

    class Meta:
        ordering = ["step_number"]

    def __str__(self):
        return f"{self.flow.name} - Step {self.step_number}"


class Campaign(models.Model):
    name = models.CharField(max_length=200)
    segment = models.ForeignKey(Segment, on_delete=models.CASCADE)
    flow = models.ForeignKey(Flow, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    customers = models.ManyToManyField(Customer, related_name="campaigns", blank=True)

    def __str__(self):
        return self.name

    def enroll_customers_from_segment(self):
        if self.segment:
            segment_customers = self.segment.get_customers()
            self.customers.add(*segment_customers)
            return segment_customers.count()
        return 0

    @property
    def customer_count(self):
        return self.customers.count()
