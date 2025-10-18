import type { Card } from 'npm:scryfall-api';
import { loadCards } from './utils.ts';

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
  const [m,d,y] = released_at.toLocaleDateString().split('/').map(n => n.padStart(2, "0"));
  return [y,m,d].join('-');
}

const prints = await loadCards("forests.json");
const sortedPrints = prints.toSorted((a,b) => {
  const dateDiff = +a.released_at - +b.released_at;
  if(dateDiff !== 0) return dateDiff;
  const setDiff = a.set.localeCompare(b.set)
  if(setDiff !== 0) return setDiff;
  return a.collector_number.localeCompare(b.collector_number);
});
let i =0;
const htmls: string[] = [];
for(const print of sortedPrints) {
  const {
    id,
    released_at,
    lang,
    image_uris,
    finishes,
    set_name,
  } = print;

  if(lang != "en") console.log(`Non-English: ${set_name} ${toCardId(print)}`);
  const image = image_uris ? image_uris.normal : print.card_faces?.[0]?.image_uris?.normal;
  for(const finish of finishes) {
    const html = `
      <div class='print' id='${i}' data-scryfall-id="${id}" data-finish="${finish}">
        <div class="num">${i.toString(10).padStart(4, "0")}</div>
        <img class="front" src="${image}" />
        <div class="name">${shortenSetName(set_name)}</div>
        <div class="set">${finish === 'nonfoil' ? '' : `${finish.toUpperCase()} `}${toCardId(print)}</div>
        <div class="date">${dateFmt(released_at)}</div>
      </div>
      `;
    htmls.push(html);
    i++;
  }
}

const layout = await Deno.readTextFile("layout.html");
const text = layout.replace("##__INSERT_PRINTS__HERE__##", htmls.join(""))
await Deno.writeTextFile("forests.html", text);