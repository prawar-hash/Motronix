import os
import datetime
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponse
from rest_framework import permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from riding_style.models import RideData
from riding_style.serializers import RideDataSerializer
from ml.riding_style_classifier import classify_riding_style, get_csv_template

class RideDataHistoryView(generics.ListAPIView):
    """API endpoint to retrieve the user's previous ride analysis reports."""
    serializer_class = RideDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Returns only the authenticated user's uploaded ride logs."""
        return RideData.objects.filter(user=self.request.user).order_by('-created_at')

class RideUploadView(APIView):
    """API endpoint to upload and analyze ride sensor data CSV files."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Upload and Analyze Ride data",
        description="Uploads a CSV file with ride details. Analyzes and returns riding style with tips.",
        responses={201: dict}
    )
    def post(self, request):
        """Validates CSV file size/format, saves to user-scoped folder, and triggers ML style classification."""
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
            
        file_obj = request.FILES['file']
        
        # 1. Validate File Size (Max 5MB)
        if file_obj.size > 5 * 1024 * 1024:
            return Response({'error': 'File size exceeds 5MB limit.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # 2. Validate MIME Type & Extension
        content_type = file_obj.content_type
        # Some OS upload CSV files as text/plain or application/vnd.ms-excel. We allow standard CSV descriptors.
        allowed_types = ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel']
        if content_type not in allowed_types:
            return Response({'error': 'Invalid file format. Please upload a valid CSV file.'}, status=status.HTTP_400_BAD_REQUEST)
            
        ext = file_obj.name.split('.')[-1].lower()
        if ext != 'csv':
            return Response({'error': 'File must have a .csv extension.'}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Create user-scoped folder to isolate file access
        user_upload_dir = os.path.join(settings.BASE_DIR, 'uploads', 'rides', f"user_{request.user.id}")
        os.makedirs(user_upload_dir, exist_ok=True)
        
        # Generate unique file name to prevent namespace collisions
        timestamp_str = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"ride_{timestamp_str}.csv"
        file_path = os.path.join(user_upload_dir, safe_filename)
        
        # Save file to disk
        fs = FileSystemStorage(location=user_upload_dir)
        filename = fs.save(safe_filename, file_obj)
        saved_file_path = fs.path(filename)

        try:
            # 4. Decoupled ML Classification
            analysis = classify_riding_style(saved_file_path)
            
            # 5. Save the analysis entry to database
            ride_entry = RideData.objects.create(
                user=request.user,
                uploaded_file_ref=f"uploads/rides/user_{request.user.id}/{safe_filename}",
                riding_style=analysis['riding_style'],
                suggestions=analysis['suggestions']
            )
            
            # Combine analysis metadata and response
            response_data = {
                'id': ride_entry.id,
                'riding_style': analysis['riding_style'],
                'features': analysis['features'],
                'suggestions': analysis['suggestions'],
                'created_at': ride_entry.created_at
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except ValueError as ve:
            # Clean up uploaded file on error
            if os.path.exists(saved_file_path):
                os.remove(saved_file_path)
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            if os.path.exists(saved_file_path):
                os.remove(saved_file_path)
            return Response({'error': f"Failed to analyze ride data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RideTemplateDownloadView(APIView):
    """API endpoint to download the CSV template structure for ride data."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Download Ride CSV Template",
        description="Returns the CSV headers and sample rows to guide user uploads."
    )
    def get(self, request):
        """Returns the CSV template string formatted as a file download response."""
        csv_content = get_csv_template()
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="bikeai_ride_template.csv"'
        return response
