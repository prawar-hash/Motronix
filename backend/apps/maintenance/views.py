from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from maintenance.models import ServiceRecord
from maintenance.serializers import ServiceRecordSerializer, MaintenancePredictQuerySerializer
from ml.maintenance_predictor import predict_next_maintenance

class ServiceRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for managing service records logged by the authenticated bike owner."""
    serializer_class = ServiceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filters service records, returning only those owned by the current authenticated user."""
        return ServiceRecord.objects.filter(bike_owner=self.request.user).order_by('-service_date')

    def perform_create(self, serializer):
        """Associates the new service record with the current user on save."""
        serializer.save(bike_owner=self.request.user)

class MaintenancePredictionView(APIView):
    """API endpoint to predict the next due service date, mileage, and estimated costs."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Predict Next Service due",
        description="Analyzes the user's historical service records and projects next service timeline based on current mileage.",
        parameters=[
            OpenApiParameter(name='current_mileage', description='Current mileage of the bike', required=True, type=float)
        ],
        responses={200: dict}
    )
    def get(self, request):
        """Calculates prediction using current_mileage parameter and logged service records."""
        current_mileage_str = request.query_params.get('current_mileage', None)
        
        if not current_mileage_str:
            return Response(
                {"error": "Missing current_mileage query parameter."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            current_mileage = float(current_mileage_str)
            if current_mileage < 0:
                raise ValueError()
        except ValueError:
            return Response(
                {"error": "current_mileage must be a positive number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Retrieve user service history
        records = ServiceRecord.objects.filter(bike_owner=request.user).order_by('service_date')
        
        # Serialize history into simple list of dicts for the ML module
        service_history = []
        for r in records:
            service_history.append({
                'service_date': r.service_date.strftime('%Y-%m-%d'),
                'service_type': r.service_type,
                'mileage': float(r.mileage),
                'cost': float(r.cost)
            })

        # Run prediction engine
        prediction_result = predict_next_maintenance(
            current_mileage=current_mileage,
            service_history=service_history
        )

        return Response(prediction_result, status=status.HTTP_200_OK)
