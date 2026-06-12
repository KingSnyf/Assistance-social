from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
import uuid

STATUT_CHOICES = [
    ('soumise', '📝 Soumise'),
    ('en_cours', '⏳ En cours'),
    ('approuvee', '✅ Approuvée'),
    ('rejetee', '❌ Rejetée'),
]

TYPE_AIDE_CHOICES = [
    ('financiere', '💰 Aide financière'),
    ('alimentaire', '🍽️ Aide alimentaire'),
    ('medicale', '🏥 Assistance médicale'),
    ('logement', '🏠 Aide au logement'),
    ('accompagnement', '🧠 Accompagnement'),
]

URGENCE_CHOICES = [
    ('faible', '🟢 Faible'),
    ('normal', '🟠 Normal'),
    ('urgent', '🔴 Urgent'),
]

ROLE_CHOICES = [
    ('admin', 'Administrateur'),
    ('agent', 'Agent Social'),
    ('citoyen', 'Citoyen'),
]


class Beneficiaire(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prenom = models.CharField(max_length=100)
    nom = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    date_naissance = models.DateField(null=True, blank=True)
    nationalite = models.CharField(max_length=100, default='Non spécifiée', blank=True)
    pays_residence = models.CharField(max_length=100)
    situation_familiale = models.CharField(max_length=100, blank=True, null=True)
    revenus_mensuels = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # ✅ 1 User = 1 Bénéficiaire
    # Remets ça temporairement :
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='beneficiaire', null=True, blank=True)
    
    class Meta:
        ordering = ['nom', 'prenom']
        verbose_name = 'Bénéficiaire'
        verbose_name_plural = 'Bénéficiaires'
    
    def __str__(self):
        return f"{self.prenom} {self.nom}"


class Demande(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=20, unique=True, editable=False)
    beneficiaire = models.ForeignKey(Beneficiaire, on_delete=models.CASCADE, related_name='demandes')
    type_aide = models.CharField(max_length=20, choices=TYPE_AIDE_CHOICES)
    montant_demande = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    motif = models.TextField()
    urgence = models.CharField(max_length=10, choices=URGENCE_CHOICES, default='normal')
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='soumise')
    
    # ✅ Champs optionnels pour éviter les erreurs NOT NULL
    motif_rejet = models.TextField(blank=True, null=True, default='')
    notes_internes = models.TextField(blank=True, null=True, default='')
    
    agent_assigne = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='demandes_assignees')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='demandes_possedees')
    date_soumission = models.DateTimeField(auto_now_add=True)
    date_traitement = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-date_soumission']
        verbose_name = 'Demande'
        verbose_name_plural = 'Demandes'
    
    def save(self, *args, **kwargs):
        if not self.reference:
            unique_id = str(self.id).split('-')[0].upper()
            self.reference = f"SC-{unique_id}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.reference} — {self.beneficiaire} ({self.get_statut_display()})"


class Intervention(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    demande = models.OneToOneField(Demande, on_delete=models.CASCADE, related_name='intervention')
    type_intervention = models.CharField(max_length=20, choices=TYPE_AIDE_CHOICES)
    montant_accorde = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    date_realisation = models.DateField()
    description = models.TextField(blank=True)
    document_justificatif = models.FileField(upload_to='interventions/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Intervention'
        verbose_name_plural = 'Interventions'
    
    def __str__(self):
        return f"Intervention {self.demande.reference} — {self.montant_accorde}€"


class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    demande = models.ForeignKey(Demande, on_delete=models.CASCADE, related_name='documents')
    type_document = models.CharField(max_length=100)
    fichier = models.FileField(upload_to='documents/%Y/%m/')
    date_upload = models.DateTimeField(auto_now_add=True)
    verifie = models.BooleanField(default=False)
    commentaire = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-date_upload']
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
    
    def __str__(self):
        return f"{self.type_document} — {self.demande.reference}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citoyen')
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"