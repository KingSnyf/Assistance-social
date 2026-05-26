# api/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.utils import timezone

from .models import Beneficiaire, Demande, Intervention, Document
from .serializers import (
    BeneficiaireSerializer, DemandeSerializer,
    InterventionSerializer, DocumentSerializer,
    AgentSerializer
)


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_role(self):
        user = self.request.user
        return getattr(user.profile, 'role', 'citoyen') if hasattr(user, 'profile') else 'citoyen'


# ── Agents (Users is_staff ou rôle agent/admin) ───────────────────────────────
class AgentViewSet(viewsets.ReadOnlyModelViewSet):
    """Liste des agents — lecture seule, réservé aux admins et agents."""
    serializer_class   = AgentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['username', 'first_name', 'last_name', 'email']
    ordering           = ['username']

    def get_queryset(self):
        # Retourne tous les users qui sont staff OU qui ont un profil agent/admin
        from django.db.models import Q
        return User.objects.filter(
            Q(is_staff=True) | Q(profile__role__in=['agent', 'admin'])
        ).select_related('profile').distinct()


# ── Bénéficiaires ─────────────────────────────────────────────────────────────
class BeneficiaireViewSet(BaseViewSet):
    serializer_class = BeneficiaireSerializer
    queryset         = Beneficiaire.objects.select_related('user')
    filterset_fields = ['pays_residence', 'nationalite']
    search_fields    = ['nom', 'prenom', 'email']
    ordering         = ['-created_at']

    def get_queryset(self):
        qs   = super().get_queryset()
        role = self.get_role()
        if role in ('admin', 'agent'):
            return qs
        return qs.filter(user=self.request.user)


# ── Demandes ──────────────────────────────────────────────────────────────────
class DemandeViewSet(BaseViewSet):
    serializer_class = DemandeSerializer
    queryset         = Demande.objects.select_related('beneficiaire', 'agent_assigne', 'owner')
    filterset_fields = ['statut', 'type_aide', 'urgence']
    search_fields    = ['reference', 'beneficiaire__nom']
    ordering         = ['-date_soumission']

    def get_queryset(self):
        qs   = super().get_queryset()
        role = self.get_role()
        if role == 'admin':
            return qs
        if role == 'agent':
            return qs.filter(agent_assigne=self.request.user) | qs.filter(statut='soumise')
        if role == 'citoyen':
            return qs.filter(owner=self.request.user)
        return qs.filter(beneficiaire__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def approuver(self, request, pk=None):
        demande = self.get_object()
        if demande.statut != 'soumise':
            return Response(
                {'error': 'Seules les demandes soumises peuvent être approuvées.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        demande.statut         = 'approuvee'
        demande.agent_assigne  = request.user
        demande.date_traitement = timezone.now()
        demande.save()
        return Response({'message': 'Demande approuvée.'})

    @action(detail=True, methods=['post'])
    def rejeter(self, request, pk=None):
        demande = self.get_object()
        if demande.statut != 'soumise':
            return Response(
                {'error': 'Seules les demandes soumises peuvent être rejetées.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        demande.statut          = 'rejetee'
        demande.agent_assigne   = request.user
        demande.date_traitement = timezone.now()
        demande.save()
        return Response({'message': 'Demande rejetée.'})


# ── Interventions ─────────────────────────────────────────────────────────────
class InterventionViewSet(BaseViewSet):
    serializer_class = InterventionSerializer
    queryset         = Intervention.objects.select_related('demande')
    ordering         = ['-date_realisation']


# ── Documents ─────────────────────────────────────────────────────────────────
class DocumentViewSet(BaseViewSet):
    serializer_class = DocumentSerializer
    queryset         = Document.objects.select_related('demande')
    ordering         = ['-date_upload']


# ── Stats dashboard ───────────────────────────────────────────────────────────
class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'total_beneficiaires': Beneficiaire.objects.count(),
            'total_demandes':      Demande.objects.count(),
            'demandes_soumises':   Demande.objects.filter(statut='soumise').count(),
            'demandes_approuvees': Demande.objects.filter(statut='approuvee').count(),
            'demandes_rejetees':   Demande.objects.filter(statut='rejetee').count(),
            'total_agents':        User.objects.filter(is_staff=True).count(),
        })