# api/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Beneficiaire, Demande, Intervention, Document
from .serializers import (
    BeneficiaireSerializer, DemandeSerializer, 
    InterventionSerializer, DocumentSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permission personnalisée : lecture publique, écriture réservée au propriétaire"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user or request.user.is_staff


class BeneficiaireViewSet(viewsets.ModelViewSet):
    """ViewSet CRUD pour Beneficiaire"""
    serializer_class = BeneficiaireSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pays_residence', 'nationalite']
    search_fields = ['nom', 'prenom', 'email', 'telephone']
    ordering_fields = ['nom', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filtrage par propriétaire (CONTRAINTE M. KINKEU)"""
        queryset = Beneficiaire.objects.all()
        if not self.request.user.is_superuser:
            # Un agent/citoyen ne voit que ses bénéficiaires liés
            queryset = queryset.filter(user=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        """Lier automatiquement le bénéficiaire à l'utilisateur créateur"""
        serializer.save(user=self.request.user)


class DemandeViewSet(viewsets.ModelViewSet):
    """ViewSet CRUD pour Demande avec actions personnalisées"""
    serializer_class = DemandeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['statut', 'type_aide', 'urgence', 'agent_assigne']
    search_fields = ['reference', 'motif', 'beneficiaire__nom', 'beneficiaire__prenom']
    ordering_fields = ['date_soumission', 'montant_demande', 'urgence']
    ordering = ['-date_soumission']
    
    def get_queryset(self):
        """Filtrage par propriétaire (CONTRAINTE M. KINKEU)"""
        queryset = Demande.objects.select_related('beneficiaire', 'agent_assigne')
        if not self.request.user.is_superuser:
            # Un utilisateur ne voit que SES demandes (owner) OU celles qui lui sont assignées
            queryset = queryset.filter(owner=self.request.user) | queryset.filter(agent_assigne=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        """Attribution automatique de l'owner"""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approuver(self, request, pk=None):
        """Action personnalisée : approuver une demande"""
        demande = self.get_object()
        if demande.statut != 'soumise':
            return Response({'error': 'Seules les demandes soumises peuvent être approuvées.'}, status=400)
        demande.statut = 'approuvee'
        demande.agent_assigne = request.user
        demande.save()
        return Response({'message': f'Demande {demande.reference} approuvée.'})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rejeter(self, request, pk=None):
        """Action personnalisée : rejeter une demande"""
        demande = self.get_object()
        if demande.statut != 'soumise':
            return Response({'error': 'Seules les demandes soumises peuvent être rejetées.'}, status=400)
        demande.statut = 'rejetee'
        demande.agent_assigne = request.user
        demande.save()
        return Response({'message': f'Demande {demande.reference} rejetée.'})
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def documents(self, request, pk=None):
        """Action personnalisée : lister les documents d'une demande"""
        demande = self.get_object()
        documents = Document.objects.filter(demande=demande)
        serializer = DocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)


class InterventionViewSet(viewsets.ModelViewSet):
    """ViewSet CRUD pour Intervention"""
    serializer_class = InterventionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type_intervention', 'date_realisation']
    ordering_fields = ['date_realisation', 'montant_accorde']
    ordering = ['-date_realisation']
    
    def get_queryset(self):
        """Filtrage par propriétaire via la demande liée"""
        queryset = Intervention.objects.select_related('demande__beneficiaire')
        if not self.request.user.is_superuser:
            queryset = queryset.filter(
                demande__owner=self.request.user
            ) | queryset.filter(
                demande__agent_assigne=self.request.user
            )
        return queryset


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet CRUD pour Document"""
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['verifie', 'type_document']
    ordering_fields = ['date_upload']
    ordering = ['-date_upload']
    
    def get_queryset(self):
        """Filtrage par propriétaire via la demande liée"""
        queryset = Document.objects.select_related('demande')
        if not self.request.user.is_superuser:
            queryset = queryset.filter(
                demande__owner=self.request.user
            ) | queryset.filter(
                demande__agent_assigne=self.request.user
            )
        return queryset