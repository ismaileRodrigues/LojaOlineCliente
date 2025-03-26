document.addEventListener('DOMContentLoaded', () => {
    showLoading();
    loadCategories()
        .then(() => loadProducts())
        .then(() => {
            updateTotal();
            updateCartCount();
        })
        .finally(() => hideLoading());
});

let products = [];
let categories = [];
const cart = [];
let total = 0;
let currentPage = 1;
const productsPerPage = 20;

function loadCategories() {
    const cachedCategories = localStorage.getItem('categories');
    if (cachedCategories) {
        categories = JSON.parse(cachedCategories);
        console.log('Categorias carregadas do cache:', categories);
        renderCategoryNav();
        return Promise.resolve();
    } else {
        return fetch('https://online-store-backend-vw45.onrender.com/api/categories')
            .then(response => response.json())
            .then(data => {
                console.log('Categorias carregadas da API:', data);
                categories = data;
                localStorage.setItem('categories', JSON.stringify(categories));
                renderCategoryNav();
            })
            .catch(error => console.error('Error loading categories:', error));
    }
}

function loadProducts(page = 1) {
    const cachedProducts = localStorage.getItem(`products_page_${page}`);
    if (cachedProducts) {
        products = JSON.parse(cachedProducts);
        console.log('Produtos carregados do cache:', products);
        renderProducts();
        return Promise.resolve();
    } else {
        return fetch(`https://online-store-backend-vw45.onrender.com/api/products?page=${page}&limit=${productsPerPage}`)
            .then(response => response.json())
            .then(data => {
                console.log('Produtos carregados da API:', data);
                products = data;
                localStorage.setItem(`products_page_${page}`, JSON.stringify(products));
                renderProducts();
                renderCategoryNav();
            })
            .catch(error => console.error('Error loading products:', error));
    }
}

function renderCategoryNav() {
    const categoryNav = document.getElementById('categoryNav');
    if (!categoryNav) {
        console.error('Elemento #categoryNav não encontrado no DOM');
        return;
    }
    categoryNav.innerHTML = '';
    const productsByCategory = {};
    products.forEach(product => {
        const category = product.category || 'sem-categoria';
        if (!productsByCategory[category]) {
            productsByCategory[category] = [];
        }
        productsByCategory[category].push(product);
    });

    console.log('Produtos por categoria:', productsByCategory);

    Object.keys(productsByCategory).forEach(category => {
        const categoryLink = document.createElement('span');
        categoryLink.classList.add('category-link');
        categoryLink.setAttribute('data-category', category);
        categoryLink.textContent = category.replace('-', ' ');
        categoryLink.addEventListener('click', () => {
            const categorySection = document.getElementById(`category-${category}`);
            if (categorySection) {
                categorySection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        console.log('Adicionando categoria ao DOM:', categoryLink.outerHTML); // Log adicional
        categoryNav.appendChild(categoryLink);
    });

    console.log('Elementos adicionados ao categoryNav:', categoryNav.innerHTML); // Log adicional

    window.addEventListener('scroll', highlightActiveCategory);
}

function renderProducts() {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    const productsByCategory = {};
    products.forEach(product => {
        const category = product.category || 'sem-categoria';
        if (!productsByCategory[category]) {
            productsByCategory[category] = [];
        }
        productsByCategory[category].push(product);
    });

    console.log('Produtos por categoria:', productsByCategory);

    Object.keys(productsByCategory).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');
        categoryDiv.id = `category-${category}`;
        categoryDiv.innerHTML = `<h2>${category.replace('-', ' ')}</h2>`;
        productsContainer.appendChild(categoryDiv);

        const productGrid = document.createElement('div');
        productGrid.classList.add('product-grid');
        categoryDiv.appendChild(productGrid);

        productsByCategory[category].forEach(product => {
            if (!product._id) {
                console.error('Produto inválido, sem _id:', product);
                return;
            }
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onclick="openProductModal('${product._id}')">
                <h3>${product.name}</h3>
                <p>Preço: R$ ${product.price.toFixed(2)}</p>
                <button onclick="addToCart('${product._id}')">Adicionar ao Carrinho</button>
            `;
            productGrid.appendChild(productElement);
        });
    });

    // Add pagination controls
    const paginationControls = document.createElement('div');
    paginationControls.innerHTML = `
        <button onclick="loadProducts(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <button onclick="loadProducts(${currentPage + 1})">Next</button>
    `;
    productsContainer.appendChild(paginationControls);
}

function openProductModal(productId) {
    const product = products.find(p => p._id === productId);
    if (product) {
        const productDetails = document.getElementById('productDetails');
        productDetails.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Preço: R$ ${product.price.toFixed(2)}</p>
            <button onclick="addToCart('${product._id}'); closeProductModal()">Adicionar ao Carrinho</button>
        `;
        document.getElementById('productModal').style.display = 'block';
    } else {
        console.error('Produto não encontrado:', productId);
    }
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function highlightActiveCategory() {
    const categoryLinks = document.querySelectorAll('.category-link');
    let activeCategory = null;

    document.querySelectorAll('.category').forEach(categoryDiv => {
        const rect = categoryDiv.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            activeCategory = categoryDiv.id.replace('category-', '');
        }
    });

    categoryLinks.forEach(link => {
        if (link.getAttribute('data-category') === activeCategory) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (product) {
        cart.push(product);
        console.log('Produto adicionado ao carrinho:', product);
        renderCart();
        updateTotal();
        updateCartCount();
    } else {
        console.error('Produto não encontrado:', productId);
        alert('Erro ao adicionar o produto ao carrinho.');
    }
}

function renderCart() {
    const cartContainer = document.getElementById('cart');
    cartContainer.innerHTML = '';
    cart.forEach((item, index) => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Preço: R$ ${item.price.toFixed(2)}</p>
            <button onclick="removeFromCart(${index})">Remover</button>
        `;
        cartContainer.appendChild(cartItemElement);
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateTotal();
    updateCartCount();
}

function updateTotal() {
    total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total').innerText = `Total: R$ ${total.toFixed(2)}`;
}

function updateCartCount() {
    document.getElementById('cartCount').innerText = cart.length;
}

function makeOrder() {
    const orderSummary = cart.map(item => `${item.name} - R$ ${item.price.toFixed(2)}`).join('\n');
    const whatsappMessage = `\nResumo do Pedido:\n${orderSummary}\nTotal: R$ ${total.toFixed(2)}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5541997457028&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
}

function openCartModal() {
    document.getElementById('cartModal').style.display = 'block';
}

function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('cartModal')) {
        closeCartModal();
    }
    if (event.target == document.getElementById('productModal')) {
        closeProductModal();
    }
};

// Adicionar timestamp ao link do CSS, do script.js e à URL do index.html para evitar cache
document.addEventListener('DOMContentLoaded', () => {
    const cssLink = document.getElementById('css-link');
    const scriptLink = document.getElementById('script-link');
    const timestamp = new Date().getTime();
    cssLink.href = `style.css?t=${timestamp}`;
    scriptLink.src = `script.js?t=${timestamp}`;

    // Adicionar timestamp à URL do index.html
    if (!window.location.search.includes('t=')) {
        const newUrl = `${window.location.pathname}?t=${timestamp}`;
        window.history.replaceState(null, '', newUrl);
    }
});
