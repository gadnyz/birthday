/** Lecture centralisée des variables d'environnement (côté serveur uniquement). */
export const env = {
  supabaseUrl: process.env['SUPABASE_URL'] ?? '',
  supabaseKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
  revealAt: new Date(process.env['REVEAL_AT'] ?? '2026-11-09T18:00:00Z'),
  monAmourCode: process.env['MON_AMOUR_CODE'] ?? '',
  adminPassword: process.env['ADMIN_PASSWORD'] ?? '',
  jwtSecret: process.env['JWT_SECRET'] ?? '',
  youtubeId: process.env['MON_AMOUR_YOUTUBE_ID'] ?? '',
};

export function isRevealed(now = new Date()): boolean {
  return now.getTime() >= env.revealAt.getTime();
}
