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

// all product brands
let allBrands = [];

// indicators
let nbProducts = 0;
let nbBrands = 0;
let nbNewProducts = 0;
let p50 = 0;
let p90 = 0;
let p95 = 0;
let lastReleasedDate = '1970-01-01';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let currentFilter = '';
let currentBrand = '';
let currentSort = '';

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectFilter = document.querySelector('#filter-select');
const selectBrand = document.querySelector('#brand-select');
const selectSort = document.querySelector('#sort-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbBrands = document.querySelector('#nbBrands');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');
const spanLastReleasedDate = document.querySelector('#lastReleasedDate');

/**
 * Set global values
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({ result, meta }) => {
    currentProducts = result;
    currentPagination = meta;
    currentBrand = selectBrand.value;
    currentFilter = selectFilter.value;
    currentSort = selectSort.value;
};

/**
 * Set global values
 * @param {Array} result - brands to display
 */
const setBrands = ({ result }) => {
    allBrands = result;
};

/**
 * Set global value
 * @param {Object} meta - meta info
 */
const setNbProducts = ({ meta }) => {
    nbProducts = meta.count;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @param  {String}  [brand=''] - brand to fetch
 * @param  {String}  [filter=''] - filter to apply
 * @param  {String}  [sort='price-asc'] - sort to apply
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand = '', filter = '', sort = 'price-asc') => {
    try {
        const response = await fetch(
            `https://clear-fashion-api.vercel.app?size=${nbProducts}&brand=${brand}`
        );
        const body = await response.json();

        if (body.success !== true) {
            console.error(body);
            return { currentProducts, currentPagination };
        }

        let { result } = body.data;

        if (filter === 'reasonable-price') {
            result = result.filter(product => product.price < 50);
        } else if (filter === 'recently-released') {
            result = result.filter(product => new Date(product.released) > Date.now() - (1000 * 60 * 60 * 24 * 14));
        }

        nbNewProducts = result.filter(product => new Date(product.released) > Date.now() - (1000 * 60 * 60 * 24 * 14)).length;

        if (sort === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sort === 'date-asc') {
            result.sort((a, b) => new Date(b.released) - new Date(a.released));
        } else if (sort === 'date-desc') {
            result.sort((a, b) => new Date(a.released) - new Date(b.released));
        }

        const brands = new Set();
        result.forEach(product => brands.add(product.brand));
        nbBrands = brands.size;

        if (result.length > 0) {
            const products = [...result].sort((a, b) => a.price - b.price);
            p50 = products[Math.floor(products.length * .50)].price;
            p90 = products[Math.floor(products.length * .90)].price;
            p95 = products[Math.floor(products.length * .95)].price;
            lastReleasedDate = [...result].sort((a, b) => new Date(b.released) - new Date(a.released))[0].released;
        } else {
            p50 = p90 = p95 = 0;
            lastReleasedDate = '';
        }

        const meta = {
            currentPage: page,
            pageCount: Math.ceil(result.length / size),
            pageSize: size,
            count: result.length
        }

        result = result.slice((page - 1) * size, page * size);

        return { result, meta };
    } catch (error) {
        console.error(error);
        return { currentProducts, currentPagination };
    }
};

/**
 * Fetch brands from api
 * @return {Object}
 */
const fetchBrands = async () => {
    try {
        const response = await fetch(
            `https://clear-fashion-api.vercel.app/brands`
        );
        const body = await response.json();

        if (body.success !== true) {
            console.error(body);
            return { allBrands };
        }

        return body.data;
    } catch (error) {
        console.error(error);
        return { allBrands };
    }
};

/**
 * Fetch the number of products from api
 * @return {Object}
 */
const fetchNbProducts = async () => {
    try {
        const response = await fetch(
            `https://clear-fashion-api.vercel.app/?size=0`
        );
        const body = await response.json();

        if (body.success !== true) {
            console.error(body);
            return { currentProducts, currentPagination };
        }

        return body.data;
    } catch (error) {
        console.error(error);
        return { currentProducts, currentPagination };
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
        <a target="_blank" href="${product.link}">${product.name}</a>
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
    const { currentPage, pageCount } = pagination;
    const options = Array.from(
        { 'length': pageCount },
        (value, index) => `<option value="${index + 1}">${index + 1}</option>`
    ).join('');

    selectPage.innerHTML = options;
    selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
    const { count } = pagination;

    spanNbProducts.innerHTML = `${count} / ${nbProducts}`;
    spanNbBrands.innerHTML = nbBrands;
    spanNbNewProducts.innerHTML = nbNewProducts;
    spanP50.innerHTML = p50;
    spanP90.innerHTML = p90;
    spanP95.innerHTML = p95;
    spanLastReleasedDate.innerHTML = lastReleasedDate;
};

/**
 * Render brand selector
 * @param  {Array} brands
 */
const renderBrands = brands => {
    const options = `<option value=""></option>` + brands
        .map(brand => `<option value="${brand}">${brand}</option>`)
        .join('');

    selectBrand.innerHTML = options;
    selectBrand.selectedIndex = allBrands.indexOf(currentBrand) + 1;
}

const render = (products, pagination, brands) => {
    renderProducts(products);
    renderPagination(pagination);
    renderIndicators(pagination);
    renderBrands(brands);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
    const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value), currentBrand, currentFilter, currentSort);

    setCurrentProducts(products);
    render(currentProducts, currentPagination, allBrands);
});

/**
 * Select the page to display
 */
selectPage.addEventListener('change', async (event) => {
    const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize, currentBrand, currentFilter, currentSort);

    setCurrentProducts(products);
    render(currentProducts, currentPagination, allBrands);
});

/**
 * Select the brand to display
 */
selectBrand.addEventListener('change', async (event) => {
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize, event.target.value, currentFilter, currentSort);

    setCurrentProducts(products);
    render(currentProducts, currentPagination, allBrands);
});

/**
 * Select the filter to apply
 */
selectFilter.addEventListener('change', async (event) => {
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize, currentBrand, event.target.value, currentSort);

    setCurrentProducts(products);
    render(currentProducts, currentPagination, allBrands);
});

/**
 * Select the sort to apply
 */
selectSort.addEventListener('change', async (event) => {
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize, currentBrand, currentFilter, event.target.value);

    setCurrentProducts(products);
    render(currentProducts, currentPagination, allBrands);
});

document.addEventListener('DOMContentLoaded', async () => {
    const brands = await fetchBrands();
    setBrands(brands);

    const nbProducts = await fetchNbProducts();
    setNbProducts(nbProducts);

    const products = await fetchProducts();
    setCurrentProducts(products);

    render(currentProducts, currentPagination, allBrands);
});