from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings

from .models import Beneficiaire, Demande, Intervention, Document
from .serializers import (
    BeneficiaireSerializer, DemandeSerializer,
    InterventionSerializer, DocumentSerializer,
    AgentSerializer, RegisterSerializer
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': f'Compte et profil bénéficiaire créés avec succès. Bienvenue, {user.username} !'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_role(self):
        user = self.request.user
        if hasattr(user, 'profile') and hasattr(user.profile, 'role'):
            return user.profile.role
        if user.is_superuser:
            return 'admin'
        if user.is_staff:
            return 'agent'
        return 'citoyen'


class AgentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering = ['username']

    def get_queryset(self):
        return User.objects.filter(
            Q(is_staff=True) | Q(profile__role__in=['agent', 'admin'])
        ).select_related('profile').distinct()


class BeneficiaireViewSet(BaseViewSet):
    serializer_class = BeneficiaireSerializer
    queryset = Beneficiaire.objects.select_related('user')
    filterset_fields = ['pays_residence', 'nationalite']
    search_fields = ['nom', 'prenom', 'email']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.get_role()
        if role in ('admin', 'agent'):
            return qs
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        role = self.get_role()
        if role in ('admin', 'agent', 'citoyen'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()


class DemandeViewSet(BaseViewSet):
    serializer_class = DemandeSerializer
    queryset = Demande.objects.select_related('beneficiaire', 'agent_assigne', 'owner')
    filterset_fields = ['statut', 'type_aide', 'urgence']
    search_fields = ['reference', 'beneficiaire__nom']
    ordering = ['-date_soumission']

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.get_role()
        if role == 'admin':
            return qs
        if role == 'agent':
            return qs.filter(Q(agent_assigne=self.request.user) | Q(statut='soumise'))
        if role == 'citoyen':
            return qs.filter(owner=self.request.user)
        return qs.filter(beneficiaire__user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        role = self.get_role()

        if role == 'citoyen':
            try:
                beneficiaire = user.beneficiaire
            except Beneficiaire.DoesNotExist:
                raise ValidationError({"detail": "Aucun profil bénéficiaire lié à votre compte."})
            serializer.save(owner=user, beneficiaire=beneficiaire)
        else:
            beneficiaire = serializer.validated_data.get('beneficiaire')
            if not beneficiaire:
                raise ValidationError({"beneficiaire": "Ce champ est obligatoire pour les agents/admins."})
            serializer.save(owner=user, beneficiaire=beneficiaire)

    @action(detail=True, methods=['post'])
    def prendre_en_charge(self, request, pk=None):
        if self.get_role() not in ('admin', 'agent'):
            return Response({'error': 'Permissions insuffisantes.'}, status=403)
        demande = self.get_object()
        if demande.statut != 'soumise':
            return Response({'error': 'Seules les demandes soumises peuvent être prises en charge.'}, status=400)
        demande.statut = 'en_cours'
        demande.agent_assigne = request.user
        demande.save()
        return Response({'message': 'Demande prise en charge.'})

    @action(detail=True, methods=['patch'])
    def notes(self, request, pk=None):
        if self.get_role() not in ('admin', 'agent'):
            return Response({'error': 'Permissions insuffisantes.'}, status=403)
        demande = self.get_object()
        demande.notes_internes = request.data.get('notes_internes', demande.notes_internes)
        demande.save()
        return Response({'message': 'Notes sauvegardées.'})

    @action(detail=True, methods=['post'])
    def approuver(self, request, pk=None):
        if self.get_role() not in ('admin', 'agent'):
            return Response({'error': 'Permissions insuffisantes.'}, status=403)
        demande = self.get_object()
        if demande.statut not in ('soumise', 'en_cours'):
            return Response({'error': 'Statut invalide pour approbation.'}, status=400)
        demande.statut = 'approuvee'
        demande.agent_assigne = request.user
        demande.date_traitement = timezone.now()
        demande.save()
        return Response({'message': 'Demande approuvée.'})

    @action(detail=True, methods=['post'])
    def rejeter(self, request, pk=None):
        if self.get_role() not in ('admin', 'agent'):
            return Response({'error': 'Permissions insuffisantes.'}, status=403)
        
        demande = self.get_object()
        if demande.statut not in ('soumise', 'en_cours'):
            return Response({'error': 'Cette demande ne peut plus être rejetée.'}, status=400)
        
        motif_raw = request.data.get('motif_rejet')
        motif = str(motif_raw).strip() if motif_raw is not None else ""
        
        if len(motif) < 10:
            return Response({
                "error": "Motif de rejet invalide",
                "detail": "Veuillez fournir une explication d'au moins 10 caractères."
            }, status=400)
        
        demande.statut = 'rejetee'
        demande.agent_assigne = request.user
        demande.motif_rejet = motif
        demande.date_traitement = timezone.now()
        demande.save()

        self._envoyer_notification_rejet(demande, motif)

        return Response({
            'success': True,
            'message': 'Demande rejetée avec succès.',
            'notification_envoyee': True
        })

    def _envoyer_notification_rejet(self, demande, motif):
        beneficiaire = demande.beneficiaire
        if not beneficiaire.email:
            return

        sujet = f"⚠️ Mise à jour de votre demande {demande.reference}"
        message = (
            f"Bonjour {beneficiaire.prenom},\n\n"
            f"Votre demande ({demande.get_type_aide_display()}) a été rejetée.\n"
            f"Motif : {motif}\n\n"
            f"Cordialement,\nL'équipe d'Assistance Sociale."
        )
        print(f"\n📧 NOTIFICATION SIMULÉE À {beneficiaire.email}:\n{motif}\n")
        # send_mail(sujet, message, settings.DEFAULT_FROM_EMAIL, [beneficiaire.email])


class InterventionViewSet(BaseViewSet):
    serializer_class = InterventionSerializer
    queryset = Intervention.objects.select_related('demande')
    ordering = ['-date_realisation']


class DocumentViewSet(BaseViewSet):
    serializer_class = DocumentSerializer
    queryset = Document.objects.select_related('demande')
    ordering = ['-date_upload']


class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'profile') and hasattr(request.user.profile, 'role'):
            role_name = request.user.profile.role
        else:
            role_name = 'citoyen'
        
        if role_name not in ['admin', 'agent']:
            return Response({'error': 'Accès réservé au personnel.'}, status=403)
            
        return Response({
            'total_beneficiaires': Beneficiaire.objects.count(),
            'total_demandes': Demande.objects.count(),
            'demandes_soumises': Demande.objects.filter(statut='soumise').count(),
            'demandes_approuvees': Demande.objects.filter(statut='approuvee').count(),
            'demandes_rejetees': Demande.objects.filter(statut='rejetee').count(),
            'total_agents': User.objects.filter(is_staff=True).count(),
        })