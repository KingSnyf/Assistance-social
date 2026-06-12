from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, AgentViewSet, BeneficiaireViewSet, 
    DemandeViewSet, InterventionViewSet, DocumentViewSet, StatsView
)

router = DefaultRouter()
router.register(r'agents', AgentViewSet, basename='agent')
router.register(r'beneficiaires', BeneficiaireViewSet, basename='beneficiaire')
router.register(r'demandes', DemandeViewSet, basename='demande')
router.register(r'interventions', InterventionViewSet, basename='intervention')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
    path('stats/', StatsView.as_view(), name='stats'),
]