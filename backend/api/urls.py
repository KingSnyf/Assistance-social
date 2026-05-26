# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BeneficiaireViewSet, DemandeViewSet,
    InterventionViewSet, DocumentViewSet,
    AgentViewSet, StatsView
)

router = DefaultRouter()
router.register(r'beneficiaires', BeneficiaireViewSet, basename='beneficiaire')
router.register(r'demandes',      DemandeViewSet,      basename='demande')
router.register(r'interventions', InterventionViewSet, basename='intervention')
router.register(r'documents',     DocumentViewSet,     basename='document')
router.register(r'agents',        AgentViewSet,        basename='agent')   # ← AJOUTÉ

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', StatsView.as_view(), name='stats'),                     # ← AJOUTÉ
]