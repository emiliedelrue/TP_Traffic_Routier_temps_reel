FROM node:20-alpine

WORKDIR /app

# Copier package.json et installer dépendances
COPY package*.json ./
RUN npm install

# Copier le code
COPY . .

# Exposer le port
EXPOSE 5173

# Lancer Vite en mode dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]