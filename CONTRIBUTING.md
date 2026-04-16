# Guide de contribution — Zeat

Merci de contribuer à Zeat. Ce guide couvre tout ce dont vous avez besoin pour proposer une modification.

---

## Table des matières

1. [Prérequis](#prérequis)
2. [Setup local](#setup-local)
3. [Branches](#branches)
4. [Commits](#commits)
5. [Ouvrir une Pull Request](#ouvrir-une-pull-request)
6. [CI / checks requis](#ci--checks-requis)
7. [Architecture en bref](#architecture-en-bref)
8. [Variables d'environnement](#variables-denvironnement)

---

## Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 20.x |
| pnpm | 10.x |
| Convex CLI | via `npx convex` |

---

## Setup local

```bash
# 1. Cloner
git clone https://github.com/aboudou-cto-bloko/zeat.git
cd zeat

# 2. Installer les dépendances
pnpm install

# 3. Copier les variables d'environnement
cp .env.example .env.local
# puis renseigner les valeurs (voir section Variables d'environnement)

# 4. Lancer Convex en dev
npx convex dev

# 5. Lancer le serveur Next.js (dans un autre terminal)
pnpm dev
```

L'app est disponible sur `http://localhost:3000`.

---

## Branches

La branche `master` est **protégée** — aucun push direct n'est autorisé.

### Convention de nommage

```
<type>/<description-courte>
```

| Type | Usage |
|---|---|
| `feat/` | Nouvelle fonctionnalité |
| `fix/` | Correction de bug |
| `refactor/` | Refactoring sans changement de comportement |
| `chore/` | Config, dépendances, scripts |
| `docs/` | Documentation uniquement |

**Exemples :**
```
feat/order-notifications
fix/modal-centering-mobile
refactor/search-index-convex
chore/update-dependencies
```

### Workflow

```bash
# Partir toujours de master à jour
git checkout master && git pull

# Créer sa branche
git checkout -b feat/ma-fonctionnalite

# ... travailler ...

# Pusher et ouvrir une PR
git push -u origin feat/ma-fonctionnalite
gh pr create
```

Les branches sont automatiquement supprimées après merge.

---

## Commits

Format : **Conventional Commits** ([conventionalcommits.org](https://www.conventionalcommits.org/))

```
<type>(<scope optionnel>): <description courte>
```

### Types acceptés

| Type | Quand |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Refactoring |
| `perf` | Amélioration de performance |
| `chore` | Config, dépendances, scripts |
| `docs` | Documentation |
| `test` | Ajout ou modification de tests |
| `assets` | Fichiers statiques (images, icônes) |

### Exemples

```
feat(orders): add push notification on new order
fix(a11y): remove maximum-scale from viewport meta
perf(convex): add search index on dishes table
chore: update motion to 12.x
```

### Règles

- Impératif présent en anglais : `add`, `fix`, `remove` — pas `added`, `fixed`
- Pas de point final
- Description < 72 caractères
- Ne pas mentionner de fichiers spécifiques dans le message (le diff est là pour ça)

---

## Ouvrir une Pull Request

1. Vérifier que les checks passent localement :
   ```bash
   pnpm tsc --noEmit  # TypeScript
   pnpm lint          # ESLint
   ```

2. Créer la PR depuis votre branche vers `master`

3. Remplir le template PR (description, type de changement, checklist)

4. Attendre que la CI passe (`Type-check & Lint` + `Build`)

5. Si des changements Convex sont inclus, préciser dans la description si un `npx convex deploy` est nécessaire

### Quoi mettre dans une PR

- Une PR = une chose. Ne pas mélanger feat + fix + refactor.
- Si la PR modifie l'UI, inclure une capture d'écran avant/après, notamment sur mobile.
- Pour les changements de schéma Convex, décrire la migration (breaking ou non).

---

## CI / checks requis

Tout PR doit passer le job GitHub Actions avant d'être mergeable :

| Job | Commandes |
|---|---|
| **Type-check & Lint** | `pnpm tsc --noEmit` + `pnpm lint` |

Le merge est en **squash uniquement** — l'historique de `master` est linéaire.

---

## Architecture en bref

```
zeat/
├── convex/          # Backend Convex (queries, mutations, actions, schema)
│   ├── schema.ts    # Source de vérité du modèle de données
│   ├── restaurants.ts
│   ├── dishes.ts
│   ├── orders.ts
│   └── ...
├── src/
│   ├── app/
│   │   ├── (marketing)/   # Pages publiques (landing, explorer)
│   │   ├── (dashboard)/   # Pages authentifiées (gestion menu, commandes)
│   │   └── (public)/      # Storefronts publics (/m/[slug])
│   ├── components/
│   │   ├── ui/            # Primitives (Button, Dialog, Badge…)
│   │   └── providers/     # ConvexClient, PwaProvider
│   └── lib/               # Utilitaires (compress-image, utils…)
└── public/          # Assets statiques (manifest, SW, icônes)
```

### Règles Convex

- **Queries** : lecture seule, retournent toujours un type sérialisable
- **Mutations** : écriture, valident l'ownership via `getAuthUserId`
- **Actions** (`"use node"`) : appels tiers (push notifications, email) — dans des fichiers séparés des queries/mutations
- Toujours valider l'ownership dans les mutations (`userId → restaurant → resource`)

### Règles front

- Pages dashboard → `"use client"` avec hooks Convex (`useQuery`, `useMutation`)
- Pages marketing → server components par défaut, client components en wrappers ciblés
- Animations → `src/components/animate-in.tsx` (Motion)
- Images uploadées → compresser via `src/lib/compress-image.ts` avant envoi à Convex Storage

---

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | URL du déploiement Convex |
| `CONVEX_DEPLOY_KEY` | Clé de déploiement Convex (CI uniquement) |
| `RESEND_API_KEY` | Email transactionnel (Resend) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clé publique VAPID (push notifications) |
| `VAPID_PRIVATE_KEY` | Clé privée VAPID |
| `VAPID_EMAIL` | Email VAPID (ex. `mailto:contact@zeat.app`) |

Générer les clés VAPID :
```bash
pnpm run generate-vapid-keys
```

---

Pour toute question, ouvrir une [issue](https://github.com/aboudou-cto-bloko/zeat/issues).
