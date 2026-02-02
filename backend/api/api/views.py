"""Health check views for the API."""

from datetime import datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


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
