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

    return $('.product-grid .card')
        .map((i, element) => {
            const link = 'https://shop.circlesportswear.com' + $(element)
                .find('.full-unstyled-link')
                .attr('href');
            const brand = 'Circle Sportswear';
            const price = parseInt(
                $(element)
                    .find('.price__sale .money')
                    .text()
                    .slice(1)
            );
            const name = $(element)
                .find('.card__inner .full-unstyled-link')
                .text()
                .trim()
                .replace(/\s/g, ' ');
            const photo = 'https:' + $(element)
                .find('.card__media img')
                .attr('src');
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