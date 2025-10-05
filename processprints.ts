import type { Card } from 'npm:scryfall-api';

function toCardId(c: Card) {
  return `${c.set.toUpperCase()} ${c.collector_number}`;
}
function shortenSetName(s: string) {
  return s
    .replace("World Championship Decks", "World Champ. Deck")
    .replace("Fourth Edition Foreign Black Border", "4th Ed. Foreign Black Border")
    .replace("The Lord of the Rings", "LotR")
    .replace("Commander Legends:", "CL:");
}

const prints = JSON.parse(await Deno.readTextFile("forests.json"));

const sortedPrints = prints.toSorted((a,b) => {
  const dateDiff = +new Date(a.released_at) - +new Date(b.released_at);
  if(dateDiff !== 0) return dateDiff;
  const setDiff = a.set.localeCompare(b.set)
  if(setDiff !== 0) return setDiff;
  return a.collector_number - b.collector_number;
});
let i =0;
const htmls: string[] = [];
for(const print of sortedPrints) {
  const {
    released_at,
    lang,
    image_uris,
    finishes,
    collector_number,
    set,
    set_name,
  } = print;

  if(lang != "en") console.log(`Non-English: ${set_name} ${toCardId(print)}`);
  const image = image_uris ? image_uris.normal : print.card_faces?.[0]?.image_uris?.normal;
  for(const finish of finishes) {
    const html = `
      <div class='print' id='${i}'>
        <div class="num">${i.toString(10).padStart(4, "0")}</div>
        <img class="front" src="${image}" />
        <div class="name">${shortenSetName(set_name)}</div>
        <div class="set">${finish === 'nonfoil' ? '' : `${finish.toUpperCase()} `}${toCardId(print)}</div>
        <div class="date">${released_at}</div>
      </div>
      `;
    htmls.push(html);
    i++;
  }
}

const text = `
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="index.css" />
  <link rel="icon" type="image/png" href="favicon.png" />
  <title>Forests</title>
</head>
<body>
  <div class="prints">
${htmls.join("\n")}
  </div>
</body>
</html>`
await Deno.writeTextFile("forests.html", text);