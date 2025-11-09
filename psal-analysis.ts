import { Cards, Card } from 'npm:scryfall-api';
import { loadCards } from './utils.ts';
import { sortCards } from './sortCards.ts';

function toCardId(c: Card) {
  const collNumFixed = c.collector_number.replace("★", "");
  return `${c.set.toUpperCase()} ${collNumFixed}`;
}
function shortenSetName(s: string) {
  return s
    .replace("World Championship Decks", "World Champ. Deck")
    .replace("Fourth Edition Foreign Black Border", "4th Ed. Foreign Black Border")
    .replace("The Lord of the Rings", "LotR")
    .replace("Commander Legends:", "CL:")
    .replace("Global Series", "G.S.")
    .replace("Duel Decks:", "DD:")
    .replace("Duel Decks Anthology:", "DDA:");
}

function dateFmt(released_at: Date) {
  return released_at.toISOString().split('T')[0];
}
function oDateFmt(released_at?: Date) {
  return released_at ? dateFmt(released_at) : "NO";
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const illustrations = new Map([
  ["a008404e-decd-462e-a94b-d70c7f1217c5", "Orange Light Mid"],
  ["b9aa17de-a31a-4ce7-ac53-a535527e4e24", "Tall bois"],
  ["45a0e760-2c7f-473f-a50b-9bfe0726406d", "Lean on me"],
  ["ab752bab-e271-453c-94ca-7df6ecb4954e", "Complex Curly"],
  ["65ae37b2-27ae-4680-865c-bc9a4e3156e9", "Kamigawa"],
  ["74980bb4-4270-404b-a441-1dd53bdb4682", "Green Haze"],
  ["7016acf1-7679-4c32-aa5c-9c5eaaccd328", "Ravnica"]
])
const prints = await loadCards("forests.json");
const sortedPrints = prints.toSorted(sortCards);

console.log("Set,Scryfall C. Num,Card Number,Spanish,French,Italian,Illustration Short,Artist,Illustration Id");
for(const print of sortedPrints) {
  const {
    set,
    collector_number,
    illustration_id,
    artist,
  } = print;
  if(set.toLocaleLowerCase() !== 'psal') {
    continue;
  }

  await delay(500);
  const es = await Cards.bySet(set, collector_number as unknown as number, "es");
  const fr = await Cards.bySet(set, collector_number as unknown as number, "fr");
  const it = await Cards.bySet(set, collector_number as unknown as number, "it");

  const cardnum = collector_number.slice(1);
  const illShort = illustrations.get(illustration_id ?? '') ?? 'Unknown';
  const illusts = [es?.illustration_id, fr?.illustration_id, it?.illustration_id].flatMap(x => x || []);
  if(!illusts.every(id => id === illustration_id)) {
    console.error(`Illustration exception on ${collector_number}`);
  }
  console.log(`psal,${collector_number},${cardnum},${oDateFmt(es?.released_at)},${oDateFmt(fr?.released_at)},${oDateFmt(it?.released_at)},${illShort},${artist},${illustration_id}`);
}
