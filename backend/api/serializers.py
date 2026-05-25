from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Beneficiaire, Demande, Intervention, Document, STATUT_CHOICES, TYPE_AIDE_CHOICES, URGENCE_CHOICES


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class CustomTokenSerializer(TokenObtainPairSerializer):
    """Injecte le rôle de l'utilisateur dans le token JWT"""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        if hasattr(user, 'profile'):
            token['role'] = user.profile.role
        else:
            token['role'] = 'citoyen'
        return token


class BeneficiaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiaire
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def validate_email(self, value):
        if value and Beneficiaire.objects.filter(email=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Un bénéficiaire avec cet email existe déjà.")
        return value


class DemandeSerializer(serializers.ModelSerializer):
    beneficiaire_nom = serializers.CharField(source='beneficiaire.nom', read_only=True)
    beneficiaire_prenom = serializers.CharField(source='beneficiaire.prenom', read_only=True)
    agent_nom = serializers.CharField(source='agent_assigne.username', read_only=True)
    
    class Meta:
        model = Demande
        fields = '__all__'
        read_only_fields = ['id', 'reference', 'owner', 'date_soumission', 'date_traitement']
    
    def validate_montant_demande(self, value):
        if value < 10:
            raise serializers.ValidationError("Le montant minimum est de 10 USD.")
        if value > 10000:
            raise serializers.ValidationError("Le montant maximum est de 10 000 USD.")
        return value
    
    def create(self, validated_data):
        request = self.context['request']
        validated_data['owner'] = request.user
        return super().create(validated_data)


class InterventionSerializer(serializers.ModelSerializer):
    demande_reference = serializers.CharField(source='demande.reference', read_only=True)
    
    class Meta:
        model = Intervention
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class DocumentSerializer(serializers.ModelSerializer):
    demande_reference = serializers.CharField(source='demande.reference', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['id', 'date_upload']