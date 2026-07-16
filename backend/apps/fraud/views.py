from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from fraud.models import FraudFlag
from fraud.serializers import FraudFlagSerializer
from listings.models import BikeListing

class FraudReportView(APIView):
    """API endpoint to retrieve the fraud evaluation report for a specific listing."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get Listing Fraud Report",
        description="Retrieves the calculated fraud risk score, label, and suspicious signals flagged for a listing.",
        responses={200: FraudFlagSerializer}
    )
    def get(self, request, listing_id):
        """Fetches the latest fraud report linked to the given listing ID."""
        listing = get_object_or_404(BikeListing, id=listing_id)
        
        # Retrieve the latest fraud report associated with the listing
        fraud_flag = FraudFlag.objects.filter(listing=listing).order_by('-created_at').first()
        
        if not fraud_flag:
            return Response(
                {"error": "No fraud report found for this listing."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = FraudFlagSerializer(fraud_flag)
        return Response(serializer.data, status=status.HTTP_200_OK)
