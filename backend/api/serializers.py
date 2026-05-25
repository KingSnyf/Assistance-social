# api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Beneficiaire, Demande, Intervention, Document, STATUT_CHOICES, TYPE_AIDE_CHOICES, URGENCE_CHOICES


class UserSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'utilisateur (lecture seule)"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class BeneficiaireSerializer(serializers.ModelSerializer):
    """Sérialiseur Bénéficiaire avec validation métier"""
    class Meta:
        model = Beneficiaire
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def validate_email(self, value):
        """Validation : email unique si fourni"""
        if value and Beneficiaire.objects.filter(email=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Un bénéficiaire avec cet email existe déjà.")
        return value
    
    def validate_telephone(self, value):
        """Validation : format téléphone basique"""
        if value and not value.replace(' ', '').replace('-', '').replace('+', '').isdigit():
            raise serializers.ValidationError("Numéro de téléphone invalide.")
        return value


class DemandeSerializer(serializers.ModelSerializer):
    """Sérialiseur Demande avec validation métier COMPLÈTE"""
    beneficiaire_nom = serializers.CharField(source='beneficiaire.nom', read_only=True)
    beneficiaire_prenom = serializers.CharField(source='beneficiaire.prenom', read_only=True)
    agent_nom = serializers.CharField(source='agent_assigne.username', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    type_aide_display = serializers.CharField(source='get_type_aide_display', read_only=True)
    urgence_display = serializers.CharField(source='get_urgence_display', read_only=True)
    
    class Meta:
        model = Demande
        fields = '__all__'
        read_only_fields = ['id', 'reference', 'owner', 'date_soumission', 'date_traitement']
    
    def validate_montant_demande(self, value):
        """Validation : montant minimum et maximum selon le type d'aide"""
        if value < 10:
            raise serializers.ValidationError("Le montant minimum demandé est de 10 USD.")
        if value > 10000:
            raise serializers.ValidationError("Le montant maximum autorisé est de 10 000 USD. Contactez un superviseur pour des montants supérieurs.")
        return value
    
    def validate(self, data):
        """Validation globale : règles métier transversales"""
        type_aide = data.get('type_aide')
        urgence = data.get('urgence')
        motif = data.get('motif', '')
        
        # Règle 1 : Une demande urgente doit avoir un motif détaillé (min 50 caractères)
        if urgence == 'urgent' and len(motif) < 50:
            raise serializers.ValidationError({
                'motif': "Pour une demande urgente, veuillez décrire la situation en détail (minimum 50 caractères)."
            })
        
        # Règle 2 : L'aide médicale ne peut pas être marquée comme "faible" urgence
        if type_aide == 'medicale' and urgence == 'faible':
            raise serializers.ValidationError({
                'urgence': "Une assistance médicale ne peut pas être classée en urgence faible."
            })
        
        # Règle 3 : Un bénéficiaire ne peut pas avoir plus de 3 demandes en cours simultanément
        beneficiaire = self.context['request'].user.beneficiaire if hasattr(self.context['request'].user, 'beneficiaire') else None
        if beneficiaire and not self.instance:  # Création seulement
            en_cours = Demande.objects.filter(beneficiaire=beneficiaire, statut__in=['soumise', 'en_cours']).count()
            if en_cours >= 3:
                raise serializers.ValidationError({
                    'non_field_errors': "Vous avez déjà 3 demandes en cours. Veuillez attendre leur traitement avant d'en soumettre une nouvelle."
                })
        
        return data
    
    def create(self, validated_data):
        """Création : attribution automatique de l'owner et de la référence"""
        request = self.context['request']
        validated_data['owner'] = request.user
        return super().create(validated_data)


class InterventionSerializer(serializers.ModelSerializer):
    """Sérialiseur Intervention"""
    demande_reference = serializers.CharField(source='demande.reference', read_only=True)
    
    class Meta:
        model = Intervention
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
    
    def validate_montant_accorde(self, value):
        """Validation : le montant accordé ne peut pas dépasser le montant demandé"""
        demande = self.initial_data.get('demande')
        if demande and hasattr(demande, 'montant_demande'):
            if value > demande.montant_demande:
                raise serializers.ValidationError(
                    f"Le montant accordé ({value}) ne peut pas dépasser le montant demandé ({demande.montant_demande})."
                )
        return value
    
    def validate(self, data):
        """Validation : une intervention ne peut être créée que pour une demande approuvée"""
        demande = data.get('demande')
        if demande and demande.statut != 'approuvee':
            raise serializers.ValidationError({
                'demande': "Une intervention ne peut être créée que pour une demande approuvée."
            })
        return data


class DocumentSerializer(serializers.ModelSerializer):
    """Sérialiseur Document"""
    demande_reference = serializers.CharField(source='demande.reference', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['id', 'date_upload']
    
    def validate_fichier(self, value):
        """Validation : type et taille de fichier"""
        # Taille max : 10 MB
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Le fichier ne doit pas dépasser 10 Mo.")
        # Extensions autorisées
        ext = value.name.split('.')[-1].lower()
        if ext not in ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']:
            raise serializers.ValidationError("Format de fichier non autorisé. Utilisez PDF, JPG, PNG ou DOC.")
        return value