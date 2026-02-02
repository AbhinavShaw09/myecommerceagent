from django.core.management.base import BaseCommand
from customers.models import Customer
from datetime import datetime, timedelta
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Create sample customer data'

    def handle(self, *args, **options):
        # Sample customer data
        customers_data = [
            {
                'email': 'john.doe@gmail.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'phone': '555-0101',
                'city': 'Austin',
                'state': 'TX',
                'lifetime_value': 1250.00,
                'total_orders': 8,
                'last_order_date': timezone.now() - timedelta(days=45),
                'email_subscribed': True,
            },
            {
                'email': 'jane.smith@yahoo.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'phone': '555-0102',
                'city': 'Dallas',
                'state': 'TX',
                'lifetime_value': 890.50,
                'total_orders': 5,
                'last_order_date': timezone.now() - timedelta(days=75),
                'email_subscribed': True,
            },
            {
                'email': 'mike.johnson@gmail.com',
                'first_name': 'Mike',
                'last_name': 'Johnson',
                'phone': '555-0103',
                'city': 'Houston',
                'state': 'TX',
                'lifetime_value': 2100.75,
                'total_orders': 12,
                'last_order_date': timezone.now() - timedelta(days=20),
                'email_subscribed': True,
            },
            {
                'email': 'sarah.wilson@hotmail.com',
                'first_name': 'Sarah',
                'last_name': 'Wilson',
                'phone': '555-0104',
                'city': 'San Antonio',
                'state': 'TX',
                'lifetime_value': 450.25,
                'total_orders': 3,
                'last_order_date': timezone.now() - timedelta(days=90),
                'email_subscribed': False,
            },
            {
                'email': 'david.brown@gmail.com',
                'first_name': 'David',
                'last_name': 'Brown',
                'phone': '555-0105',
                'city': 'Los Angeles',
                'state': 'CA',
                'lifetime_value': 1800.00,
                'total_orders': 10,
                'last_order_date': timezone.now() - timedelta(days=15),
                'email_subscribed': True,
            },
        ]

        for customer_data in customers_data:
            customer, created = Customer.objects.get_or_create(
                email=customer_data['email'],
                defaults=customer_data
            )
            if created:
                self.stdout.write(f'Created customer: {customer.full_name}')
            else:
                self.stdout.write(f'Customer already exists: {customer.full_name}')

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
