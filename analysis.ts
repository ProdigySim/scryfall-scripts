import { loadCards } from './utils.ts';


const cards = await loadCards("forests.json");

const layouts = new Set<string>();
const finishes = new Set<string>();
const strangeCollNums = new Array<string>();
for(const card of cards) {
  layouts.add(card.layout);
  for(const finish of card.finishes) {
    finishes.add(finish);
  }
  if(!/^\d+$/.test(card.collector_number)) {
    strangeCollNums.push(`${card.set}: ${card.collector_number}`);
  }
}

console.log(layouts);
console.log(finishes);
Deno.writeTextFileSync("strange-collector-numbers.txt", Array.from(strangeCollNums).join('\n'));