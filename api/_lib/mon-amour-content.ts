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
  from: 'Ton fiancé',

  /** Identifiant YouTube du clip officiel KS Bloom – « La Mour » (ex. « dQw4w9WgXcQ »).
   *  Peut aussi être défini par la variable d'environnement MON_AMOUR_YOUTUBE_ID. */
  youtubeId: 'urKi73dMKjA',

  letter: {
    title: 'Ma Victorine,',
    paragraphs: [
      "Aujourd'hui, le monde entier fête ta naissance, mais moi, je fête chaque jour la chance de t'avoir trouvée.",
      "[À personnaliser] Raconte-lui ici ce que tu ressens, un souvenir précis, une promesse pour l'année qui vient…",
      'Joyeux anniversaire, mon amour. Je suis fier de toi, et je suis à toi.',
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

  /** Frise de votre histoire. `photo` est un chemin facultatif dans le bucket « mon-amour ». */
  timeline: [
    { date: '[Date]', title: 'Notre rencontre', text: '[À personnaliser] Où, comment, ce que tu as pensé ce jour-là.', photo: 'nous-deux-1.jpeg' as string | null },
    { date: '[Date]', title: 'Notre premier rendez-vous', text: '[À personnaliser]', photo: 'nous-deux-2.jpeg' as string | null },
    { date: '20/09/2025', title: 'Un jour à nous', text: '[À personnaliser]', photo: 'photo-1.jpg' as string | null },
    { date: '[Date]', title: 'Nos fiançailles', text: '[À personnaliser] Le jour où tu as dit oui.', photo: 'nous-deux-3.jpeg' as string | null },
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
