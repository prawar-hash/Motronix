from django.urls import path
from fraud.views import FraudReportView

urlpatterns = [
    # Fraud analysis report for listing
    path('report/<int:listing_id>/', FraudReportView.as_view(), name='fraud_report'),
]
