import type { Card } from 'npm:scryfall-api';

export function parseCard(c: Card): Card {
  return {
    ...c,
    released_at: new Date(c.released_at),
  }
}

export async function loadCards(path: string) {
  return (JSON.parse(await Deno.readTextFile(path)) as Card[]).map(parseCard);
}