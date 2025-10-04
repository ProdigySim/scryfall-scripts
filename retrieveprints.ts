import { Cards, Card } from "npm:scryfall-api";



function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

async function *fetchPrints(initialUrl: string) {
  let nextUrl = initialUrl;
  let next;
  let sum = 0;
  do {
    next = await fetchJson<List<Card>>(nextUrl);
    yield * next.data;
    sum+= next.data.length;
    nextUrl = next.next_page;
    console.log(`Fetching next page ${sum}/${next.total_cards}`)
    if(sum > next.total_cards) throw new Error("too many cards");
  } while (next.has_more);
}

interface List<T> {
  object: "list"
  total_cards: number
  has_more: boolean;
  next_page: string;
  data: Array<T>;
}
const ForestCard = await Cards.byName("Forest");
const SnowForestCard = await Cards.byName("Snow-Covered Forest");

const prints: Card[] = [];
for await ( const print of fetchPrints(ForestCard!.prints_search_uri)) {
  prints.push(print);
}
console.log("Received:", prints.length);
for await ( const print of fetchPrints(SnowForestCard!.prints_search_uri)) {
  prints.push(print);
}
console.log("Received:", prints.length);


await Deno.writeTextFile("forests.json", JSON.stringify(prints, undefined, 2));