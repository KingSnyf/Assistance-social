from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils import timezone
from .models import Profile, Beneficiaire, Demande, Intervention, Document

# Inline pour afficher le profile dans User
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'

# Désenregistrement et réenregistrement
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# OU simplement enregistrer Profile séparément
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'get_email']
    
    def get_email(self, obj):
        return obj.user.email


@admin.register(Beneficiaire)
class BeneficiaireAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prenom', 'email', 'pays_residence', 'date_naissance', 'created_at']
    list_filter = ['pays_residence', 'created_at']
    search_fields = ['nom', 'prenom', 'email', 'telephone']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['nom', 'prenom']
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('prenom', 'nom', 'email', 'telephone', 'date_naissance', 'nationalite')
        }),
        ('Situation', {
            'fields': ('pays_residence', 'situation_familiale', 'revenus_mensuels')
        }),
        ('Métadonnées', {
            'fields': ('user', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Demande)
class DemandeAdmin(admin.ModelAdmin):
    list_display = ['reference', 'beneficiaire_display', 'type_aide', 'montant_demande', 'urgence_colored', 'statut_colored', 'agent_assigne', 'date_soumission']
    list_filter = ['statut', 'type_aide', 'urgence', 'beneficiaire__pays_residence', 'date_soumission']
    search_fields = ['reference', 'beneficiaire__nom', 'beneficiaire__prenom', 'motif']
    readonly_fields = ['reference', 'date_soumission', 'date_traitement', 'owner']
    ordering = ['-date_soumission']
    list_per_page = 25
    
    fieldsets = (
        ('Identification', {
            'fields': ('reference', 'beneficiaire', 'owner'),
            'description': 'Champs en lecture seule'
        }),
        ('Détails de la demande', {
            'fields': ('type_aide', 'montant_demande', 'motif', 'urgence')
        }),
        ('Traitement', {
            'fields': ('statut', 'agent_assigne', 'date_traitement', 'notes_internes')
        }),
    )
    
    def beneficiaire_display(self, obj):
        return f"{obj.beneficiaire.prenom} {obj.beneficiaire.nom}"
    beneficiaire_display.short_description = 'Bénéficiaire'
    
    def urgence_colored(self, obj):
        colors = {'faible': 'green', 'normal': 'orange', 'urgent': 'red'}
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.urgence, 'black'),
            obj.get_urgence_display()
        )
    urgence_colored.short_description = 'Urgence'
    
    def statut_colored(self, obj):
        colors = {'soumise': 'blue', 'en_cours': 'orange', 'approuvee': 'green', 'rejetee': 'red'}
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.statut, 'black'),
            obj.get_statut_display()
        )
    statut_colored.short_description = 'Statut'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if request.user.groups.filter(name='Agents').exists():
            return qs.filter(agent_assigne=request.user)
        return qs.filter(owner=request.user)
    
    def save_model(self, request, obj, form, change):
        if obj.statut in ['approuvee', 'rejetee'] and not obj.date_traitement:
            obj.date_traitement = timezone.now()
        if not obj.agent_assigne and request.user.groups.filter(name='Agents').exists():
            obj.agent_assigne = request.user
        super().save_model(request, obj, form, change)


@admin.register(Intervention)
class InterventionAdmin(admin.ModelAdmin):
    list_display = ['demande_reference', 'type_intervention', 'montant_accorde', 'date_realisation', 'created_at']
    list_filter = ['type_intervention', 'date_realisation']
    search_fields = ['demande__reference', 'description']
    readonly_fields = ['created_at']
    
    def demande_reference(self, obj):
        return obj.demande.reference
    demande_reference.short_description = 'Demande'


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['type_document', 'demande_reference', 'date_upload', 'verifie', 'fichier_link']
    list_filter = ['verifie', 'type_document', 'date_upload']
    search_fields = ['type_document', 'commentaire', 'demande__reference']
    readonly_fields = ['date_upload']
    
    def demande_reference(self, obj):
        return obj.demande.reference
    demande_reference.short_description = 'Demande'
    
    def fichier_link(self, obj):
        if obj.fichier:
            return format_html('<a href="{}" target="_blank">📄 Voir le fichier</a>', obj.fichier.url)
        return '-'
    fichier_link.short_description = 'Fichier'