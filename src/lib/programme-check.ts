// Rappel des programmes annoncés dont la date est passée : partagé par scripts/build-data.ts et les tests (aucun import d'alias).

interface CandidatInput {
  id: string;
  programme: { annonce?: { date: string } };
}

/** Un message par candidat dont le programme était annoncé au plus tard `today` (AAAA-MM-JJ). */
export function programmeReminders(candidats: readonly CandidatInput[], today: string): string[] {
  return candidats
    .filter((c) => c.programme.annonce && c.programme.annonce.date <= today)
    .map((c) => `candidats.json ${c.id} : programme annoncé pour le ${c.programme.annonce!.date}, le relire et mettre à jour programme (puis retirer annonce)`);
}
