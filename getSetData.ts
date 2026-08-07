import { DOMParser, Node } from "jsr:@b-fuze/deno-dom";

export class SetSection {
  public setCode: string;
  public ranges: Array<number | [number, number]>;
  constructor(public title: string, public query: string) {
    const parsed = parseSectionQuery(query);
    this.setCode = parsed.set;
    this.ranges = parsed.ranges;
  }

  public matches(s: string, cn: number) {
    if (s != this.setCode) return false;
    return this.ranges.some((r) => {
      return typeof r === "number" ? r === cn : (cn >= r[0] && cn <= r[1]);
    });
  }
}
export async function getSetSections(setCode: string) {
  const res = await fetch(
    `https://scryfall.com/sets/${setCode}?as=grid&order=set`,
  );
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  return Array.from(
    doc.querySelectorAll(".card-grid-header-content"),
  ).map((h, idx) => {
    const title = Array.from(h.childNodes)
      .find((n) => n.nodeType === Node.TEXT_NODE)
      ?.textContent.trim();
    if (!title) {
      throw new Error(`Couldn't find title for section "${idx}"`);
    }
    const searchLink = h.querySelector("a")?.getAttribute("href");

    if (!searchLink) {
      console.error(`Couldn't find search link for "${title}"`);
    }
    const query = new URLSearchParams(searchLink?.split("?")[1]).get("q")!;

    return new SetSection(title, query);
  });
}

interface SectionQuery {
  set: string;
  ranges: Array<number | [number, number]>;
}
function parseSectionQuery(query: string) {
  // console.log(query);
  // To avoid building an actual parser, let's just look for stuff
  // assume sld if there's no set
  const set = /e:([^\s]+)/.exec(query)?.[1] ?? "sld";

  const rangeQuery = /cn≥(\d+) cn≤(\d+)/g;
  let nextRange;
  const ranges = new Array<number | [number, number]>();
  while (nextRange = rangeQuery.exec(query)) {
    ranges.push([
      parseInt(nextRange[1], 10),
      parseInt(nextRange[2], 10),
    ]);
  }
  const singleQuery = /cn:"?(\d+)"?/g;
  let nextSingle;
  while (nextSingle = singleQuery.exec(query)) {
    ranges.push(parseInt(nextSingle[1], 10));
  }
  return {
    set,
    ranges,
  };
}

export async function getWcSetData(set: string) {
  const res = await fetch(`https://scryfall.com/sets/${set}?as=grid&order=set`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  return Array.from(
    doc.querySelectorAll(".card-grid-header-content"),
  ).map((h, idx) => {
    const name = Array.from(h.childNodes)
      .find((n) => n.nodeType === Node.TEXT_NODE && !!n.textContent.trim())
      ?.textContent.trim();
    if (!name) {
      throw new Error(`Couldn't find title for section "${idx}"`);
    }
    const id = h.querySelector("a")?.getAttribute("id");

    if (!id) {
      throw new Error(`Couldn't find id for "${name}"`);
    }
    return {
      set,
      id,
      name,
    };
  });
}

if (import.meta.main) {
  const sections = await getSetSections("sld");
  console.log(sections);
  await Deno.writeTextFile("sld.json", JSON.stringify(sections, undefined, 2));
  console.log(sections.find((s) => s.matches("sld", 1949)));

  console.log(await getWcSetData("wc98"));
}
