# 🎯 NicheFinder Standalone - Prêt à déployer !

## ✅ Ce que tu as reçu

Un projet **NicheFinder complet et standalone**, prêt à déployer sur Railway en quelques minutes.

---

## 📦 Contenu de l'archive

```
nichefinder-standalone/
├── server.js           # Backend Node.js (simplifié, juste NicheFinder)
├── index.html          # Interface web (design moderne)
├── package.json        # Dépendances
├── .env.example        # Template configuration
├── .gitignore          # Fichiers à ignorer
├── README.md           # Documentation complète
└── QUICKSTART.md       # Guide de démarrage 5 min
```

**Différences avec l'intégration SEO Audit Pro :**
- ✅ Serveur **simplifié** (seulement NicheFinder)
- ✅ **Indépendant** (pas de code SEO Audit)
- ✅ Prêt pour **déploiement séparé** sur Railway
- ✅ API endpoint : `/api/analyze` (au lieu de `/api/niche/analyze`)

---

## 🚀 Installation locale (5 minutes)

### 1. Extraire

```bash
tar -xzf nichefinder-standalone.tar.gz
cd nichefinder-standalone
```

### 2. Configurer

```bash
cp .env.example .env
nano .env  # Édite avec tes clés
```

Remplis :
```env
DATAFORSEO_LOGIN=ton-login
DATAFORSEO_PASSWORD=ton-password
GEMINI_API_KEY=ta-clé
```

### 3. Lancer

```bash
npm install
npm start
```

Ouvre http://localhost:3000 🎉

---

## ☁️ Déploiement Railway (5 minutes)

### Étape 1 : Créer un nouveau repo GitHub

```bash
cd nichefinder-standalone

git init
git add .
git commit -m "Initial NicheFinder"
git branch -M main

# Crée un nouveau repo sur GitHub : nichefinder
git remote add origin https://github.com/Arezki94/nichefinder.git
git push -u origin main
```

### Étape 2 : Nouveau projet Railway

1. Va sur https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionne ton repo **nichefinder** (pas seo-audit-pro)
4. Railway détecte automatiquement Node.js

### Étape 3 : Variables d'environnement

Dans Railway → Variables → New Variable :

```
DATAFORSEO_LOGIN      = ton-login
DATAFORSEO_PASSWORD   = ton-password  
GEMINI_API_KEY        = ta-clé
```

### Étape 4 : Déploiement automatique

Railway déploie automatiquement ! Attends 1-2 minutes.

### Étape 5 : Récupère ton URL

Railway → Settings → Domains

Tu verras : `nichefinder-xxx.up.railway.app`

**C'est en ligne ! 🚀**

---

## 💰 Coûts

### Railway (pendant ton trial)

```
✅ GRATUIT pendant la période d'essai
```

### Après le trial

```
Railway : $5-10/mois selon usage
DataForSEO : ~$0.06/analyse
Gemini : Gratuit (quota généreux)
```

### Exemple avec 50 clients

```
Revenue : 50 × 20€ = 1000€/mois
Coûts :
├─ Railway : $10 (~9€)
├─ DataForSEO : 50 × 30 analyses = 1500 × $0.06 = $90 (~85€)
└─ Total : ~94€/mois

Profit : 1000€ - 94€ = 906€/mois
Marge : 90% 🎉
```

---

## 🎯 Structure de ton infrastructure

Tu auras maintenant **2 projets séparés** :

### Projet 1 : SEO Audit Pro
```
https://seo-audit-pro-xxx.railway.app
├── /         → Landing
├── /app      → Audit SEO
└── Routes audit existantes
```

### Projet 2 : NicheFinder
```
https://nichefinder-xxx.railway.app
├── /              → Interface NicheFinder
├── /api/analyze   → API analyse
└── /api/cache-stats
```

**Avantages :**
- ✅ Totalement indépendants
- ✅ Scaling séparé
- ✅ Si l'un plante, l'autre tourne
- ✅ 2 domaines différents possibles
- ✅ Plus facile à vendre séparément

---

## 📊 API Endpoints

```
GET  /                → Interface web
POST /api/analyze     → Analyser une niche
GET  /api/cache-stats → Stats du cache
POST /api/clear-cache → Vider le cache
GET  /health          → Health check
```

**Note :** L'endpoint est `/api/analyze` (pas `/api/niche/analyze`)

---

## 🧪 Test rapide

### Via navigateur

```
http://localhost:3000
ou
https://nichefinder-xxx.railway.app
```

Teste avec :
- "pommeau de vitesse"
- "bougie parfumée"
- "tapis de yoga"

### Via API

```bash
# Local
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"keyword":"pommeau de vitesse"}'

# Production
curl -X POST https://nichefinder-xxx.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"keyword":"pommeau de vitesse"}'
```

---

## 🎨 Personnalisation

### Changer le titre

Édite `index.html` ligne 7 :
```html
<title>NicheFinder - Ton Slogan</title>
```

### Changer les couleurs

Édite `index.html` ligne 80 :
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Couleurs suggérées :
- Vert : `#10b981 0%, #059669 100%`
- Bleu : `#3b82f6 0%, #1d4ed8 100%`
- Orange : `#f59e0b 0%, #d97706 100%`

---

## 🔗 Ajouter un domaine personnalisé

### Sur Railway

1. Settings → Domains → Add Custom Domain
2. Entre ton domaine : `nichefinder.com`
3. Ajoute le CNAME dans ton DNS :
   ```
   CNAME nichefinder → nichefinder-xxx.up.railway.app
   ```
4. Attends 5-10 minutes
5. SSL automatique avec Railway ✅

---

## 📈 Prochaines étapes suggérées

### Semaine 1 : Test
- [ ] Déploie sur Railway
- [ ] Fais 10-20 analyses test
- [ ] Vérifie les coûts réels

### Semaine 2 : Beta
- [ ] Donne accès à 5 beta-testeurs
- [ ] Collecte feedback
- [ ] Ajuste si besoin

### Semaine 3 : Lancement
- [ ] Crée une landing page marketing
- [ ] Post dans Discord/communautés
- [ ] Email à ta liste
- [ ] Pricing : 20€/mois early bird

### Mois 2+
- [ ] Ajoute authentification (Clerk/Auth0)
- [ ] Historique des analyses (DB)
- [ ] Dashboard analytics
- [ ] Export PDF

---

## 🐛 Troubleshooting

### Port déjà utilisé

```bash
# Change le port
export PORT=3001
npm start
```

### Module non trouvé

```bash
# Réinstalle
rm -rf node_modules
npm install
```

### CORS errors (en dev)

Normal si tu testes depuis un autre domaine. En production sur Railway, pas de problème.

### Cache ne fonctionne pas

Cache en mémoire, se réinitialise au restart. Normal !

---

## 📚 Documentation complète

Tout est dans **README.md** pour :
- API détaillée
- Personnalisation
- Roadmap
- Contributing

---

## 🎉 C'est prêt !

Tu as maintenant :
- ✅ Projet NicheFinder standalone
- ✅ Prêt à déployer sur Railway
- ✅ Indépendant de SEO Audit Pro
- ✅ Documentation complète

**Questions ?** Regarde le README.md ou contacte-moi ! 🚀

---

**Bon lancement ! 💪**

Arezki
