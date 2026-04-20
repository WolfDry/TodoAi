# TodoAI — Gestionnaire de tâches intelligent

Application web de gestion de tâches (todo list) avec calendrier intégré, conçue pour être connectée à l’API de ChatGPT afin d’organiser automatiquement les tâches dans un calendrier.

---

## Objectif du projet

L’idée centrale est simple : l’utilisateur crée et gère ses tâches depuis une interface todo classique, puis une intelligence artificielle (ChatGPT via l’API OpenAI) analyse ces tâches et les planifie automatiquement dans un calendrier en tenant compte des priorités, des durées estimées et des disponibilités.

---

## Fonctionnalités actuelles

- **Catégories** — Création de catégories personnalisées avec couleur (color picker)
- **Tâches** — Ajout, modification, suppression de tâches par catégorie
- **Sous-tâches** — Chaque tâche peut contenir des sous-tâches
- **Priorités** — Chaque tâche/sous-tâche a un niveau de priorité : `bas`, `moyen`, `haut` (indicateur visuel par point coloré)
- **Calendrier** — Vue hebdomadaire/mensuelle avec FullCalendar (vue semaine par défaut, plage horaire 7h–22h)
- **Persistance** — Données stockées dans Supabase

## Fonctionnalités prévues (IA)

- Connexion à l’API OpenAI (ChatGPT)
- Analyse automatique des tâches (priorité, durée estimée, deadline)
- Planification automatique dans le calendrier
- Suggestions de réorganisation en cas de conflit ou de surcharge

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + TypeScript |
| Calendrier | FullCalendar 6 (daygrid, timegrid, interaction) |
| Backend / BDD | Supabase (PostgreSQL) |
| IA (à venir) | API OpenAI (ChatGPT) |
| Style | CSS modules |

---

## Structure du projet

```
src/
├── components/
│   ├── TodoPanel.tsx       # Panneau gauche : liste des catégories et tâches
│   ├── CalendarPanel.tsx   # Panneau droit : calendrier FullCalendar
│   ├── CategoryList.tsx    # Liste des catégories
│   ├── CategoryItem.tsx    # Composant d’une catégorie
│   ├── TaskItem.tsx        # Composant d’une tâche + sous-tâches
│   └── AddForm.tsx         # Formulaire d’ajout générique
├── styles/                 # Fichiers CSS par composant
├── types/
│   └── todo.types.ts       # Types TypeScript (Category, Task, Subtask, Priority)
└── utils/
    └── supabase.ts         # Client Supabase
```

---

## Modèle de données

```ts
type Priority = ‘low’ | ‘medium’ | ‘high’

type Category = {
  id: number
  name: string
  color: string       // couleur HEX de la catégorie
  tasks: Task[]
}

type Task = {
  id: number
  text: string
  done: boolean
  category_id: number
  priority: Priority
  subtasks: Subtask[]
}

type Subtask = {
  id: number
  text: string
  done: boolean
  task_id: number
  priority: Priority
}
```

---

## Installation et lancement

### Prérequis

- Node.js >= 18
- Un projet Supabase avec les tables `categories`, `tasks`, `subtasks`
- (À venir) Une clé API OpenAI

### Étapes

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd todo

# Installer les dépendances
npm install

# Configurer les variables d’environnement
cp .env.example .env
# Remplir REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_PUBLISHABLE_KEY

# Lancer en développement
npm start
```

L’application est accessible sur [http://localhost:3000](http://localhost:3000).

### Variables d’environnement

```env
REACT_APP_SUPABASE_URL=https://<votre-projet>.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=<votre-clé-publique>
```

---

## Schéma Supabase (SQL)

```sql
create table categories (
  id serial primary key,
  name text not null,
  color text not null default ‘#6c63ff’
);

create table tasks (
  id serial primary key,
  text text not null,
  done boolean not null default false,
  category_id integer references categories(id) on delete cascade,
  priority text not null default ‘medium’
);

create table subtasks (
  id serial primary key,
  text text not null,
  done boolean not null default false,
  task_id integer references tasks(id) on delete cascade,
  priority text not null default ‘medium’
);
```

---

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Lance l’application en mode développement |
| `npm run build` | Compile l’application pour la production |

---

## Roadmap

- [x] Gestion des catégories avec couleur
- [x] Tâches et sous-tâches avec priorités
- [x] Calendrier hebdomadaire / mensuel
- [ ] Ajout de deadlines et durées estimées sur les tâches
- [ ] Intégration API OpenAI
- [ ] Planification automatique des tâches dans le calendrier

---

## Licence

Projet personnel — tous droits réservés.
