from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Beneficiaire, Demande, Intervention, Document, Profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label="Confirmer le mot de passe")

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return data

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un compte avec cet email existe déjà.")
        return value

    def create(self, validated_data):
        validated_data.pop('password2', None)
        user = User.objects.create_user(**validated_data)
        
        # Création explicite du Profile avec rôle 'citoyen'
        Profile.objects.get_or_create(user=user, defaults={'role': 'citoyen'})
        
        Beneficiaire.objects.get_or_create(
            user=user,
            defaults={
                'nom': validated_data.get('last_name') or user.username,
                'prenom': validated_data.get('first_name') or 'Non spécifié',
                'email': validated_data.get('email', ''),
                'pays_residence': 'Non spécifié',
            }
        )
        return user


class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        if hasattr(user, 'profile'):
            token['role'] = user.profile.role
        else:
            token['role'] = 'citoyen'
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class AgentSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'role', 'is_active', 'is_staff', 'date_joined']

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.username

    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.get_role_display()
        if obj.is_superuser:
            return 'Administrateur'
        if obj.is_staff:
            return 'Agent Social'
        return 'Citoyen'


class BeneficiaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiaire
        fields = ['id', 'prenom', 'nom', 'email', 'telephone', 'date_naissance', 
                  'nationalite', 'pays_residence', 'situation_familiale', 'revenus_mensuels', 'created_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DemandeSerializer(serializers.ModelSerializer):
    beneficiaire_nom = serializers.CharField(source='beneficiaire.nom', read_only=True)
    beneficiaire_prenom = serializers.CharField(source='beneficiaire.prenom', read_only=True)
    agent_nom = serializers.CharField(source='agent_assigne.username', read_only=True)

    class Meta:
        model = Demande
        fields = ['id', 'reference', 'beneficiaire', 'type_aide', 'montant_demande', 
                  'motif', 'urgence', 'statut', 'motif_rejet', 'notes_internes', 
                  'agent_assigne', 'owner', 'date_soumission', 'date_traitement',
                  'beneficiaire_nom', 'beneficiaire_prenom', 'agent_nom']
        read_only_fields = ['id', 'reference', 'owner', 'date_soumission', 'date_traitement', 'statut', 'agent_assigne', 'motif_rejet', 'notes_internes']

    def validate_montant_demande(self, value):
        if value < 10:
            raise serializers.ValidationError("Le montant minimum est de 10 USD.")
        if value > 10000:
            raise serializers.ValidationError("Le montant maximum est de 10 000 USD.")
        return value


class InterventionSerializer(serializers.ModelSerializer):
    demande_reference = serializers.CharField(source='demande.reference', read_only=True)
    class Meta:
        model = Intervention
        fields = ['id', 'demande', 'type_intervention', 'montant_accorde', 'date_realisation', 'description', 'document_justificatif', 'created_at', 'demande_reference']
        read_only_fields = ['id', 'created_at']


class DocumentSerializer(serializers.ModelSerializer):
    demande_reference = serializers.CharField(source='demande.reference', read_only=True)
    class Meta:
        model = Document
        fields = ['id', 'demande', 'type_document', 'fichier', 'date_upload', 'verifie', 'commentaire', 'demande_reference']
        read_only_fields = ['id', 'date_upload']