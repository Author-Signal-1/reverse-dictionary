import puzzles from "../../../data/puzzles.json";

// Filter only 5-letter answers
const fiveLetterPuzzles = puzzles.filter(p => p.answer.length === 5);

export async function GET() {
  const index = (Math.floor(Date.now() / 86400000) + 713) % fiveLetterPuzzles.length;
  const { id, clue } = fiveLetterPuzzles[index];
  return Response.json({ id, clue });
}
