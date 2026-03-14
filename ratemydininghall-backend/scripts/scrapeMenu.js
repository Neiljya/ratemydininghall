const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const TAG_MAP = {
  "Vegetarian": "vegetarian",
  "Vegan": "vegan",
  "Halal": "halal",
  "Contains Peanuts": "peanut",
  "Contains Gluten": "gluten",
  "Contains Dairy": "dairy",
  "Contains Soy": "soy",
  "Contains Eggs": "egg",
  "Contains Tree Nuts": "tree_nut",
  "Contains Fish": "fish",
  "Contains Shellfish": "shellfish",
  "Contains Wheat": "wheat",
  "Contains Sesame": "sesame",
  "Contains Meat": "meat"
};

const BASE_URL = 'https://hdh-web.ucsd.edu';
const DAY_RANGE = [0, 1, 2, 3, 4, 5, 6];

/**
 * CHANGE ONLY THIS BLOCK for a new dining hall
 */
const VENUE_CONFIG = {
  venueName: 'Makai',
  diningHallSlug: 'makai',
  outputFileName: 'makai_menu_items.json',

  urlBuilder: (dayNum) =>
    `https://hdh-web.ucsd.edu/dining/apps/diningservices/Restaurants/Venue_V3?locId=37&subLoc=01&locDetID=25&dayNum=${dayNum}`,

  categoryMap: {
    'makai base': 'Base',
    'the makai base': 'Base',
    'makai bowls': 'Bowls',
    'the makai bowls': 'Bowls',
    'makai finishers': 'Finishers',
    'the makai finishers': 'Finishers',
    'makai green bowls': 'Green Bowls',
    'the makai green bowls': 'Green Bowls',
    'makai protein': 'Protein',
    'the makai protein': 'Protein',
    'makai sauces': 'Sauces',
    'the makai sauces': 'Sauces',
    'makai toppings': 'Toppings',
    'the makai toppings': 'Toppings'
  }
};

/**
 * Example swap:
 *
 * const VENUE_CONFIG = {
 *   venueName: 'Rooftop',
 *   diningHallSlug: 'rooftop',
 *   outputFileName: 'rooftop_menu_items.json',
 *   urlBuilder: (dayNum) =>
 *     `https://hdh-web.ucsd.edu/dining/apps/diningservices/Restaurants/Venue_V3?locId=37&subLoc=01&locDetID=25&dayNum=${dayNum}`,
 *   categoryMap: {
 *     'rooftop desserts': 'Desserts',
 *     'the rooftop desserts': 'Desserts',
 *     'rooftop beverages': 'Beverages',
 *     'the rooftop beverages': 'Beverages',
 *     'rooftop cold sides': 'Cold Sides',
 *     'the rooftop cold sides': 'Cold Sides',
 *     'rooftop hot sides': 'Hot Sides',
 *     'the rooftop hot sides': 'Hot Sides',
 *     'rooftop loaded': 'Loaded',
 *     'the rooftop loaded': 'Loaded',
 *     'rooftop sandwiches': 'Sandwiches',
 *     'the rooftop sandwiches': 'Sandwiches',
 *     'rooftop sauces': 'Sauces',
 *     'the rooftop sauces': 'Sauces'
 *   }
 * };
 */

function createSlug(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function normalizeItemName(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

function parseMacroValue(text) {
  if (!text) return 0;
  const match = String(text).match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
}

function normalizePrice(text) {
  const cleaned = normalizeText(text);
  if (!cleaned || /call for price/i.test(cleaned)) return null;
  const n = parseFloat(cleaned.replace('$', ''));
  return Number.isFinite(n) ? n : null;
}

function dedupeArray(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function getCategory(stationName, config) {
  const normalized = normalizeText(stationName).toLowerCase();
  return config.categoryMap?.[normalized] || normalizeText(stationName) || 'Entree';
}

/**
 * Dedupe by item name only.
 * If the same item name appears with different IDs across days,
 * it will only be kept once.
 */
function getUniqueKey(item) {
  return normalizeItemName(item.name);
}

function getItemCompletenessScore(item) {
  return (
    (item.description ? 1 : 0) +
    (item.price != null ? 1 : 0) +
    ((item.tags || []).length > 0 ? 1 : 0) +
    ((item.macros?.calories ?? 0) > 0 ? 1 : 0) +
    ((item.macros?.protein ?? 0) > 0 ? 1 : 0) +
    ((item.macros?.carbs ?? 0) > 0 ? 1 : 0) +
    ((item.macros?.fat ?? 0) > 0 ? 1 : 0)
  );
}

function extractInlineTagsFromRow($, $row) {
  const tags = [];

  $row.find('img[alt], img[title]').each((_, el) => {
    const raw =
      normalizeText($(el).attr('alt')) ||
      normalizeText($(el).attr('title'));

    const cleaned = raw
      .replace(/^Image:\s*/i, '')
      .replace(/^Legend:\s*/i, '')
      .replace(/\s+Icon$/i, '')
      .trim();

    if (TAG_MAP[cleaned]) tags.push(TAG_MAP[cleaned]);
  });

  $row.find('span').each((_, el) => {
    const txt = normalizeText($(el).text());
    if (TAG_MAP[txt]) tags.push(TAG_MAP[txt]);
  });

  return dedupeArray(tags);
}

async function scrapeItemDetails(detailUrl) {
  try {
    const { data } = await axios.get(detailUrl);
    const $ = cheerio.load(data);

    const macros = { protein: 0, carbs: 0, fat: 0 };
    const tags = [];

    $('td').each((_, el) => {
      const text = normalizeText($(el).text());

      if (/^Total Fat/i.test(text)) {
        macros.fat = parseMacroValue(text);
      } else if (/^Tot\.? Carb\.?/i.test(text) || /^Total Carbohydrate/i.test(text)) {
        macros.carbs = parseMacroValue(text);
      } else if (/^Protein/i.test(text)) {
        macros.protein = parseMacroValue(text);
      }
    });

    $('#allergens .card-footer span, #allergens span, .card-footer span').each((_, el) => {
      const rawTagText = normalizeText($(el).text());
      if (TAG_MAP[rawTagText]) {
        tags.push(TAG_MAP[rawTagText]);
      }
    });

    return {
      macros,
      tags: dedupeArray(tags),
    };
  } catch (error) {
    console.warn(`Could not fetch details from ${detailUrl}: ${error.message}`);
    return {
      macros: { protein: 0, carbs: 0, fat: 0 },
      tags: [],
    };
  }
}

async function processInBatches(items, batchSize, taskFn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(taskFn));
    results.push(...batchResults);
  }
  return results;
}

function findVenueSection($, venueName) {
  let venueSection = null;

  $('.menu-category-section').each((_, el) => {
    const heading = normalizeText($(el).find('h3').first().text());
    if (heading.toLowerCase() === venueName.toLowerCase()) {
      venueSection = el;
      return false;
    }
  });

  return venueSection;
}

function collectVenueItemsFromSection($, sectionEl, config) {
  const initialItems = [];
  const $section = $(sectionEl);

  let currentStation = '';

  $section.find('h4, a.sublocsitem').each((_, el) => {
    const $el = $(el);

    if ($el.is('h4')) {
      currentStation = normalizeText($el.text());
      return;
    }

    if ($el.is('a.sublocsitem')) {
      const name = normalizeText($el.text());
      if (!name) return;

      const rowEl = $el.closest('tr, li, .row, .media, .d-none.d-lg-block');
      const $row = rowEl.length ? rowEl : $el.parent();

      const href = $el.attr('href');
      let menuItemId = null;
      let detailUrl = null;

      if (href) {
        const idMatch = href.match(/id=(\d+)/);
        if (idMatch) menuItemId = idMatch[1];

        detailUrl = href.startsWith('http')
          ? href
          : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
      }

      const description =
        normalizeText($row.find('.proI span').first().text()) ||
        normalizeText($row.find('.description, .desc').first().text()) ||
        '';

      const calsText =
        normalizeText($row.find('.cals').first().text()) ||
        normalizeText($row.text().match(/\b\d+\s*Cals\b/i)?.[0] || '');

      const calories = parseInt(calsText, 10) || 0;

      const priceText =
        normalizeText($row.find('.item-price').first().text()) ||
        normalizeText($row.text().match(/\$\s*\d+(\.\d+)?/i)?.[0] || '') ||
        (/call for price/i.test($row.text()) ? 'Call for Price' : '');

      const price = normalizePrice(priceText);
      const station = currentStation || `${config.venueName} Menu`;
      const category = getCategory(station, config);
      const inlineTags = extractInlineTagsFromRow($, $row);

      initialItems.push({
        basicInfo: {
          id: menuItemId || createSlug(`${station}-${name}`),
          sourceMenuItemId: menuItemId,
          diningHallSlug: config.diningHallSlug,
          parentHall: config.venueName,
          station,
          name,
          description,
          price,
          baseCalories: calories,
          category,
          imageUrl: null,
          updatedAt: new Date().toISOString(),
        },
        inlineTags,
        detailUrl,
      });
    }
  });

  return initialItems;
}

async function scrapeVenueForDay(url, config) {
  console.log(`Fetching: ${url}`);
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const venueSection = findVenueSection($, config.venueName);
  if (!venueSection) {
    console.log(`  No ${config.venueName} section found on this page.`);
    return [];
  }

  const initialItems = collectVenueItemsFromSection($, venueSection, config);

  console.log(`  Found ${initialItems.length} ${config.venueName} items. Fetching details...`);

  const enrichedItems = await processInBatches(initialItems, 10, async (itemWrapper) => {
    const { basicInfo, detailUrl, inlineTags } = itemWrapper;

    let details = {
      macros: { protein: 0, carbs: 0, fat: 0 },
      tags: [],
    };

    if (detailUrl) {
      details = await scrapeItemDetails(detailUrl);
    }

    return {
      id: basicInfo.id,
      sourceMenuItemId: basicInfo.sourceMenuItemId,
      diningHallSlug: basicInfo.diningHallSlug,
      parentHall: basicInfo.parentHall,
      station: basicInfo.station,
      name: basicInfo.name,
      description: basicInfo.description,
      price: basicInfo.price,
      category: basicInfo.category,
      imageUrl: basicInfo.imageUrl,
      tags: dedupeArray([...(inlineTags || []), ...(details.tags || [])]),
      macros: {
        calories: basicInfo.baseCalories,
        protein: details.macros.protein,
        carbs: details.macros.carbs,
        fat: details.macros.fat,
      },
      updatedAt: basicInfo.updatedAt,
    };
  });

  return enrichedItems;
}

async function run(config) {
  try {
    const uniqueItems = new Map();

    for (const dayNum of DAY_RANGE) {
      console.log(`\nScraping ${config.venueName} dayNum=${dayNum}...`);
      const items = await scrapeVenueForDay(config.urlBuilder(dayNum), config);

      for (const item of items) {
        const uniqueKey = getUniqueKey(item);

        if (!uniqueItems.has(uniqueKey)) {
          uniqueItems.set(uniqueKey, item);
          continue;
        }

        const existing = uniqueItems.get(uniqueKey);
        const existingScore = getItemCompletenessScore(existing);
        const newScore = getItemCompletenessScore(item);

        if (newScore > existingScore) {
          uniqueItems.set(uniqueKey, item);
        }
      }
    }

    const finalItems = Array.from(uniqueItems.values()).sort((a, b) => {
      const catCmp = String(a.category || '').localeCompare(String(b.category || ''));
      if (catCmp !== 0) return catCmp;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

    const outputPath = path.join(__dirname, config.outputFileName);
    fs.writeFileSync(outputPath, JSON.stringify(finalItems, null, 2));

    console.log('\n-----------------------------------');
    console.log(`${config.venueName} scraping done`);
    console.log(`Unique ${config.venueName} items: ${finalItems.length}`);
    console.log(`Saved JSON to: ${outputPath}`);
  } catch (error) {
    console.error('Scrape failed:', error.message);
  }
}

run(VENUE_CONFIG);