# Life Manager — Organisez votre vie intelligemment

**Life Manager** est une application web tout-en-un conçue pour centraliser et automatiser votre organisation quotidienne.

Elle combine :
- une **todo intelligente**
- un **générateur de repas personnalisés**
- un **générateur d’exercices sportifs**
- un **calendrier unifié**

Le tout orchestré automatiquement grâce à des règles internes et à l’intelligence artificielle via l’API de OpenAI.

---

## Vision du projet

L’objectif de Life Manager est simple :

> Ne plus réfléchir à *quand* faire les choses, *quoi* manger ou *comment* s’entraîner.

L’application s’occupe de :
- planifier vos tâches
- générer vos repas selon vos préférences
- créer vos séances de sport adaptées
- organiser le tout dans un calendrier clair et cohérent

---

## Fonctionnalités principales

### Todo intelligente
- Création de tâches et sous-tâches
- Gestion des priorités (`bas`, `moyen`, `haut`)
- Estimation de durée
- Catégories personnalisées
- Planification automatique dans le calendrier

---

### Générateur de repas (IA)
- Génération automatique de repas personnalisés
- Adaptation selon les préférences utilisateur
- Intégration dans le calendrier
- Favoris

---

### Générateur d’exercices (IA)
- Programmes sportifs personnalisés
- Adaptés au niveau et aux objectifs
- Planification automatique
- Favoris

---

### Calendrier unifié
- Basé sur FullCalendar
- Vue hebdomadaire et mensuelle
- Regroupe toutes les données

---

## Structure du projet

```bash
src/
├── app/
├── components/
├── features/
│   ├── todo/
│   ├── meals/
│   ├── sport/
│   └── calendar/
├── lib/
├── types/
└── styles/
```

---

## Développement

```bash
git clone <url-du-repo>
cd Life-Manager
npm install
npm run start
```

---

## Variables d’environnement

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Licence

Projet personnel — tous droits réservés.