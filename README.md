Voici un exemple de README en Markdown : 


# **Exemple de Correction pour le TP Final : Application de Visioconférence**

Ceci est un exemple de correction pour le TP final.  
L'objectif de cette application est de fournir une solution complète pour une application de visioconférence utilisant WebRTC, avec support audio, vidéo, et gestion des rooms.  

---

## **Prérequis**
- Node.js (v20+ recommandé)
- Un gestionnaire de paquets comme `npm` ou `yarn`

---

## **Installation et Lancement**

### **1. Lancer le Back-end**
1. Ouvrez un terminal et placez-vous dans le dossier `backend` :  
   ```bash
   cd backend
   ```
2. Installez les dépendances :  
   ```bash
   npm install
   ```
3. Lancez le serveur :  
   ```bash
   npm run start
   ```
4. Par défaut, le serveur écoute sur `http://localhost:8080`.

---

### **2. Lancer le Front-end**
1. Ouvrez un terminal et placez-vous dans le dossier `frontend` :  
   ```bash
   cd frontend
   ```
2. Installez les dépendances :  
   ```bash
   npm install
   ```
3. Lancez l’application en mode développement :  
   ```bash
   npm run dev
   ```
4. Par défaut, l'application est accessible à l'adresse suivante :  
   [http://localhost:5173](http://localhost:5173)

---

## **Configuration**
- Avant de lancer le front-end, assurez-vous de configurer un fichier `.env` dans le dossier `frontend` pour spécifier l’URL du back-end. Exemple :  

  ```env
  VITE_API_URL=http://localhost:8080/visio
  ```

---

## **Fonctionnalités**
- Création et gestion de rooms.  
- Visioconférence avec support audio/vidéo.  
- Possibilité d’activer/désactiver le microphone et la caméra.  
- Transmission des statuts via DataChannels (exemple : micro coupé, vidéo désactivée).  
- Interface utilisateur réactive et intuitive.  

---

## **Liens utiles**
- [Demo](https://fyc.agweb.dev/)
- [Documentation WebRTC](https://webrtc.org/)
- [Node.js](https://nodejs.org/)
- [Vite (outil pour le front-end)](https://vitejs.dev/)
