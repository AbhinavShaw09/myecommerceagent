from rest_framework import serializers
from .models import Customer, Segment, Flow, FlowStep, Campaign

class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    days_since_last_order = serializers.ReadOnlyField()
    
    class Meta:
        model = Customer
        fields = '__all__'

class SegmentSerializer(serializers.ModelSerializer):
    customer_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Segment
        fields = '__all__'
    
    def get_customer_count(self, obj):
        return obj.get_customers().count()

class FlowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlowStep
        fields = '__all__'

class FlowSerializer(serializers.ModelSerializer):
    steps = FlowStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = Flow
        fields = '__all__'

class CampaignSerializer(serializers.ModelSerializer):
    segment_name = serializers.CharField(source='segment.name', read_only=True)
    flow_name = serializers.CharField(source='flow.name', read_only=True)
    
    class Meta:
        model = Campaign
        fields = '__all__'
