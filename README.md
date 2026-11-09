# 🎂 Birthday Victorine Nabino

Application web dédiée à l'anniversaire de **Victorine Nabino**, le **09 novembre 2026**.
Ses proches y déposent en secret des mots et des photos. Le soir de son anniversaire, à **20h (GMT+2)**, tout se dévoile. Un espace privé, `/mon-amour`, est réservé à son fiancé.

- **Stack :** Angular (composants standalone, signals) + Tailwind CSS
- **Hébergement :** Vercel, projet `birthday-victorine-nabino` (Vercel n'accepte que les minuscules dans les noms de projet)
- **Backend proposé :** Supabase (base Postgres et stockage de fichiers, offre gratuite), appelé via des fonctions serverless Vercel
- **Langues :** français (par défaut) et anglais

---

## 1. Les trois espaces

### 1.1 Accueil `/` : l'espace des proches
Le lien est partagé dès maintenant aux amis et à la famille, mais pas à Victorine.

**Avant le 09/11/2026 à 20h (GMT+2), mode « secret » :**
- Bannière « Chut… c'est une surprise pour Victorine 🤫 »
- Compte à rebours jusqu'à la révélation
- Formulaire de contribution :
  - nom et lien avec Victorine (famille, ami·e, collègue…)
  - message (« Quel souvenir gardes-tu avec Victorine ? ») ; la langue n'est pas demandée, on enregistre celle de l'interface
  - photo souvenir (optionnelle, compressée côté navigateur avant l'envoi)
- Après l'envoi : « Merci ! Ton message restera caché jusqu'au 9 novembre à 20h. »
- Les messages des autres ne sont **pas** visibles avant 20h.

**Après 20h, mode « révélation » :**
- Animation d'ouverture (rideau, confettis, roses)
- Galerie d'accueil avec les photos générales (`img/accueil/`)
- Accès au mur des souvenirs

### 1.2 Mur des souvenirs `/souvenirs`
- Accessible uniquement après la révélation
- Grille de cartes (texte, photo), filtrable par type
- Visionneuse plein écran pour les photos
- **Mode diaporama** (`/souvenirs?mode=diaporama`) : défilement automatique en plein écran, pour projeter les messages pendant la soirée
- Réaction « ❤️ » de Victorine sur chaque message

### 1.3 Espace privé `/mon-amour`
- Réservé à Victorine, protégé par un **code secret** que seul son fiancé lui transmet
- Médias : `img/mon-amour/` (photos et courte vidéo)
- Clip : **KS Bloom, « La Mour »** (voir la note sur la musique, plus bas)
- Pluie de roses animée et pétales au survol et au toucher
- Contenu suggéré :
  - enveloppe scellée qui s'ouvre sur la lettre d'amour
  - « 12 raisons pour lesquelles je t'aime »
  - frise de votre histoire (rencontre, premier rendez-vous, fiançailles)
  - bons cadeaux à utiliser
  - compte à rebours jusqu'au mariage ou aux prochaines retrouvailles
- Aucun lien vers cette page depuis le reste du site, et une balise `noindex`

---

## 2. Confidentialité : le point le plus important

Avec Angular, tout le code part dans le navigateur. Cacher une page ou une date uniquement côté front ne protège rien : n'importe qui peut lire le JavaScript ou ouvrir directement l'URL d'une image. La protection doit donc se faire **côté serveur** :

| Besoin | Solution |
|---|---|
| Cacher les messages avant 20h | L'API `/api/messages` renvoie une liste vide tant que `now < REVEAL_AT` (vérifié par le serveur, pas par le navigateur) |
| Protéger `/mon-amour` | Le code est vérifié par `/api/mon-amour/unlock`, qui renvoie un jeton (cookie httpOnly). Le contenu de la page est servi uniquement avec ce jeton. |
| Protéger les photos et la vidéo privées | Elles **ne sont pas** placées dans `public/`. Elles sont stockées dans un bucket Supabase privé et servies via des URL signées à durée limitée. |
| Éviter que Victorine tombe sur le site | Nom de domaine discret, `noindex`, aucun aperçu des messages dans l'image de partage |
| Modération | Page `/admin` (protégée par mot de passe) pour masquer un message ou une photo inappropriée |
| Anti-spam | Champ piège (honeypot) et limite d'envois par adresse IP |

Moment de la révélation : `REVEAL_AT = 2026-11-09T18:00:00Z` (20h00 à GMT+2).

---

## 3. Fonctionnalités supplémentaires proposées

- 🎙️ **Messages vocaux** enregistrés directement depuis le téléphone
- 📖 **Livre souvenir en PDF** : export de tous les messages et photos, à garder ou à imprimer
- 💌 **Capsule temporelle** : des messages à ne rouvrir que dans un an, pour son prochain anniversaire
- 📱 **QR code** à imprimer et à faire circuler pendant la soirée, pour que les invités sur place ajoutent un mot en direct
- 🔔 **Compteur discret** pour l'organisateur : nombre de messages reçus, et qui n'a pas encore écrit
- ✨ **Easter egg** : taper « Victorine » sur l'accueil déclenche une pluie de cœurs bleu ciel
- 🖼️ **Image de partage personnalisée** (Open Graph) pour WhatsApp, sans révéler la surprise

---

## 4. Identité visuelle

```js
// tailwind.config.js (extrait)
theme: {
  extend: {
    colors: {
      noir:   { DEFAULT: '#0B0B0F', soft: '#16161D' },
      ciel:   { DEFAULT: '#87CEEB', clair: '#B9E4F5', fonce: '#4FA9D1' },
      rose:   { DEFAULT: '#C8102E' },   // les roses de /mon-amour
      creme:  '#F7F3EE'
    },
    fontFamily: {
      script: ['"Great Vibes"', 'cursive'],          // titres
      serif:  ['"Cormorant Garamond"', 'serif'],     // textes
      sans:   ['Inter', 'sans-serif']                // formulaires
    }
  }
}
```

- Fond noir profond avec des accents bleu ciel (titres, boutons, liens)
- Le rouge des roses est réservé à `/mon-amour`, pour en faire un espace à part
- Mobile en priorité : la plupart des proches écriront depuis leur téléphone

---

## 5. Langues

- Traductions avec **Transloco** (changement de langue sans recharger la page)
- Fichiers : `public/i18n/fr.json`, `en.json`
- Sélecteur FR | EN dans l'en-tête, avec la langue du navigateur détectée par défaut
- Les messages sont affichés dans la langue où ils ont été écrits (pas de traduction automatique)

Exemples de clés :
```json
{
  "home.title": "Joyeux anniversaire Victorine",
  "home.secret": "Chut… c'est une surprise",
  "form.memory": "Quel souvenir gardes-tu avec Victorine ?"
}
```

---

## 6. Structure du projet

```
birthday-victorine-nabino/
├── api/                          # fonctions serverless Vercel
│   ├── messages.ts               # GET (après REVEAL_AT) / POST
│   ├── upload-url.ts             # URL signée pour l'envoi des photos
│   ├── mon-amour/unlock.ts       # vérifie le code secret
│   ├── mon-amour/content.ts      # contenu privé (avec jeton)
│   └── admin/moderate.ts
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── home/             # formulaire, compte à rebours, galerie
│   │   │   ├── souvenirs/        # mur et diaporama
│   │   │   ├── mon-amour/        # espace privé
│   │   │   └── admin/
│   │   ├── components/           # countdown, rose-rain, envelope, message-card, lightbox, lang-switch
│   │   ├── services/             # messages.service, reveal.service, i18n
│   │   └── guards/               # reveal.guard, mon-amour.guard
│   ├── assets/
│   │   ├── img/accueil/          # photos publiques de l'accueil
│   │   └── i18n/
│   └── styles.css
├── private-media/                # ⚠️ PAS déployé : à envoyer dans le bucket Supabase privé
│   └── mon-amour/
├── vercel.json
└── README.md
```

---

## 7. Données (Supabase)

**Table `messages`**
| Colonne | Type | Note |
|---|---|---|
| id | uuid | |
| author_name | text | |
| relation | text | famille, ami·e, collègue… |
| lang | text | fr / en (langue de l'interface au moment de l'envoi) |
| body | text | 2000 caractères maximum |
| photo_path | text | nullable |
| video_path | text | nullable |
| city | text | nullable, non utilisé (plus demandé) |
| hearts | int | réactions de Victorine |
| hidden | bool | modération |
| created_at | timestamptz | |

**Buckets :** `souvenirs` (public après la révélation, en lecture via l'API), `mon-amour` (privé, URL signées)

---

## 8. Variables d'environnement (Vercel)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=      # uniquement côté serveur
REVEAL_AT=2026-11-09T18:00:00Z
MON_AMOUR_CODE=                 # code secret transmis à Victorine
ADMIN_PASSWORD=
JWT_SECRET=
```

---

## 9. Musique : note importante

Le clip **KS Bloom, « La Mour »** est une œuvre protégée. Pour l'utiliser légalement, il vaut mieux **intégrer le clip officiel YouTube** (iframe `youtube-nocookie.com`) que d'héberger le fichier MP3 ou MP4 sur le site.
Les navigateurs bloquent la lecture automatique avec le son : la musique se lance quand Victorine ouvre l'enveloppe, puisqu'un clic de sa part autorise la lecture.

---



## 10. Lancer le projet

```bash
npm install
npm run start            # http://localhost:4200
vercel dev               # pour tester aussi les fonctions /api
vercel --prod            # déploiement
```

Pour tester la révélation en local : `REVEAL_AT=2020-01-01T00:00:00Z`.

---

## 12. Mise en route (pas à pas)

1. **Supabase** : créer un projet gratuit sur supabase.com, puis dans *SQL Editor* exécuter [supabase/schema.sql](supabase/schema.sql) (table `messages`, fonction `increment_hearts`, buckets privés `souvenirs` et `mon-amour`).
2. **Médias privés** : envoyer `private-media/mon-amour/` dans le bucket privé :
   ```powershell
   $env:SUPABASE_URL="https://xxx.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="..."; npm run upload:private
   ```
3. **Variables** : copier `.env.example` en `.env.local` (pour `vercel dev`) et les saisir aussi dans Vercel › Settings › Environment Variables. `JWT_SECRET` : une longue chaîne aléatoire.
4. **Contenu de `/mon-amour`** : personnaliser [api/_lib/mon-amour-content.ts](api/_lib/mon-amour-content.ts) (lettre, 12 raisons, frise, bons cadeaux, date du mariage) et renseigner l'identifiant YouTube du clip (`MON_AMOUR_YOUTUBE_ID`). Ce fichier reste côté serveur : il n'apparaît jamais dans le JavaScript du site.
5. **Déployer** : `vercel --prod` (projet `birthday-victorine-nabino`).
6. **Admin** : `/admin` (mot de passe `ADMIN_PASSWORD`) pour modérer, suivre le compteur, lister qui n'a pas encore écrit et télécharger le QR code de la soirée.

### Notes techniques
- Angular 21 sert les fichiers statiques depuis `public/` : les traductions sont dans `public/i18n/` et les photos d'accueil dans `public/img/accueil/`.
- Tailwind v4 : les couleurs et polices de la section 4 sont déclarées dans `src/styles.css` (bloc `@theme`) et non dans un `tailwind.config.js`.
- `npm run start` seul n'a pas d'API : le compte à rebours fonctionne sur l'heure locale, mais l'envoi de messages nécessite `vercel dev`.
- `npm run check:api` vérifie les types des fonctions serverless.
- `private-media/` et `img/Mon-amour/` sont exclus de Git et du déploiement (`.gitignore`, `.vercelignore`).
