# Cashbot - Bot Telegram de Gains par Tâches

Un bot Telegram professionnel permettant aux utilisateurs de gagner de l'argent en accomplissant des tâches, avec un tableau de bord administrateur complet.

## 📋 Fonctionnalités

### 🤖 Bot Telegram
- ✅ **Inscription automatique** via `/start`
- ✅ **Vérification des canaux obligatoires** avant accès
- ✅ **Menu principal** avec 10 options
- ✅ **Système de tâches** complet (validation auto/manuelle)
- ✅ **Portefeuille** avec solde disponible et en attente
- ✅ **Retraits** (Mobile Money, Crypto, PayPal, Virement)
- ✅ **Parrainage** avec lien unique et bonus
- ✅ **Bonus** quotidien, hebdomadaire, codes promo
- ✅ **Notifications** en temps réel

### 🖥️ API REST
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Gestion des tâches (CRUD)
- ✅ Gestion des retraits et validations
- ✅ Statistiques et rapports
- ✅ Webhooks 26KADO

### 📊 Tableau de bord Admin (Next.js)
- ✅ Création/Modification/Suppression de tâches
- ✅ Validation des preuves
- ✅ Gestion des utilisateurs
- ✅ Traitement des retraits
- ✅ Statistiques en temps réel
- ✅ Export des données

## 🚀 Installation Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Git
- Un compte Telegram (pour créer le bot)

### 1. Créer le bot Telegram avec BotFather

1. Ouvre Telegram et cherche **@BotFather**
2. Envoie `/newbot`
3. Choisis un nom (ex: `Cashbot`)
4. Choisis un username (ex: `CashbotBot`)
5. BotFather te donne un **token** - garde-le précieusement
6. Configure les commandes avec `/setcommands`:
```
start - Démarrer le bot
menu - Menu principal
balance - Voir mon solde
tasks - Tâches disponibles
profile - Mon profil
referral - Parrainage
withdraw - Retraits
daily - Bonus quotidien
help - Aide
```

### 2. Cloner le projet

```bash
git clone https://github.com/votre-compte/cashbot.git
cd cashbot
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Configurer l'environnement

```bash
cp .env.example .env
```

Modifie le fichier `.env` :

```env
# Token du bot Telegram (obtenu depuis BotFather)
BOT_TOKEN=votre_token_ici

# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/cashbot

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret (génère une chaîne aléatoire longue)
JWT_SECRET=une_chaine_aleatoire_tres_longue_et_securisee

# IDs Telegram des administrateurs (séparés par des virgules)
ADMIN_IDS=123456789,987654321
```

### 5. Configurer la base de données

```bash
# Crée la base de données PostgreSQL
createdb cashbot

# Exécute les migrations Prisma
npx prisma migrate dev --name init

# (Optionnel) Ajoute des données de test
npm run db:seed
```

### 6. Lancer le bot en développement

```bash
npm run dev
```

Le bot démarre en mode polling et l'API sur le port 3001.

## 🐳 Déploiement avec Docker

### Prérequis
- Docker et Docker Compose installés

### Déploiement

```bash
# Construire et démarrer
docker-compose up -d --build

# Voir les logs
docker-compose logs -f app

# Arrêter
docker-compose down
```

### Configuration Docker

Crée un fichier `.env` avec les variables nécessaires :

```env
NODE_ENV=production
BOT_TOKEN=votre_token
DATABASE_URL=postgresql://cashbot:cashbot123@db:5432/cashbot
REDIS_URL=redis://redis:6379
JWT_SECRET=votre_secret
ADMIN_IDS=123456789
```

## 🚀 Déploiement sur VPS Ubuntu

### 1. Installer les dépendances

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installer Redis
sudo apt install -y redis-server

# Installer PM2 globalement
npm install -g pm2

# Vérifier les installations
node --version
npm --version
psql --version
redis-cli --version
pm2 --version
```

### 2. Configurer PostgreSQL

```bash
# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE cashbot;
CREATE USER cashbot WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE cashbot TO cashbot;
\q
```

### 3. Cloner et configurer le projet

```bash
cd /opt
git clone https://github.com/votre-compte/cashbot.git
cd cashbot
npm install
npx prisma generate
npx prisma db push

# Copier et configurer .env
cp .env.example .env
nano .env
```

### 4. Construire et démarrer

```bash
# Compiler TypeScript
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

### 5. Configurer Nginx et SSL

```bash
# Installer Nginx
sudo apt install -y nginx

# Installer Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx

# Configurer Nginx
sudo nano /etc/nginx/sites-available/cashbot
```

Configuration Nginx :

```nginx
server {
    listen 80;
    server_name votredomaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Webhook Telegram (limite la taille)
    location /webhook/ {
        proxy_pass http://localhost:3001;
        client_max_body_size 10m;
    }

    # Limiter les uploads
    location /uploads/ {
        alias /opt/cashbot/uploads/;
        internal;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/cashbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtenir SSL
sudo certbot --nginx -d votredomaine.com
```

### 6. Configurer le Webhook Telegram

```bash
# Arrêter le bot, configurer le webhook
curl -F "url=https://votredomaine.com/webhook/VOTRE_TOKEN_BOT" \
     https://api.telegram.org/botVOTRE_TOKEN/setWebhook

# Vérifier
curl https://api.telegram.org/botVOTRE_TOKEN/getWebhookInfo
```

## 🛠 Commandes Utiles

### PM2 (Gestion des processus)

```bash
pm2 list                    # Lister les processus
pm2 logs cashbot            # Voir les logs
pm2 monit                   # Monitoring en temps réel
pm2 restart cashbot         # Redémarrer
pm2 stop cashbot            # Arrêter
pm2 delete cashbot          # Supprimer
pm2 save                    # Sauvegarder la config
```

### Base de données

```bash
# Migrations
npx prisma migrate dev          # Développement
npx prisma migrate deploy       # Production
npx prisma db push              # Sync directe
npx prisma studio               # Interface web

# Seed
npm run db:seed

# Backup
pg_dump cashbot > backup.sql
pg_restore -d cashbot backup.sql
```

### Maintenance

```bash
# Mise à jour du bot
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart cashbot

# Voir les logs en temps réel
tail -f logs/combined.log

# Analyser les erreurs
tail -f logs/error.log
```

## 📁 Structure du Projet

```
cashbot/
├── prisma/                    # Base de données
│   ├── schema.prisma         # Schéma Prisma
│   └── seed.ts               # Données initiales
├── src/
│   ├── config/               # Configuration
│   │   └── index.ts          # Variables d'environnement
│   ├── controllers/          # Contrôleurs
│   │   └── bot.controller.ts # Commandes Telegram
│   ├── services/             # Services métier
│   │   ├── user.service.ts   # Gestion utilisateurs
│   │   └── task.service.ts   # Gestion tâches
│   ├── helpers/              # Utilitaires
│   │   ├── prisma.ts         # Client Prisma
│   │   └── logger.ts         # Système de logs
│   ├── routes/               # API REST
│   │   └── api.ts            # Routes API
│   ├── jobs/                 # Tâches planifiées
│   │   └── cron.ts           # Jobs CRON
│   ├── middlewares/          # Middlewares
│   ├── validators/           # Validateurs
│   ├── index.ts              # Point d'entrée
│   └── healthcheck.ts        # Santé Docker
├── docker-compose.yml        # Docker Compose
├── Dockerfile                # Image Docker
├── ecosystem.config.js       # Configuration PM2
├── .env.example              # Exemple d'environnement
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Sécurité

### Anti-spam
- Rate limiting (30 requêtes/minute par utilisateur)
- Protection contre les doubles validations
- Limite de tentatives par tâche (3 max)

### Authentification API
- JWT tokens avec expiration
- Clés API pour les services externes
- Sessions sécurisées

### Protection des données
- Validation des entrées avec Zod
- Helmet.js pour les headers de sécurité
- CORS configuré
- Logs d'audit complets

## 📈 Scaling

### Pour des centaines de milliers d'utilisateurs

1. **Horizontal scaling** : Ajouter des instances PM2
2. **Redis Cluster** : Cache distribué
3. **Read replicas** : Base de données en lecture
4. **Load balancer** : Nginx en amont
5. **CDN** : Pour les fichiers statiques

### Architecture recommandée
```
[Users] → [Nginx LB] → [PM2 Cluster] → [Redis Cache]
                                 ↓
                      [PostgreSQL] (Write master / Read replicas)
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Linting
npm run lint
```

## 📝 API Documentation

### Endpoints principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/status` | Statut de l'API |
| GET | `/api/users` | Liste des utilisateurs |
| GET | `/api/users/telegram/:id` | Utilisateur par Telegram ID |
| GET | `/api/tasks` | Liste des tâches |
| POST | `/api/tasks` | Créer une tâche |
| PUT | `/api/tasks/:id` | Modifier une tâche |
| DELETE | `/api/tasks/:id` | Supprimer une tâche |
| GET | `/api/stats` | Statistiques |
| GET | `/api/transactions` | Transactions |
| GET | `/api/withdrawals` | Retraits |
| PUT | `/api/withdrawals/:id/process` | Traiter un retrait |
| POST | `/api/webhook/kado` | Webhook 26KADO |

### Authentification
```
Headers:
  Authorization: Bearer <jwt_token>
  x-api-key: <api_key>
```

## 👨‍💻 Guide Débutant Complet

### 1. Qu'est-ce qu'un bot Telegram ?
Un bot Telegram est un programme automatisé qui peut interagir avec les utilisateurs sur Telegram. Il peut répondre aux messages, exécuter des commandes, etc.

### 2. Installer Node.js
Node.js permet d'exécuter du JavaScript hors du navigateur.

```bash
# Sur Windows
# Télécharge l'installateur sur https://nodejs.org (version 20 LTS)

# Sur Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Installer PostgreSQL
PostgreSQL est la base de données qui stocke toutes les données.

```bash
# Sur Windows
# Télécharge l'installateur sur https://www.postgresql.org/download/

# Sur Ubuntu/Debian
sudo apt install -y postgresql postgresql-contrib
```

### 4. Installer Git
Git permet de gérer les versions du code.

```bash
# Sur Windows
# Télécharge l'installateur sur https://git-scm.com/download/win

# Sur Ubuntu/Debian
sudo apt install -y git
```

### 5. Comprendre les commandes de base

```bash
# Navigation
cd dossier          # Aller dans un dossier
cd ..               # Revenir en arrière
dir / ls            # Lister les fichiers
mkdir nom           # Créer un dossier

# Git
git clone url       # Télécharger un projet
git pull            # Mettre à jour
git status          # Voir les changements
```

### 6. Utiliser PM2 (gestionnaire de processus)
PM2 maintient votre bot en vie 24/7.

```bash
npm install -g pm2     # Installer PM2
pm2 start app.js       # Démarrer
pm2 status             # Voir le statut
pm2 logs               # Voir les logs
pm2 restart app        # Redémarrer
pm2 stop app           # Arrêter
```

## 📞 Support

- **Email** : support@cashbot.com
- **Telegram** : @CashbotSupport

## 📄 License

MIT License - Copyright (c) 2024 Cashbot

---

🎉 **Félicitations !** Tu as maintenant un bot Telegram professionnel prêt pour la production.