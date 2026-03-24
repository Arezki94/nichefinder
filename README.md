# 🎯 NicheFinder v2.0

**Trouve ta niche e-commerce rentable en quelques secondes**

Outil d'analyse de niches pour dropshippers et e-commerçants. Analyse le volume de recherche, la difficulté SEO, les tendances, **la concurrence catégorisée** et **le CPC Google Ads réel** pour valider une niche AVANT de se lancer.

---

## ✨ Features v2.0

### 📊 Données de marché
- **Volume de recherche** - Données Google en temps réel
- **CPC Google Ads réel** - Competition level (Low/Medium/High)
- **Top of page bid** - Fourchette min/max
- **Tendances 12 mois** - Évolution + saisonnalité détectée

### 🏆 Analyse concurrence intelligente
- **Catégorisation automatique** :
  - 🟢 Amazon (marché validé si présent)
  - 🟠 Marketplaces (Cdiscount, Fnac, eBay)
  - 🟠 Généralistes (Darty, Boulanger)
  - 🟡 Médias (Les Numériques, 60 Millions)
  - 🟢 Shopify stores (accessible)
  - 🟡 Spécialistes (sites e-commerce)
- **Comptage par catégorie**
- **% de sites accessibles** (Shopify + Spécialistes)

### 🎯 Scoring intelligent v2.0
- **Amazon présent = BON SIGNE** (+20 points)
- Sites accessibles (Shopify) = +25 points
- Prise en compte competition Google Ads
- Score 0-100 optimisé

### 🤖 Recommandations IA
- Verdict GO/NO-GO avec Gemini
- Stratégie adaptée au profil de la niche
- Prise en compte de la catégorisation

### ⚡ Cache intelligent
- Réduit les coûts API de 50%
- Hit rate moyen : 50-60%

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- Compte DataForSEO (avec crédit)
- Clé API Gemini

### Installation locale

```bash
# Cloner le projet
git clone https://github.com/Arezki94/nichefinder.git
cd nichefinder

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec tes clés API

# Démarrer le serveur
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## ⚙️ Configuration

### 1. DataForSEO

1. Crée un compte sur https://dataforseo.com
2. Va dans **API** → **Credentials**
3. Note ton `login` et `password`
4. Ajoute $10-20 de crédit

### 2. Gemini API

1. Va sur https://aistudio.google.com/apikey
2. Crée une nouvelle clé API
3. Copie la clé

### 3. Variables d'environnement

Édite le fichier `.env` :

```env
PORT=3000
DATAFORSEO_LOGIN=ton-login
DATAFORSEO_PASSWORD=ton-password
GEMINI_API_KEY=ta-clé-gemini
```

---

## 🎯 Utilisation

### Interface web

```bash
npm start
```

Ouvre http://localhost:3000 et entre un mot-clé :
- "pommeau de vitesse cuir"
- "bougie parfumée"
- "tapis de yoga"

### API

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"keyword":"pommeau de vitesse"}'
```

**Réponse :**
```json
{
  "success": true,
  "analysis": {
    "keyword": "pommeau de vitesse",
    "volume": 1200,
    "cpc": 0.45,
    "difficulty": 35,
    "trend": "up",
    "trendPercent": 15.2,
    "score": 72,
    "recommendation": "**Verdict : GO ✅**\n\n...",
    "serpData": [...],
    "timestamp": "2026-03-23T..."
  }
}
```

---

## 📡 API Endpoints

```
GET  /                  → Interface web
POST /api/analyze       → Analyser une niche
GET  /api/cache-stats   → Stats du cache
POST /api/clear-cache   → Vider le cache
GET  /health            → Health check
```

---

## 🚀 Déploiement Railway

### 1. Push sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ton-username/nichefinder.git
git push -u origin main
```

### 2. Créer un projet Railway

1. Va sur https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionne ton repo `nichefinder`
4. Railway détecte automatiquement Node.js

### 3. Ajouter les variables d'environnement

Dans Railway, va dans **Variables** et ajoute :

```
DATAFORSEO_LOGIN     = ton-login
DATAFORSEO_PASSWORD  = ton-password
GEMINI_API_KEY       = ta-clé-gemini
```

### 4. Déployer

Railway déploie automatiquement ! ✅

Ton app sera accessible sur : `nichefinder-xxx.up.railway.app`

---

## 💰 Coûts

### Par analyse

```
Keywords data : ~$0,002
SERP data     : ~$0,05
Trends data   : ~$0,01
───────────────────────
Total         : ~$0,062 (0,06€)
```

### Avec cache (hit rate 50%)

```
Coût moyen réel : ~0,03€ par analyse
```

### Exemples mensuels

```
100 analyses   : ~3€
500 analyses   : ~15€
1000 analyses  : ~30€
```

### Pricing suggéré

```
NicheFinder - 20€/mois
├─ Analyses illimitées
├─ Fair use policy
└─ Support email

Marge : 20€ - 0,30€ (coûts) = 19,70€ (98,5%)
```

---

## 📊 Cache intelligent

Le cache réduit automatiquement les coûts :

```javascript
// Durée de vie : 7 jours
Cache keywords : Volume, CPC, competition
Cache SERP     : TOP 10 résultats
Cache trends   : Tendances 12 mois

Hit rate attendu : 50%
Économie        : 50% des coûts API
```

### Vérifier le cache

```bash
curl http://localhost:3000/api/cache-stats
```

Réponse :
```json
{
  "keywords": 25,
  "serp": 18,
  "trends": 22,
  "total": 65
}
```

---

## 🎨 Personnalisation

### Changer les couleurs

Édite `index.html` ligne 80 :

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Ajouter des exemples

Édite `index.html` :

```html
<span class="example-chip" onclick="setKeyword('ton exemple')">
  Ton exemple
</span>
```

---

## 🐛 Troubleshooting

### "DataForSEO non configuré"
→ Vérifie `DATAFORSEO_LOGIN` et `DATAFORSEO_PASSWORD`

### "Insufficient credits"
→ Recharge ton compte sur https://dataforseo.com

### Analyse très lente (>60s)
→ Normal au premier démarrage (cold start)

### Erreur CORS
→ Le serveur autorise toutes les origines par défaut

---

## 📈 Roadmap

### v1.1 (prochainement)
- [ ] Historique des analyses (DB)
- [ ] Export PDF des rapports
- [ ] Authentification utilisateurs
- [ ] Dashboard analytics

### v1.2
- [ ] Comparaison de niches
- [ ] Alertes sur tendances
- [ ] Suggestions mots-clés
- [ ] API publique

---

## 🤝 Contributing

Les contributions sont bienvenues !

1. Fork le projet
2. Crée une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

---

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE)

---

## 👤 Auteur

**Arezki**

- GitHub: [@Arezki94](https://github.com/Arezki94)
- Discord: [Ta communauté]

---

## 🙏 Remerciements

- DataForSEO pour l'API SEO
- Google Gemini pour l'IA
- La communauté e-commerce française

---

## 📞 Support

- 📧 Email: contact@nichefinder.fr
- 💬 Discord: [Lien]
- 🐛 Issues: [GitHub Issues](https://github.com/Arezki94/nichefinder/issues)

---

**Built with ❤️ for French e-commerce entrepreneurs**

🚀 Trouve ta niche, lance ton business !
