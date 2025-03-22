document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateTotal();
    updateCartCount();
});

let products = [];
let categories = [];
const cart = [];
let cachedProductsByCategory = null;

function loadData() {
    showLoading();
    Promise.all([
        fetch('https://online-store-backend-vw45.onrender.com/api/categories').then(res => res.json()),
        fetch('https://online-store-backend-vw45.onrender.com/api/products').then(res => res.json())
    ])
        .then(([categoryData, productData]) => {
            categories = categoryData;
            products = productData;
            renderCategoryNav();
            renderProducts();
        })
        .catch(error => console.error('Error loading data:', error))
        .finally(() => hideLoading());
}

function getProductsByCategory() {
    if (!cachedProductsByCategory) {
        cachedProductsByCategory = {};
        products.forEach(product => {
            const category = product.category || 'sem-categoria';
            if (!cachedProductsByCategory[category]) {
                cachedProductsByCategory[category] = [];
            }
            cachedProductsByCategory[category].push(product);
        });
    }
    return cachedProductsByCategory;
}

function renderProducts() {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const productsByCategory = getProductsByCategory();

    Object.keys(productsByCategory).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');
        categoryDiv.id = `category-${category}`;

        const title = document.createElement('h2');
        title.textContent = category.replace('-', ' ');
        categoryDiv.appendChild(title);

        const productGrid = document.createElement('div');
        productGrid.classList.add('product-grid');

        productsByCategory[category].forEach(product => {
            if (!product._id) return;
            const productElement = document.createElement('div');
            productElement.classList.add('product');

            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.name;
            img.loading = 'lazy';
            img.addEventListener('click', () => openProductModal(product._id));
            productElement.appendChild(img);

            const name = document.createElement('h3');
            name.textContent = product.name;
            productElement.appendChild(name);

            const price = document.createElement('p');
            price.textContent = `Preço: R$ ${product.price.toFixed(2)}`;
            productElement.appendChild(price);

            const button = document.createElement('button');
            button.textContent = 'Adicionar ao Carrinho';
            button.addEventListener('click', () => addToCart(product._id));
            productElement.appendChild(button);

            productGrid.appendChild(productElement);
        });

        categoryDiv.appendChild(productGrid);
        fragment.appendChild(categoryDiv);
    });

    productsContainer.appendChild(fragment);
}

window.addEventListener('scroll', debounce(highlightActiveCategory, 100));
