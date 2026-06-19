# 🔧 Le Focus - Backend API

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-black?logo=express)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7)

API RESTful robuste pour la gestion du contenu du site d'actualités "Le Focus". Backend Node.js avec Express, Supabase, ImageKit et Cloudinary.

## 🌐 API en ligne

- **Base URL** : `https://le-focus-backend.onrender.com`
- **Health Check** : `https://le-focus-backend.onrender.com/health`
- **Docs API** : Swagger/OpenAPI (à venir)

## ✨ Fonctionnalités

### 📰 Gestion des Articles
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Upload d'images via ImageKit
- ✅ Upload de PDF via Cloudinary
- ✅ Génération automatique de slugs
- ✅ Compteurs de vues et téléchargements
- ✅ Pagination et filtres
- ✅ Recherche par catégorie

### 🔐 Authentification
- ✅ Login sécurisé avec JWT
- ✅ Hachage des mots de passe (bcrypt)
- ✅ Middleware de protection des routes admin
- ✅ Token expiration (24h)

### 📦 Commandes
- ✅ Création de commandes d'insertion publicitaire
- ✅ Gestion des types (insertion, abonnement, publi-reportage)
- ✅ Suivi des statuts

### 💬 Commentaires
- ✅ Ajout de commentaires sur articles
- ✅ Système de likes
- ✅ Réponses aux commentaires

## 🛠️ Stack Technique

### Core
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Supabase** - Base de données PostgreSQL
- **JWT** - Authentification par tokens

### Services Cloud
- **ImageKit** - Optimisation et CDN d'images
- **Cloudinary** - Stockage de fichiers PDF
- **Render** - Hébergement et déploiement

### Sécurité
- **bcrypt** - Hachage de mots de passe
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Sécurisation des headers HTTP

## 📦 Installation

### Prérequis
- Node.js >= 18.x
- Compte Supabase
- Compte ImageKit
- Compte Cloudinary

### Étapes

```bash
# Cloner le repository
git clone https://github.com/Issa-Mgn/Le-Focus.git
cd Le-Focus/server

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec tes credentials

# Lancer le serveur de développement
npm run dev

# Lancer en production
npm start
```

## 🔐 Variables d'environnement

Créer un fichier `.env` à la racine du dossier `server/` :

```env
# Serveur
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=votre_secret_jwt_super_securise_ici

# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_anon_key_ici

# ImageKit (Upload d'images)
IMAGEKIT_PUBLIC_KEY=votre_public_key
IMAGEKIT_PRIVATE_KEY=votre_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/votre_id

# Cloudinary (Upload de PDF)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## 📁 Structure du projet

```
server/
├── config/
│   ├── supabase.js        # Configuration Supabase
│   ├── imagekit.js        # Configuration ImageKit
│   └── cloudinary.js      # Configuration Cloudinary
├── controllers/
│   ├── authController.js  # Authentification
│   ├── articleController.js
│   ├── orderController.js
│   └── commentController.js
├── middlewares/
│   └── authMiddleware.js  # Protection JWT
├── routes/
│   ├── authRoutes.js
│   ├── articleRoutes.js
│   ├── orderRoutes.js
│   └── commentRoutes.js
├── db/
│   └── schema.sql         # Schéma de la base de données
├── index.js               # Point d'entrée
├── .env.example
└── package.json
```

## 🗃️ Base de données (Supabase)

### Tables principales

#### `users`
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- password_hash (TEXT)
- role (TEXT, default: 'admin')
- created_at (TIMESTAMP)
```

#### `articles`
```sql
- id (SERIAL, PK)
- slug (TEXT, UNIQUE)
- title (TEXT)
- excerpt (TEXT)
- content (TEXT)
- category (TEXT)
- author (TEXT)
- cover_image_url (TEXT)
- gallery_image_urls (TEXT[])
- pdf_url (TEXT)
- views (INTEGER, default: 0)
- downloads (INTEGER, default: 0)
- is_featured (BOOLEAN)
- published_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `orders`
```sql
- id (UUID, PK)
- type (TEXT)
- client_info (JSONB)
- details (JSONB)
- total_price (NUMERIC)
- status (TEXT)
- created_at (TIMESTAMP)
```

## 🔌 API Endpoints

### Authentification
```
POST   /api/auth/login          # Login admin
POST   /api/auth/register       # Créer un admin (protégé)
```

### Articles
```
GET    /api/articles            # Liste des articles
GET    /api/articles/:id        # Détails d'un article
POST   /api/articles            # Créer un article (protégé)
PUT    /api/articles/:id        # Modifier un article (protégé)
DELETE /api/articles/:id        # Supprimer un article (protégé)
POST   /api/articles/:id/views  # Incrémenter les vues
POST   /api/articles/:id/downloads # Incrémenter les téléchargements
```

### Commandes
```
GET    /api/orders              # Liste des commandes
POST   /api/orders              # Créer une commande
```

### Commentaires
```
GET    /api/articles/:id/comments       # Commentaires d'un article
POST   /api/articles/:id/comments       # Ajouter un commentaire
POST   /api/comments/:id/like           # Liker un commentaire
POST   /api/comments/:id/replies        # Répondre à un commentaire
```

### Monitoring
```
GET    /health                  # Health check (UptimeRobot)
GET    /ping                    # Ping rapide
```

## 🚀 Déploiement

### Render (Recommandé)

1. Connecter le repo GitHub à Render
2. Créer un nouveau **Web Service**
3. Configuration :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Environment** : Node
   - **Branch** : main
4. Ajouter les variables d'environnement
5. Déployer ! 🎉

### UptimeRobot (Keep Alive)

Pour éviter que le serveur s'endorme sur Render (plan gratuit) :

1. Créer un monitor sur [UptimeRobot](https://uptimerobot.com)
2. Type : HTTP(s)
3. URL : `https://le-focus-backend.onrender.com/health`
4. Interval : 5 minutes

## 🔒 Sécurité

- ✅ Authentification JWT
- ✅ Hachage bcrypt (10 rounds)
- ✅ CORS configuré
- ✅ Validation des données entrantes
- ✅ Protection des routes admin
- ✅ Variables d'environnement sécurisées
- ✅ HTTPS en production

## 📊 Performance

- ⚡ Temps de réponse < 200ms
- 🖼️ Images optimisées via ImageKit CDN
- 📦 Compression gzip activée
- 🚀 Cache headers configurés
- 📈 Uptime 99.9% (avec UptimeRobot)

## 🧪 Tests

```bash
# Tests unitaires (à venir)
npm test

# Tests d'intégration (à venir)
npm run test:integration
```

## 📝 Scripts NPM

```bash
npm start        # Démarrer le serveur (production)
npm run dev      # Mode développement avec nodemon
```

## 🐛 Debugging

```bash
# Activer les logs détaillés
NODE_ENV=development npm run dev

# Vérifier les connexions
curl http://localhost:3000/health

# Tester un endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lefocus.com","password":"votre_mot_de_passe"}'
```

## 📞 Contact & Support

**Wabi MIGAN** - Directeur Général  
- 📱 MTN : +229 01 96 76 87 17
- 📱 CELTIIS : +229 01 40 49 60 90
- 📧 Email : miganwabi@gmail.com

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

Développé avec ❤️ par [L!txx Company](https://litxxcompany.netlify.app/)

---

© 2026 Le Focus. Tous droits réservés.
