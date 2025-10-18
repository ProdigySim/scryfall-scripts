import { expect } from "jsr:@std/expect";import { loadCards } from "./utils.ts";
import { sortCards } from "./sortCards.ts";
import type { Card } from "npm:scryfall-api";

// TODO: Should we permute cards for testing?

function sortedSetNumbers(set: string) {
  return cards.filter(c => c.set === set).reverse().toSorted(sortCards).map(c => c.collector_number);
}

function makeSet(numbers: string[]) {
  const d = new Date();
  return numbers.map(n => ({
    released_at: d, set: 'a',
    collector_number: n
    })) as unknown as Card[];
}
const cards = await loadCards("forests.json");
Deno.test("Normal cards should be sorted by number", () => {
  expect(sortedSetNumbers('inv')).toEqual(['347', '348', '349', '350']);
})
Deno.test("Mixed digit length should be sorted appropriately", () => {
  expect(sortedSetNumbers('palp')).toEqual(['1', '6', '11']);
})
Deno.test("Star numbers should be sorted next to regular numbers", () => {
  expect(sortedSetNumbers('7ed')).toEqual(
    ['328', '328★', '329', '329★', '330', '330★', '331', '331★']
  );
})
Deno.test("Letters then numbers should be sorted by letters then numbers", () => {
  expect(sortedSetNumbers('wc04')).toEqual(
    ['jn347', 'jn348', 'jn350']
  );
  expect(sortedSetNumbers('wc03')).toEqual(
    ['dh348', 'dh349', 'dh350', 'dz347', 'dz348', 'dz349']
  );

  const fakeCards = makeSet([
    'a324',
    'b32',
    'a23',
    'b100',
    'ac20'
  ]);
  expect(fakeCards.toSorted(sortCards).map(x => x.collector_number)).toEqual(['a23', 'a324', 'ac20', 'b32', 'b100']);
});

Deno.test("Hyphenated numbers should sort by segments", () => {
  expect(sortedSetNumbers('plst')).toEqual(
    // Release order makes this not a perfect test
    ['AKH-268', 'HOU-198', 'HOU-199', 'LCI-401', 'MKM-285', 'WOE-276', 'NEO-292', 'JMP-73', 'JMP-74', 'JMP-76']
  );
  // hypothetical set if they all had the same release date
  const fakeCards = makeSet(['AKH-268', 'JMP-73', 'HOU-198', 'HOU-199', 'LCI-401', 'MKM-285', 'WOE-276', 'NEO-292', 'JMP-74', 'JMP-76']);
  expect(fakeCards.toSorted(sortCards).map(x => x.collector_number)).toEqual(['AKH-268', 'HOU-198', 'HOU-199', 'JMP-73', 'JMP-74', 'JMP-76', 'LCI-401', 'MKM-285', 'NEO-292', 'WOE-276' ]);

});



Deno.test("Character suffix should trail base number", () => {
  expect(sortedSetNumbers('por')).toEqual(
    ['212', '212s', '213', '213s', '214', '214s', '215', '215s']
  );
  expect(sortedSetNumbers('wc01')).toEqual(
    ['jt328', 'jt329', 'jt347', 'jt347a', 'jt348', 'jt348a', 'jt349', 'jt349a']
  );
});

