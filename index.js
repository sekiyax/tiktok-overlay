const path = require('path');
const fastify = require('fastify')({ logger: false });

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

// Item Icons Mapping
const itemIcons = {
  "carrot": "carrot.png", "strawberry": "strawberry.png", "blueberry": "blueberry.png", 
  "orange tulip": "orangetulip.png", "tomato": "tomato.png", "daffodil": "daffodil.png", 
  "corn": "corn.png", "watermelon": "watermelon.png", "pumpkin": "pumpkin.png", 
  "apple": "apple.png", "bamboo": "bamboo.png", "coconut": "coconut.png", 
  "cactus": "cactus.png", "dragon fruit": "dragonfruit.png", "mango": "mango.png", 
  "mushroom": "mushroom.png", "grape": "grape.png", "pepper": "pepper.png", 
  "pepper seed": "pepper.png", "cacao": "cacao.png", "beanstalk": "beanstalk.png", 
  "ember lily": "emberlily.png", "sugar apple": "sugarapple.png",
  "watering can": "wateringcan.png", "trowel": "trowel.png", "recall wrench": "recallwrench.png", 
  "basic sprinkler": "basicsprinkler.png", "advanced sprinkler": "advancedsprinkler.png", 
  "godly sprinkler": "godlysprinkler.png", "lightning rod": "lightningrod.png", 
  "master sprinkler": "mastersprinkler.png", "favorite tool": "favoritetool.png", 
  "harvest tool": "harvesttool.png", "friendship pot": "friendshippot.png",
  "cleaning spray": "cleaningspray.png",
  "flower seed pack": "flowerseedpack.png", "nectarine seed": "nectarineseed.png", 
  "hive fruit seed": "hivefruitseed.png", "honey sprinkler": "honeysprinkler.png", 
  "bee egg": "beeegg.png", "bee crate": "beecrate.png", "honey comb": "honeycomb.png", 
  "bee chair": "beechair.png", "honey torch": "honeytorch.png", "honey walkway": "honeywalkway.png", 
  "lavender": "lavender.png", "nectarshade": "nectarshade.png", "pollen radar": "pollenradar.png",
  "common egg": "commonegg.png", "uncommon egg": "uncommonegg.png", "rare egg": "rareegg.png", 
  "legendary egg": "legendaryegg.png", "mythical egg": "mythicalegg.png", "bug egg": "bugegg.png",
  "statue crate": "statuecrate.png", "classic gnome crate": "classicgnomecrate.png",
  "fun crate": "funcrate.png", "farmer gnome crate": "farmergnomecrate.png",
  "red tractor": "redtractor.png", "green tractor": "greentractor.png"
};

// Item Colors
const itemColors = {
  "watermelon": "#FF69B4", "pumpkin": "#FF8C00", "apple": "#DC143C", "bamboo": "#32CD32",
  "coconut": "#FFD700", "cactus": "#7CFC00", "dragon fruit": "#FF4500", "mango": "#FFD700",
  "mushroom": "#FF6347", "grape": "#9370DB", "pepper": "#FF0000", "pepper seed": "#FF0000",
  "cacao": "#FF8C00", "beanstalk": "#00FF7F", "godly sprinkler": "#FFD700", 
  "lightning rod": "#FFD700", "master sprinkler": "#00CED1", "bee egg": "#FFD700",
  "flower seed pack": "#FF69B4", "nectarine seed": "#FFA500", "hive fruit seed": "#32CD32",
  "honey sprinkler": "#FFD700", "mythical egg": "#BA55D3", "bug egg": "#FF6347",
  "ember lily": "#FF4500", "friendship pot": "#FF69B4", "lavender": "#9370DB",
  "nectarshade": "#32CD32", "pollen radar": "#FFD700", "sugar apple": "#FF69B4",
  "statue crate": "#FFD700", "classic gnome crate": "#00CED1", "fun crate": "#FF69B4",
  "farmer gnome crate": "#32CD32", "red tractor": "#FF0000", "green tractor": "#00FF00"
};

// Special items with golden blinking background (only quantity text will be black)
const specialItems = new Set([
  "mushroom", "grape", "pepper", "cacao", "beanstalk",
  "ember lily", "sugar apple", "master sprinkler", "bug egg", "friendship pot",
  "bee egg", "mythical egg"
]);

let stockData = {
  "Honey Shop": {
    displayName: "Swarm Event",
    items: [],
    lastUpdate: 0,
    interval: 3600,
    headerColor: "#FFD700",
    headerTextColor: "#000000",
    displayDuration: 10
  },
  "Egg Restock": {
    displayName: "Egg restock",
    items: [],
    lastUpdate: 0,
    interval: 1800,
    headerColor: "#FFFDD0",
    headerTextColor: "#000000"
  },
  "Seed Restock": {
    displayName: "Seed restock",
    items: [],
    lastUpdate: 0,
    interval: 300,
    headerColor: "#32CD32",
    headerTextColor: "#000000"
  },
  "Tool Restock": {
    displayName: "Tool restock",
    items: [],
    lastUpdate: 0,
    interval: 300,
    headerColor: "#87CEEB",
    headerTextColor: "#000000"
  },
  "Cosmetic Shop": {
    displayName: "Cosmetic Shop",
    items: [],
    lastUpdate: 0,
    headerColor: "#FF8C00",
    headerTextColor: "#000000"
  },
  "WEATHER": {
    items: [],
    lastUpdate: 0,
    expiresAt: 0
  },
  "LAST SEEN": {
    displayName: "Last seen",
    items: [],
    lastUpdate: 0,
    headerColor: "#FFFFFF",
    headerTextColor: "#000000",
    trackedItems: [
      "watermelon", "pumpkin", "apple", "bamboo", "coconut", 
      "cactus", "dragon fruit", "mango", "mushroom", "grape", 
      "pepper seed", "cacao", "beanstalk", "ember lily", "godly sprinkler",
      "lightning rod", "master sprinkler", "friendship pot", "bee egg",
      "nectarine seed", "hive fruit seed", "honey sprinkler", "mythical egg", 
      "bug egg", "sugar apple"
    ],
    itemHistory: {},
    rotationIndex: 0,
    clientSideTimers: {}
  }
};

const trackedItems = new Set(stockData["LAST SEEN"].trackedItems);

function getItemColor(itemName) {
  const lowerItem = itemName.toLowerCase();
  for (const [key, color] of Object.entries(itemColors)) {
    if (lowerItem.includes(key)) return color;
  }
  return "#FFFFFF";
}

function getItemIcon(itemName, isCosmetic = false) {
  const lowerItem = itemName.toLowerCase().trim();

  if (isCosmetic || trackedItems.has(lowerItem)) {
    for (const [key, icon] of Object.entries(itemIcons)) {
      if (lowerItem.includes(key.toLowerCase())) return icon;
    }
    return "none.png";
  }

  if (lowerItem.includes("pepper") && !lowerItem.includes("seed")) {
    return "pepper.png";
  }

  for (const [key, icon] of Object.entries(itemIcons)) {
    if (lowerItem.includes(key.toLowerCase())) return icon;
  }

  return "none.png";
}

function isSpecialItem(itemName) {
  const lowerItem = itemName.toLowerCase().replace(/\s*x\d+/i, '').trim();
  return specialItems.has(lowerItem);
}

function combineEggItems(items) {
  if (!items.some(item => item.toLowerCase().includes("egg"))) return items;

  const eggCounts = {};
  const otherItems = [];

  items.forEach(item => {
    if (item.toLowerCase().includes("egg")) {
      const match = item.match(/(.*?)\s*x(\d+)/i) || [item, item.trim(), "1"];
      const name = match[1].trim();
      const count = parseInt(match[2]) || 1;
      eggCounts[name] = (eggCounts[name] || 0) + count;
    } else {
      otherItems.push(item);
    }
  });

  return [...otherItems, ...Object.entries(eggCounts).map(([name, count]) => `${name} x${count}`)];
}

function updateLastSeen(items) {
  const now = Math.floor(Date.now() / 1000);
  const lastSeenData = stockData["LAST SEEN"];

  items.forEach(item => {
    const cleanName = item.toLowerCase().replace(/\s*x\d+/i, '').trim();
    if (trackedItems.has(cleanName)) {
      const displayName = cleanName.replace(/\b\w/g, l => l.toUpperCase());
      if (!lastSeenData.itemHistory[displayName]) {
        lastSeenData.itemHistory[displayName] = now;
      }
    }
  });

  lastSeenData.lastUpdate = now;
  updateLastSeenDisplay();
}

function updateLastSeenDisplay() {
  const lastSeenData = stockData["LAST SEEN"];
  const now = Math.floor(Date.now() / 1000);
  const historyEntries = Object.entries(lastSeenData.itemHistory);

  if (historyEntries.length > 0) {
    const displayItems = [];
    const itemKeys = Object.keys(lastSeenData.itemHistory);

    for (let i = 0; i < 4 && i < itemKeys.length; i++) {
      const idx = (lastSeenData.rotationIndex + i) % itemKeys.length;
      const itemName = itemKeys[idx];
      const timeSeen = lastSeenData.itemHistory[itemName];
      const timeDiff = now - timeSeen;

      const hours = Math.floor(timeDiff / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((timeDiff % 3600) / 60).toString().padStart(2, '0');
      const seconds = (timeDiff % 60).toString().padStart(2, '0');

      displayItems.push(`${itemName} [${hours}:${minutes}:${seconds}]`);
    }

    lastSeenData.items = displayItems;
    lastSeenData.rotationIndex = (lastSeenData.rotationIndex + 1) % Math.max(1, itemKeys.length);
  }
}

function processEmbed(embed) {
  if (!embed.fields) return;

  embed.fields.forEach(field => {
    const category = field.name;
    const mappedCategory =
      category.includes("EVENT") || category.includes("HONEY") ? "Honey Shop" :
      category.includes("EGG") ? "Egg Restock" :
      category.includes("SEED") ? "Seed Restock" :
      category.includes("GEAR") || category.includes("TOOL") ? "Tool Restock" :
      category.includes("COSMETIC") ? "Cosmetic Shop" : category;

    if (stockData[mappedCategory]) {
      let items = field.value.split("\n")
        .filter(Boolean)
        .map(item => item.replace(/\*\*/g, "").trim())
        .filter(item => !item.toLowerCase().includes("night staff"));

      if (mappedCategory === "Egg Restock") {
        items = combineEggItems(items);
      }

      stockData[mappedCategory].items = items;
      stockData[mappedCategory].lastUpdate = Math.floor(Date.now() / 1000);

      if (mappedCategory === "WEATHER") {
        stockData[mappedCategory].expiresAt = Math.floor(Date.now() / 1000) + 10;
      }

      if (mappedCategory !== "Cosmetic Shop" && mappedCategory !== "WEATHER") {
        updateLastSeen(items);
      }
    }
  });
}

function calculateNextRestock(lastUpdate, interval) {
  if (lastUpdate === 0) return 0;
  const now = Math.floor(Date.now() / 1000);

  if (interval === 300) {
    const nextRestock = lastUpdate + interval;
    const nextDate = new Date(nextRestock * 1000);
    nextDate.setMinutes(Math.ceil(nextDate.getMinutes() / 5) * 5);
    nextDate.setSeconds(0);
    return Math.floor(nextDate.getTime() / 1000);
  }
  return Math.ceil(now / interval) * interval;
}

function getTimeUntilNextRestock(category) {
  const now = Math.floor(Date.now() / 1000);
  const data = stockData[category];

  if (!data || data.lastUpdate === 0) {
    return { mm: "--", ss: "--", nextRestock: 0 };
  }

  const nextRestock = calculateNextRestock(data.lastUpdate, data.interval);
  const remaining = Math.max(0, nextRestock - now);

  return {
    mm: String(Math.floor(remaining / 60)).padStart(2, "0"),
    ss: String(remaining % 60).padStart(2, "0"),
    nextRestock
  };
}

function renderWeather() {
  const now = Math.floor(Date.now() / 1000);
  const data = stockData["WEATHER"];

  if (data.items.length === 0 || now > data.expiresAt) return '';

  return `
    <div class="weather">
      <div class="weather-header">
        <span class="category-title">Weather</span>
        <span class="category-timer">Live</span>
      </div>
      <div class="items-list">
        ${data.items.map(item => `<div class="weather-item">${item}</div>`).join("")}
      </div>
    </div>
  `;
}

function renderItems(items, isCosmetic = false) {
  if (!items || items.length === 0) return '';

  return items.map(item => {
    const isSpecial = isSpecialItem(item);
    const specialClass = isSpecial ? "special-item" : "";

    if (isCosmetic) {
      const [itemName, quantity] = item.split(/(x\d+)/i);
      const cleanName = itemName.trim().toLowerCase();
      const color = getItemColor(itemName);
      const icon = getItemIcon(itemName, true);

      return `
        <div class="item-container ${specialClass}">
          <img src="/icons/${icon}" class="item-icon" onerror="this.src='/icons/none.png'">
          <span class="item-name" style="color:${color}">${itemName.trim()}</span>
          ${quantity ? `<span class="item-quantity">${quantity}</span>` : ''}
        </div>
      `;
    }

    // Special handling for Last Seen items
    const match = item.match(/(.*?)\s*\[(\d{2}:\d{2}:\d{2})\]/);
    if (match) {
      const itemName = match[1].trim();
      const time = match[2];
      const color = getItemColor(itemName);

      return `
        <div class="item-container ${specialClass}">
          <span class="last-seen-name" style="color:${color}">${itemName}</span>
          <span class="last-seen-time">${time}</span>
        </div>
      `;
    }

    // Default handling for other items
    const [itemName, quantity] = item.split(/(x\d+)/i);
    const cleanName = itemName.trim().toLowerCase();
    const color = getItemColor(itemName);
    const icon = getItemIcon(itemName);

    return `
      <div class="item-container ${specialClass}">
        <img src="/icons/${icon}" class="item-icon" onerror="this.src='/icons/none.png'">
        <span class="item-name" style="color:${color}">${itemName.trim()}</span>
        ${quantity ? `<span class="item-quantity">${quantity}</span>` : ''}
      </div>
    `;
  }).join('');
}

function renderCategory(category, isOverlay2 = false) {
  const data = stockData[category];
  if (!data) return '';

  if (category === "Honey Shop") {
    if (isOverlay2) {
      return `
        <div class="category">
          <div class="category-header" style="background-color:${data.headerColor}; color:${data.headerTextColor}">
            <span class="category-title">Honey Shop</span>
          </div>
          ${renderItems(data.items, false)}
        </div>
      `;
    } else {
      const { mm, ss } = getTimeUntilNextRestock(category);
      return `
        <div class="category timer-only">
          <div class="category-header" style="background-color:${data.headerColor}; color:${data.headerTextColor}">
            <span class="category-title">Swarm Event in ${mm === "--" ? '--:--' : `${mm}:${ss}`}</span>
          </div>
        </div>
      `;
    }
  }

  const itemsHtml = renderItems(data.items, category === "Cosmetic Shop");
  const showTimer = !isOverlay2 && category !== "Cosmetic Shop" && category !== "LAST SEEN";

  return `
    <div class="category">
      <div class="category-header" style="background-color:${data.headerColor}; color:${data.headerTextColor}">
        <span class="category-title">${data.displayName}${showTimer ? ` in ${getTimeUntilNextRestock(category).mm}:${getTimeUntilNextRestock(category).ss}` : ''}</span>
      </div>
      ${itemsHtml ? `<div class="items-list">${itemsHtml}</div>` : ''}
      ${category === "LAST SEEN" ? '<div class="watermark">Joins discord.gg/soya</div>' : ''}
    </div>
  `;
}

const overlayTemplate = () => `
<html>
  <head>
    <style>
      @font-face { font-family: 'Comic Sans MS'; src: local('Comic Sans MS'), local('ComicSansMS'); }
      * { font-family: 'Comic Sans MS', cursive, sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
      body { background-color: transparent; padding: 5px; width: 100%; height: 100%; }
      .container { display: flex; gap: 5px; width: 100%; }
      .main-panel { flex: 1; display: flex; flex-direction: column; gap: 4px; width: 100%; }
      .category { background: rgba(210, 180, 140, 0.8); border-radius: 4px; padding: 4px; box-shadow: 0 0 4px rgba(0,0,0,0.2); width: 100%; max-width: 350px; }
      .category-header { padding: 3px 6px; border-radius: 3px; margin-bottom: 4px; display: flex; justify-content: center; font-weight: bold; font-size: 13px; min-height: 22px; align-items: center; width: 100%; }
      .items-list { display: flex; flex-direction: column; gap: 3px; width: 100%; }
      .item-container { display: flex; align-items: center; background: #5C4033; padding: 2px 6px; border-radius: 3px; gap: 6px; min-height: 20px; width: 100%; }
      .item-icon { width: 18px; height: 18px; object-fit: contain; flex-shrink: 0; }
      .item-name { font-size: 12px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-grow: 1; }
      .item-quantity { color: #FFD700; font-size: 12px; font-weight: bold; flex-shrink: 0; }

      /* Special items with golden blinking background (only quantity text will be black) */
      .special-item {
        background: linear-gradient(90deg, #5C4033, #FFD700, #5C4033);
        background-size: 200% 100%;
        animation: shine 2s infinite;
      }
      @keyframes shine {
        0% { background-position: 100% 50%; }
        50% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      .special-item .item-quantity {
        color: #000000 !important;
        font-weight: bolder;
      }

      /* Last Seen specific styles */
      .category:last-child .item-container {
        justify-content: space-between;
        padding: 2px 8px;
      }
      .last-seen-name {
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-grow: 1;
        max-width: 70%;
      }
      .last-seen-time {
        font-size: 12px;
        font-weight: bold;
        color: #FFD700;
        flex-shrink: 0;
        margin-left: 10px;
      }

      /* Watermark */
      .watermark {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.7);
        text-align: center;
        margin-top: 5px;
      }

      @media (max-width: 700px) {
        body { padding: 4px; }
        .container { flex-direction: column; }
        .category { max-width: 100%; }
        .last-seen-name {
          max-width: 60%;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="main-panel">
        ${renderCategory("Honey Shop")}
        ${renderCategory("Egg Restock")}
        ${renderCategory("Seed Restock")}
        ${renderCategory("Tool Restock")}
        ${renderCategory("LAST SEEN")}
      </div>
    </div>
    <script>
      // Full page refresh every second
      const refreshOverlay = () => {
        fetch(window.location.href, { 
          headers: { 
            'Cache-Control': 'no-cache', 
            'Pragma': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest'
          } 
        })
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');

            // Update all categories
            document.querySelectorAll('.category').forEach((oldCategory, index) => {
              const newCategory = newDoc.querySelectorAll('.category')[index];
              if (newCategory && oldCategory.innerHTML !== newCategory.innerHTML) {
                oldCategory.innerHTML = newCategory.innerHTML;
              }
            });
          })
          .catch(err => console.error('Refresh error:', err));

        // Schedule next refresh in 1 second
        setTimeout(refreshOverlay, 1000);
      };

      // Start the refresh cycle
      refreshOverlay();
    </script>
  </body>
</html>
`;

const overlay2Template = (weatherHtml) => `
<html>
  <head>
    <style>
      @font-face { font-family: 'Comic Sans MS'; src: local('Comic Sans MS'), local('ComicSansMS'); }
      * { font-family: 'Comic Sans MS', cursive, sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
      body { background-color: transparent; padding: 5px; width: 100%; height: 100%; }
      .container { display: flex; flex-direction: column; gap: 5px; width: 100%; }
      .category, .weather { background: rgba(210, 180, 140, 0.8); border-radius: 4px; padding: 4px; box-shadow: 0 0 4px rgba(0,0,0,0.2); width: 100%; max-width: 350px; }
      .category-header { padding: 3px 6px; border-radius: 3px; margin-bottom: 4px; display: flex; justify-content: center; font-weight: bold; font-size: 13px; min-height: 22px; align-items: center; width: 100%; }
      .weather { background: rgba(30, 60, 150, 0.7); }
      .weather-header { background: #1E90FF; color: #000; padding: 3px 6px; border-radius: 3px; margin-bottom: 4px; display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; min-height: 22px; width: 100%; }
      .items-list { display: flex; flex-direction: column; gap: 3px; width: 100%; }
      .item-container { display: flex; align-items: center; background: #5C4033; padding: 2px 6px; border-radius: 3px; gap: 6px; min-height: 20px; width: 100%; }
      .item-icon { width: 18px; height: 18px; object-fit: contain; flex-shrink: 0; }
      .item-name { font-size: 12px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-grow: 1; }
      .item-quantity { color: #FFD700; font-size: 12px; font-weight: bold; flex-shrink: 0; }
      .weather-item { background: rgba(30, 60, 150, 0.9); padding: 2px 6px; border-radius: 3px; color: #FFF; font-size: 12px; min-height: 20px; display: flex; align-items: center; width: 100%; }

      /* Special items with golden blinking background (only quantity text will be black) */
      .special-item {
        background: linear-gradient(90deg, #5C4033, #FFD700, #5C4033);
        background-size: 200% 100%;
        animation: shine 2s infinite;
      }
      @keyframes shine {
        0% { background-position: 100% 50%; }
        50% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      .special-item .item-quantity {
        color: #000000 !important;
        font-weight: bolder;
      }

      @media (max-width: 700px) { 
        body { padding: 4px; } 
        .category, .weather { max-width: 100%; } 
      }
    </style>
  </head>
  <body>
    <div class="container">
      ${renderCategory("Cosmetic Shop", true)}
      ${renderCategory("Honey Shop", true)}
      ${weatherHtml}
    </div>
    <script>
      const refreshOverlay = () => {
        fetch(window.location.href, { 
          headers: { 
            'Cache-Control': 'no-cache', 
            'Pragma': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest'
          } 
        })
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');

            document.querySelectorAll('.category').forEach((oldCategory, index) => {
              const newCategory = newDoc.querySelectorAll('.category')[index];
              if (newCategory && oldCategory.innerHTML !== newCategory.innerHTML) {
                oldCategory.innerHTML = newCategory.innerHTML;
              }
            });

            const newWeather = newDoc.querySelector('.weather');
            const oldWeather = document.querySelector('.weather');
            if (newWeather && oldWeather && oldWeather.innerHTML !== newWeather.innerHTML) {
              oldWeather.innerHTML = newWeather.innerHTML;
            } else if (newWeather && !oldWeather) {
              document.querySelector('.container').insertAdjacentHTML('beforeend', newWeather.outerHTML);
            } else if (!newWeather && oldWeather) {
              oldWeather.remove();
            }
          })
          .catch(err => console.error('Refresh error:', err));
      };

      // Initial refresh
      refreshOverlay();

      // Refresh every 10 seconds for data updates
      setInterval(refreshOverlay, 10000);
    </script>
  </body>
</html>
`;

fastify.get("/overlay", (req, reply) => {
  reply.type("text/html").send(overlayTemplate());
});

fastify.get("/overlay2", (req, reply) => {
  reply.type("text/html").send(overlay2Template(renderWeather()));
});

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  try {
    done(null, JSON.parse(body));
  } catch (err) {
    done(err, undefined);
  }
});

fastify.post("/webhook", async (req, reply) => {
  try {
    const payload = req.body;
    if (payload?.embeds?.length) {
      payload.embeds.forEach(processEmbed);
      reply.send({ status: "ok", count: payload.embeds.length });
    } else {
      reply.status(400).send({ status: "invalid format" });
    }
  } catch (err) {
    console.error("Webhook error:", err);
    reply.status(500).send({ status: "error", message: err.message });
  }
});

const port = process.env.PORT || 3000;
fastify.listen({ port, host: '0.0.0.0' }, err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at http://localhost:${port}`);
});