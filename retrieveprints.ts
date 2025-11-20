import { Cards, Card } from "npm:scryfall-api";
import { pick } from "jsr:@es-toolkit/es-toolkit";



function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function *fetchPrints(search: string) {
  const sres = Cards.search(search, { unique: 'prints', include_extras: true, include_variations: true});
  let cur ;
  let sum = 0;
  do {
    cur = await sres.next();
    yield * cur;
    sum+= cur.length;
    console.log(`Fetching next page ${sum}/${sres.count}`)
    if(sum > sres.count) throw new Error("too many cards");
    await delay(500);
  } while (sres.hasMore);
}

interface List<T> {
  object: "list"
  total_cards: number
  has_more: boolean;
  next_page: string;
  data: Array<T>;
}

const prints: Card[] = [];
for await ( const print of fetchPrints("!\"Forest\" include:extras -layout:art_series game:paper")) {
  prints.push(print);
}

console.log("Received:", prints.length);
for await ( const print of fetchPrints("!\"Snow-Covered Forest\" include:extras -layout:art_series  game:paper")) {
  prints.push(print);
}
console.log("Received:", prints.length);
for await ( const print of fetchPrints("!\"Forest\" include:extras s:9ed l:ru -layout:art_series  game:paper")) {
  // We only care about nonfoil finish of 9ed fbb
  print.finishes = ['nonfoil'];
  prints.push(print);
}
console.log("Received:", prints.length);


function removeIrrelevantFields(c: Card) {
  return pick(c, [
    'object',
    'id',
    'oracle_id',
    'name',
    'printed_name',
    'lang',
    'released_at',
    'uri',
    'scryfall_uri',
    'layout',
    'highres_image',
    'image_status',
    'image_uris',
    'keywords',
    'games',
    'mtgo_foil_id',
    'finishes',
    'oversized',
    'promo',
    'reprint',
    'variation',
    'set_id',
    'set',
    'set_name',
    'set_type',
    'collector_number',
    'digital',
    'artist',
    'artist_ids',
    'illustration_id',
    'border_color',
    'frame',
    'full_art',
    'booster',
    'story_spotlight',
    'promo_types',
  ]);
}
await Deno.writeTextFile("forests.json", JSON.stringify(prints.map(removeIrrelevantFields), undefined, 2));
