# scryfall-scripts

Scripts in this repo are used to build a webpage showing a collection of cards from scryfall. Right now it's set to a forests collection.

Hosted version of this page: https://prodigysim.github.io/scryfall-scripts/forests.html 

## Usage

There are two main scripts in this repo: `retrieveprints.ts` and `processprints.ts`. Both require Deno installed to use.

1. Run `deno run -A retrieveprints.ts` to fetch card information from scryfall based on the queries in the script
2. Run `deno run -A processprints.ts` to sort the cards and make a webpage out of the prints found.
3. Open `forests.html` in your browser to view the generated page.

