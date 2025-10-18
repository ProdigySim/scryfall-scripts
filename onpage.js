function getId(print) {
  return `${print.dataset.scryfallId}-${print.dataset.finish}`;
}


const currentCollection = (() => {
  try { 
    const lsCollection = JSON.parse(localStorage.getItem("userCollection"));
    if(lsCollection.version === 1 && Array.isArray(lsCollection.prints) && typeof lsCollection.prints[0] === 'string') {
      return new Set(lsCollection.prints);
    } else {
      console.log("Invalid collection", lsCollection);
    }
  } catch(e) {
    console.log("Failure while parsing collection from local storage", e)
  }
  return new Set();
})();

function saveToLocalStorage() {
  localStorage.setItem("userCollection", JSON.stringify({
    version: 1,
    prints: Array.from(currentCollection),
  }));
}

const printMap = Array.from(document.querySelectorAll('.print')).map((p) => {
  const id = getId(p);
  if(currentCollection.has(id)) {
    p.classList.add("collected");
  }
  return {
    id: getId(p),
    element: p,
  };
}).reduce((acc, next) => {
  acc.set(next.id, next)
  return acc;
}, new Map());

function addToCollection(id) {
  currentCollection.add(id);
  printMap.get(id)?.element.classList.add("collected");
  saveToLocalStorage();
}
function removeFromCollection(id) {
  currentCollection.delete(id);
  printMap.get(id)?.element.classList.remove("collected");
  saveToLocalStorage();
}
document.querySelector(".prints").addEventListener("click", (e) => {
  const clickedPrint = e.target.closest(".print");
  if(clickedPrint) {
    const id = getId(clickedPrint);
    if(currentCollection.has(id)) {
      removeFromCollection(id);
    } else {
      addToCollection(id);
    }
  }
});

function loadCollection(collection) {
  currentCollection.clear();
  for(const item of collection) {
    currentCollection.add(item);
  }
  saveToLocalStorage();
  for(const [id, {element}] of printMap) {
    if(currentCollection.has(id)) {
      element.classList.add("collected");
    } else {
      element.classList.remove("collected");
    }
  }
}

document.getElementById('cc').addEventListener("click", () => {
  navigator.clipboard.writeText(JSON.stringify(Array.from(currentCollection)));
});
document.getElementById('lc').addEventListener("click", async () => {
  try {
    const data = await navigator.clipboard.readText();
    const collection = JSON.parse(data);
    if(Array.isArray(collection) && typeof collection[0] === 'string') {
      // 6f1c8cb0-38eb-408b-94e8-16db83999b3b-foil
      loadCollection(collection.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[a-z]+/.test(id)));
    }
  } catch(e) {
    console.error("Failed to read clipboard collection", e);
  }
});