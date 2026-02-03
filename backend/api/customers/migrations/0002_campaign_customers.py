# Generated manually on 2026-02-03

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("customers", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="campaign",
            name="customers",
            field=models.ManyToManyField(
                blank=True, related_name="campaigns", to="customers.customer"
            ),
        ),
    ]
