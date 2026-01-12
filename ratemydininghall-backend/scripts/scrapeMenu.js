const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

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


function createSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     
        .replace(/[^\w\-]+/g, '') 
        .replace(/\-\-+/g, '-');  
}
async function scrapeVenue(venue) {
    try {
        console.log(`Fetching menu for ${venue.name}...`);
        const { data } = await axios.get(venue.url);
        const $ = cheerio.load(data);
        const items = [];

        $('.menu-category-section').each((_, stationEl) => {
            const $station = $(stationEl);
            const stationName = $station.find('.accordion-header h3').text().trim();
            const stationSlug = createSlug(stationName);

            $station.find('.station-list .d-none.d-lg-block').each((_, rowEl) => {
                const $row = $(rowEl);
                const $nameLink = $row.find('a.sublocsitem');
                const name = $nameLink.text().trim();
                const href = $nameLink.attr('href');
                let menuItemId = null;
                if (href) {
                    const idMatch = href.match(/id=(\d+)/);
                    if (idMatch) menuItemId = idMatch[1];
                }

                const description = $row.find('.proI span').text().trim();

                const calsText = $row.find('.cals').text().trim(); 
                const calories = parseInt(calsText) || 0;
                const tags = [];
                $row.find('img').each((_, img) => {
                    const title = $(img).attr('title');
                    if (title) tags.push(title);
                });

                const priceText = $row.find('.item-price').text().trim();
                const price = priceText ? parseFloat(priceText.replace('$', '')) : null;

                if (name) {
                    items.push({
                        id: menuItemId, 
                        diningHallSlug: stationSlug, 
                        parentHall: venue.name,     
                        name: name,
                        description: description,
                        price: price,
                        macros: {
                            calories: calories,
                            protein: 0, 
                            carbs: 0,  
                            fat: 0      
                        },
                        tags: tags,
                        imageUrl: null, 
                        updatedAt: new Date().toISOString()
                    });
                }
            });
        });

        console.log(`   Found ${items.length} items at ${venue.name}`);
        return items;

    } catch (error) {
        console.error(`   Error scraping ${venue.name}: ${error.message}`);
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