# 🚀 Guide de démarrage rapide - NicheFinder

## ⚡ Installation en 5 minutes

### Étape 1 : Extraire les fichiers (30 secondes)

```bash
# Télécharge nichefinder-standalone.tar.gz
# Puis extrais :
tar -xzf nichefinder-standalone.tar.gz
cd nichefinder-standalone
```

### Étape 2 : Configuration DataForSEO (2 minutes)

1. Va sur https://dataforseo.com → Sign Up
2. API → Credentials → Note ton login et password
3. Billing → Add Funds → Ajoute $10-20

### Étape 3 : Configuration Gemini (1 minute)

1. Va sur https://aistudio.google.com/apikey
2. Create API Key
3. Copie la clé

### Étape 4 : Variables d'environnement (30 secondes)

```bash
# Copie le template
cp .env.example .env

# Édite avec tes clés
nano .env  # ou vim, ou VSCode
```

Remplis :
```env
DATAFORSEO_LOGIN=ton-login-ici
DATAFORSEO_PASSWORD=ton-password-ici
GEMINI_API_KEY=ta-clé-ici
```

### Étape 5 : Lancer ! (30 secondes)

```bash
# Installe les dépendances
npm install

# Démarre le serveur
npm start
```

Ouvre http://localhost:3000 🎉

---

## 🚀 Déployer sur Railway (5 minutes)

### Étape 1 : Push sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ton-username/nichefinder.git
git push -u origin main
```

### Étape 2 : Créer projet Railway

1. https://railway.app → New Project
2. Deploy from GitHub repo
3. Sélectionne `nichefinder`

### Étape 3 : Variables Railway

Dans Railway → Variables → Add :
```
DATAFORSEO_LOGIN
DATAFORSEO_PASSWORD
GEMINI_API_KEY
```

### Étape 4 : C'est déployé !

Railway te donne une URL : `nichefinder-xxx.up.railway.app`

---

## 🎯 Premier test

1. Va sur ton URL
2. Entre "pommeau de vitesse"
3. Clique "Analyser"
4. Attends 10-20 secondes
5. Vérifie les résultats ! ✅

---

## 💰 Coûts

**Railway** : $5-10/mois (pendant trial = GRATUIT)
**DataForSEO** : ~$0.06 par analyse
**Gemini** : Gratuit (quota généreux)

**Exemple** : 100 analyses/mois = $6 de coûts
**Pricing** : 20€/mois illimité = 97% de marge 🎉

---

## 📞 Besoin d'aide ?

Tout est dans le README.md complet !

**Let's go ! 🚀**
