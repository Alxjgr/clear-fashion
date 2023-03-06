// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
        `https://my-api.com/products?page=${page}&limit=${limit}&brand=${brand}&sort=${sort}`;
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;

     selectPage.addEventListener('change', async (event) => {
    const products = await fetchProducts(parseInt(event.target.value), 12);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
     });
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
    render(currentProducts, currentPagination);
    renderPagination(currentPagination);
});


const reasonablePriceFilter = document.querySelector('#reasonable-price');
reasonablePriceFilter.addEventListener('click', filterReasonablePrice);

function filterReasonablePrice() {
    const filteredProducts = products.filter((product) => product.price < 50);
    renderProducts(filteredProducts);
}

const sortByPrice = document.querySelector('#reasonable-price');
sortByPrice.addEventListener('click', filterReasonablePrice);

// Step 1: Add event listener to "sort-select" element
const sortSelect = document.getElementById("sort-select");
sortSelect.addEventListener("change", sortProducts);

/*Feature 4 - Filter by reasonable price
  Add an event listener to the "sort-select" dropdown that calls
the fetchProducts function with the selected sort option:
*/
const sortSelect = document.getElementById("sort-select");

sortSelect.addEventListener("change", async () => {
    const selectedSortOption = sortSelect.value;
    const data = await fetchProducts(1, 12, "", selectedSortOption);
    renderProducts(data.products);
});

const renderProducts = (products) => {
    // render the products in the UI
};

const renderPagination = (currentPage, totalPages) => {
    // render the pagination links in the UI
};

const updateUI = (data) => {
    renderProducts(data.products);
    renderPagination(data.currentPage, data.totalPages);
};

// initialize the app with default settings
const init = async () => {
    const data = await fetchProducts();
    updateUI(data);
};

init();


