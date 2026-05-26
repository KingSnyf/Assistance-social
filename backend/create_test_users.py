#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Profile

# Supprimer les utilisateurs existants pour tester
User.objects.filter(username__in=['admin', 'agent', 'citoyen']).delete()

# Créer un utilisateur admin
user = User.objects.create_user(
    username='admin',
    password='admin123',
    email='admin@example.com',
    first_name='Admin',
    last_name='User'
)
profile = Profile.objects.get_or_create(user=user)[0]
profile.role = 'admin'
profile.save()
print(f"✓ Utilisateur créé: {user.username} - Role: {profile.role}")

# Créer un utilisateur agent
user2 = User.objects.create_user(
    username='agent',
    password='agent123',
    email='agent@example.com',
    first_name='Agent',
    last_name='Social'
)
profile2 = Profile.objects.get_or_create(user=user2)[0]
profile2.role = 'agent'
profile2.save()
print(f"✓ Utilisateur créé: {user2.username} - Role: {profile2.role}")

# Créer un utilisateur citoyen
user3 = User.objects.create_user(
    username='citoyen',
    password='citoyen123',
    email='citoyen@example.com',
    first_name='Citoyen',
    last_name='Test'
)
profile3 = Profile.objects.get_or_create(user=user3)[0]
profile3.role = 'citoyen'
profile3.save()
print(f"✓ Utilisateur créé: {user3.username} - Role: {profile3.role}")

print("\n✓ Tous les utilisateurs de test sont créés!")
