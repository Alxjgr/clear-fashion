// JavaScript source code
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { v5: uuidv5 } = require('uuid');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
    const $ = cheerio.load(data);

    return $('.products-list .product-miniature')
        .map((i, element) => {
            const link = $(element)
                .find('.product-miniature__thumb-link')
                .attr('href');
            const brand = 'Montlimart';
            const price = parseInt(
                $(element)
                    .find('.price')
                    .text()
            );
            const name = $(element)
                .find('.product-miniature__title')
                .text()
                .trim()
                .replace(/\s/g, ' ');
            const photo = $(element)
                .find('.product-miniature__thumb img')
                .attr('data-src');
            const uuid = uuidv5(link, uuidv5.URL);
            const released = new Date().toISOString().slice(0, 10);

            return { link, brand, price, name, photo, uuid, released };
        })
        .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
    try {
        const response = await fetch(url);

        if (response.ok) {
            const body = await response.text();

            return parse(body);
        }

        console.error(response);

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
};