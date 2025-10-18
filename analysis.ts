import { loadCards } from './utils.ts';


const cards = await loadCards("forests.json");

const layouts = new Set<string>();
for(const card of cards) {
  layouts.add(card.layout);
}

console.log(layouts);