/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./eshops/dedicatedbrand');
const fs = require('fs');
const montlimart = require('./eshops/montlimart');
const circlesportswear = require('./eshops/circlesportswear');

const eshops = [
    'https://www.dedicatedbrand.com/en/loadfilter',
    'https://www.montlimart.com/99-vetements',
    'https://shop.circlesportswear.com/collections/all',
];

async function sandbox (eshop = '') {
    try {

        if (eshop) {
            eshops.splice(0, eshops.length, eshop);
        }

        const products = [];

        for (const eshop of eshops) {
            console.log(`🕵️‍♀️  browsing ${eshop} eshop`);

            const hostname = new URL(eshop).hostname;

            if (eshop === 'https://www.dedicatedbrand.com/en/loadfilter') {
                products.push(...await dedicatedbrand.fetchProducts(eshop));
            } else if (hostname === 'www.dedicatedbrand.com') {
                products.push(...await dedicatedbrand.scrape(eshop));
            } else if (hostname === 'www.montlimart.com') {
                products.push(...await montlimart.scrape(eshop));
            } else if (hostname === 'shop.circlesportswear.com') {
                products.push(...await circlesportswear.scrape(eshop));
            } else {
                console.log(`❌ cannot scrape ${hostname}`);
            }
        }

        if (!eshop) {
            fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
        }

        console.log(products);
        console.log('done');
        process.exit(0)
    

   

    console.log(products);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
