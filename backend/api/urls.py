# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BeneficiaireViewSet, DemandeViewSet, InterventionViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r'beneficiaires', BeneficiaireViewSet, basename='beneficiaire')
router.register(r'demandes', DemandeViewSet, basename='demande')
router.register(r'interventions', InterventionViewSet, basename='intervention')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]