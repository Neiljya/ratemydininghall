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

const VENUES = [
    {
        name: '64 Degrees',
        url: 'https://hdh-web.ucsd.edu/dining/apps/diningservices/Restaurants/Venue_V3?locId=64&subLocNum=00&locDetID=18&dayNum=0'
    },
    {
        name: 'Pines',
        url: 'https://hdh-web.ucsd.edu/dining/apps/diningservices/Restaurants/Venue_V3?locId=01&subLocNum=00&locDetID=01&dayNum=0'
    },
    {
        name: 'OceanView',
        url: 'https://hdh-web.ucsd.edu/dining/apps/diningservices/Restaurants/Venue_V3?locId=05&subLocNum=00&locDetID=05&dayNum=0'
    },
    {
        name: 'Canyon Vista',
        url: 'https://hdh-web.ucsd.edu/dining/apps/diningservices/Restaurants/Venue_V3?locId=24&subLocNum=00&locDetID=24&dayNum=0'
    },
    {
        name: 'Foodworx',
        url: 'https://hdh-web.ucsd.edu/dining/apps/diningservices/Restaurants/Venue_V3?locId=11&subLocNum=00&locDetID=11&dayNum=0'
    },
    {
        name: 'The Bistro',
        url: 'https://hdh-web.ucsd.edu/dining/apps/diningservices/Restaurants/Venue_V3?locId=27&subLocNum=00&locDetID=27&dayNum=0'
    },
    {
        name: 'Cafe Ventanas',
        url: 'https://hdh-web.ucsd.edu/dining/apps/diningservices/Restaurants/Venue_V3?locId=18&subLocNum=00&locDetID=18&dayNum=0'
    }
];

const BASE_URL = 'https://hdh-web.ucsd.edu';

function createSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

function parseMacroValue(text) {
    if (!text) return 0;
    const match = text.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
}

function determineCategory(stationName) {
    if (!stationName) return "Entree";

    const cleaned = stationName.replace(/\s+/g, ' ').trim();
    const cleanName = cleaned.replace(/Menu$/i, '').trim();

    const parts = cleanName.split(' ');

    if (parts.length > 0) {
        let lastWord = parts[parts.length - 1];

        if (lastWord.toLowerCase() === 'special') return "Entree";

        if (['grill', 'wok', 'salad', 'deli'].includes(lastWord.toLowerCase())) {
        }

        return lastWord; // Returns "Plates", "Sides", "Soups", "Bowls", etc.
    }

    return "Entree";
}

// 3. SCRAPER: Fetches Macros AND Tags from Detail Page
async function scrapeItemDetails(detailUrl) {
    try {
        const { data } = await axios.get(detailUrl);
        const $ = cheerio.load(data);

        let macros = { protein: 0, carbs: 0, fat: 0 };
        let tags = [];

        // --- PART A: SCRAPE MACROS ---
        $('td').each((_, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text.match(/^Total Fat/i)) {
                macros.fat = parseMacroValue(text);
            }
            else if (text.match(/^Tot\.? Carb\.?/i) || text.match(/^Total Carbohydrate/i)) {
                macros.carbs = parseMacroValue(text);
            }
            else if (text.match(/^Protein/i)) {
                macros.protein = parseMacroValue(text);
            }
        });

        // --- PART B: SCRAPE TAGS (ALLERGENS) ---
        $('#allergens .card-footer span').each((_, el) => {
            const rawTagText = $(el).text().trim();

            // Check mapping (Using the specific TAG_MAP above)
            if (TAG_MAP[rawTagText]) {
                tags.push(TAG_MAP[rawTagText]);
            }
        });

        return { macros, tags };

    } catch (error) {
        if (detailUrl) {
            console.warn(`    Could not fetch details from ${detailUrl}: ${error.message}`);
        }
        return {
            macros: { protein: 0, carbs: 0, fat: 0 },
            tags: []
        };
    }
}

async function processInBatches(items, batchSize, taskFn) {
    let results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(taskFn));
        results = [...results, ...batchResults];
    }
    return results;
}

async function scrapeVenue(venue) {
    try {
        console.log(`Fetching menu for ${venue.name}...`);
        const { data } = await axios.get(venue.url);
        const $ = cheerio.load(data);
        const initialItems = [];

        $('.menu-category-section').each((_, stationEl) => {
            const $station = $(stationEl);

            // clean the text for the station name
            const stationName = $station.find('.accordion-header h3').text().replace(/\s+/g, ' ').trim();
            const stationSlug = createSlug(stationName);

            // 4. DETERMINE CATEGORY (e.g. "Vibe Sides" -> "Sides")
            const category = determineCategory(stationName);

            $station.find('.station-list .d-none.d-lg-block').each((_, rowEl) => {
                const $row = $(rowEl);
                const $nameLink = $row.find('a.sublocsitem');
                const name = $nameLink.text().trim();
                const href = $nameLink.attr('href');

                let menuItemId = null;
                let detailUrl = null;

                if (href) {
                    const idMatch = href.match(/id=(\d+)/);
                    if (idMatch) menuItemId = idMatch[1];

                    if (href.startsWith('http')) {
                        detailUrl = href;
                    } else {
                        detailUrl = BASE_URL + (href.startsWith('/') ? '' : '/') + href;
                    }
                }

                const description = $row.find('.proI span').text().trim();
                const calsText = $row.find('.cals').text().trim();
                const calories = parseInt(calsText) || 0;

                const priceText = $row.find('.item-price').text().trim();
                const price = priceText ? parseFloat(priceText.replace('$', '')) : null;

                if (name) {
                    initialItems.push({
                        basicInfo: {
                            id: menuItemId,
                            diningHallSlug: stationSlug,
                            parentHall: venue.name,
                            name: name,
                            description: description,
                            price: price,
                            baseCalories: calories,
                            category: category,
                            imageUrl: null,
                            updatedAt: new Date().toISOString()
                        },
                        detailUrl: detailUrl
                    });
                }
            });
        });

        console.log(`    Found ${initialItems.length} items. Fetching macros & tags...`);

        // Second Pass: Fetch Macros AND Tags
        const enrichedItems = await processInBatches(initialItems, 10, async (itemWrapper) => {
            const { basicInfo, detailUrl } = itemWrapper;

            let details = {
                macros: { protein: 0, carbs: 0, fat: 0 },
                tags: []
            };

            if (detailUrl) {
                details = await scrapeItemDetails(detailUrl);
            }

            return {
                ...basicInfo,
                tags: details.tags,
                macros: {
                    calories: basicInfo.baseCalories,
                    protein: details.macros.protein,
                    carbs: details.macros.carbs,
                    fat: details.macros.fat
                }
            };
        });

        return enrichedItems;

    } catch (error) {
        console.error(`    Error scraping ${venue.name}: ${error.message}`);
        return [];
    }
}

async function run() {
    let allMenuItems = [];

    for (const venue of VENUES) {
        const venueItems = await scrapeVenue(venue);
        allMenuItems = [...allMenuItems, ...venueItems];
    }

    const outputPath = path.join(__dirname, 'menu_items.json');
    fs.writeFileSync(outputPath, JSON.stringify(allMenuItems, null, 2));

    console.log('\n-----------------------------------');
    console.log(`Scraping Done!`);
    console.log(`Total Items: ${allMenuItems.length}`);
    console.log(`Saved at: ${outputPath}`);
}

run();