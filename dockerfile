# Étape 1: Utilisez une image officielle de Node.js comme image de base
FROM node:18

# Définissez le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copiez le fichier 'package.json' et 'package-lock.json' (si disponible)
COPY package*.json ./

# Installez les dépendances du projet
RUN npm install

# Copiez les fichiers et dossiers restants du projet dans le répertoire de travail du conteneur
COPY . .

# Exposez le port sur lequel votre application s'exécute
EXPOSE 3000

# Commande pour démarrer votre application
CMD ["node", "server.js"]
