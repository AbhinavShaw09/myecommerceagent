"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'customers', views.CustomerViewSet)
router.register(r'segments', views.SegmentViewSet)
router.register(r'flows', views.FlowViewSet)
router.register(r'campaigns', views.CampaignViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", views.health_check, name="health_check"),
    path('api/', include(router.urls)),
    path('api/generate/', views.generate_segment_and_campaign, name='generate'),
]
