from django.urls import path
from riding_style.views import RideDataHistoryView, RideUploadView, RideTemplateDownloadView

urlpatterns = [
    # Get ride log uploads history
    path('history/', RideDataHistoryView.as_view(), name='riding_style_history'),
    
    # Upload and analyze ride CSV
    path('upload/', RideUploadView.as_view(), name='riding_style_upload'),
    
    # Download CSV template
    path('template/', RideTemplateDownloadView.as_view(), name='riding_style_template'),
]
