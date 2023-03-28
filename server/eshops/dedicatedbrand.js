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

  return $('.productList-container .productList')
    .map((i, element) => {
      const name = $(element)
        .find('.productList-title')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.productList-price')
          .text()
      );

      return {name, price};
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

module.exports.fetchProducts = async url => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const body = await response.json();
      const products = body.products.filter(element => element['canonicalUri']);

      return products.map((element) => {
        const link = 'https://www.dedicatedbrand.com/en/' + element['canonicalUri'];
        const brand = 'DEDICATED';
        const price = element['price']['priceAsNumber'];
        const name = element['name'];
        const photo = element['image'][0];
        const uuid = uuidv5(link, uuidv5.URL);
        const released = new Date().toISOString().slice(0, 10);

        return {link, brand, price, name, photo, uuid, released};
      });
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};