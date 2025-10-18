import { loadCards } from './utils.ts';


const cards = await loadCards("forests.json");

const layouts = new Set<string>();
const finishes = new Set<string>();
for(const card of cards) {
  layouts.add(card.layout);
  for(const finish of card.finishes) {
    finishes.add(finish);
  }
}

console.log(layouts);