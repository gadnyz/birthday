/**
 * CONTENU PRIVÉ DE /mon-amour : à personnaliser par le fiancé.
 *
 * Ce fichier vit côté serveur (dossier api/) : il n'est jamais envoyé dans le JavaScript du site.
 * Il n'est servi que par /api/mon-amour/content, avec un jeton valide.
 * Les chemins de médias pointent vers le bucket Supabase PRIVÉ « mon-amour »
 * (voir scripts/upload-private-media.mjs pour y envoyer le dossier private-media/mon-amour).
 */
export const monAmourContent = {
  /** Signature affichée en bas de la lettre. */
  from: 'With much love, Gavi',

  /** Identifiant YouTube du clip officiel KS Bloom – « La Mour » (ex. « dQw4w9WgXcQ »).
   *  Peut aussi être défini par la variable d'environnement MON_AMOUR_YOUTUBE_ID. */
  youtubeId: 'urKi73dMKjA',

  letter: {
    title: 'Chérie,',
    paragraphs: [
      "Je t'aime, je t'aime, je t'aime.",
      "Tu es la première personne à qui j'ai dit ces mots : je t'aime.",
      "Au début, c'était très difficile, même de prononcer le mot « chérie ». Mais maintenant, je peux le dire aisément, grâce à toi.",
      "Tu m'as appris à aimer.",
      'Heart, tu es précieuse pour moi. Chérie, tu es unique pour moi.',
      "Tu es ma perle rare, la seule avec qui j'ai envie de passer toute ma vie sur terre. Mon amour, les mots du dictionnaire sont limités.",
      'Je me rappelle notre premier rendez-vous, après la conférence de Tshipama.',
      "Je me rappelle notre rendez-vous au zoo de Lubumbashi : une journée passée avec toi, c'est comme deux secondes.",
      "Je me rappelle encore, et surtout, notre tout premier baiser. J'ai envie de le refaire, mais je prie Dieu que le prochain soit devant l'officier de l'état civil, puis à l'église, et ensuite tous les jours, à deux, dans notre chambre, dans notre lit orné de fleurs et bien parfumé.",
      "Je n'oublierai jamais ton sacrifice : quitter Bukavu et venir à Lubumbashi, en grande partie pour moi.",
      'Je te souhaite tout le meilleur du monde, mi amor.',
      'Sweet Girl, I LOVE YOU!!!',
    ],
  },

  /** 12 raisons pour lesquelles je t'aime. */
  reasons: [
    'Ton sourire, qui éclaire même mes journées grises.',
    'Ta foi et ta force tranquille.',
    'La façon dont tu prends soin des autres.',
    'Ton rire quand tu ne t’y attends pas toi-même.',
    'Ta douceur, même quand je suis fatigué.',
    'Ton courage face aux défis.',
    'Tes messages du matin.',
    'Ta manière de rêver grand pour nous deux.',
    'Ta patience avec moi.',
    'Ta beauté, dedans comme dehors.',
    'Le calme que je ressens à tes côtés.',
    'Parce que tu as dit oui.',
  ],


  /** Galerie privée. */
  photos: [
    { path: 'nous-deux-1.jpeg', caption: '' },
    { path: 'nous-deux-2.jpeg', caption: '' },
    { path: 'nous-deux-3.jpeg', caption: '' },
    { path: 'nous-deux-4.jpeg', caption: '' },
    { path: 'photo-1.jpg', caption: '' },
    { path: 'photo-2.jpg', caption: '' },
    { path: 'photo-3.jpg', caption: '' },
  ],

  video: { path: 'nous-deux.mp4', caption: 'Nous deux' },

  /** Bons cadeaux à utiliser. Le champ icon est un nom d'icône (voir src/app/components/icon.ts). */
  coupons: [
    { icon: 'utensils', title: 'Un dîner en tête-à-tête', text: 'Le restaurant de ton choix, sans regarder la carte des prix.' },
    { icon: 'leaf', title: 'Une journée détente', text: 'Massage, repos et zéro corvée.' },
    { icon: 'film', title: 'Soirée film', text: 'Tu choisis le film, je fais le pop-corn, aucune plainte.' },
    { icon: 'plane', title: 'Une escapade surprise', text: 'Un week-end, une destination secrète.' },
    { icon: 'heart', title: 'Câlin illimité', text: 'Valable à vie, sans date d’expiration.' },
    { icon: 'soup', title: 'Je cuisine pour toi', text: 'Ton plat préféré, fait avec amour.' },
  ],

  /** Prochain grand rendez-vous (mariage ou retrouvailles). Laisser `at` vide pour masquer. */
  nextDate: { label: 'Jusqu’à notre mariage', at: '' },
};
