document.addEventListener('DOMContentLoaded', async () => {
    showLoading();
    try {
        const response = await fetch('https://online-store-backend-vw45.onrender.com/api/store-status');
        const data = await response.json();

        if (data.status === 'closed') {
            document.body.innerHTML = '<h1>Loja Fechada</h1> <br> <p>Fale conosco:  <a href="https://api.whatsapp.com/send?phone=5541998642005" target="_blank" class="text-white mx-2"><i class="fab fa-whatsapp fa-2x"></i></a></p>';
        } else {
            await Promise.all([loadCategories(), loadProducts()]);
            renderCategoryNav(); // Chamada após os dados serem carregados
            renderProducts();
            updateTotal();
            updateCartCount();
        }
    } catch (error) {
        console.error('Erro ao verificar o estado da loja:', error);
    } finally {
        hideLoading();
    }
});

let products = [];
let categories = [];
const cart = [];
let total = 0;
let currentPage = 1;
const productsPerPage = 20;

async function loadCategories() {
    const cachedCategories = localStorage.getItem('categories');
    const cacheTime = localStorage.getItem('categoriesTimestamp');
    const now = Date.now();

    if (cachedCategories && cacheTime && (now - cacheTime < 3600000)) { // Cache válido por 1 hora
        categories = JSON.parse(cachedCategories);
        console.log('Categorias carregadas do cache:', categories);
        return;
    }
    try {
        const response = await fetch('https://online-store-backend-vw45.onrender.com/api/categories');
        const data = await response.json();
        categories = data;
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('categoriesTimestamp', now);
        console.log('Categorias carregadas da API:', categories);
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

async function loadProducts(page = 1) {
    const cachedProducts = localStorage.getItem(`products_page_${page}`);
    const cacheTime = localStorage.getItem(`productsTimestamp_page_${page}`);
    const now = Date.now();

    if (cachedProducts && cacheTime && (now - cacheTime < 3600000)) { // Cache válido por 1 hora
        products = JSON.parse(cachedProducts);
        console.log('Produtos carregados do cache:', products);
        return;
    }
    try {
        const response = await fetch(`https://online-store-backend-vw45.onrender.com/api/products?page=${page}&limit=${productsPerPage}`);
        const data = await response.json();
        products = data;
        localStorage.setItem(`products_page_${page}`, JSON.stringify(products));
        localStorage.setItem(`productsTimestamp_page_${page}`, now);
        console.log('Produtos carregados da API:', products);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
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

    console.log('Produtos disponíveis para renderCategoryNav:', products);
    if (!products || products.length === 0) {
        console.warn('Nenhum produto disponível para criar categorias');
        categoryNav.innerHTML = '<span>Sem categorias disponíveis</span>';
        return;
    }

    products.forEach(product => {
        if (!product || !product.category) {
            console.warn('Produto inválido encontrado:', product);
            return;
        }
        const category = product.category || 'sem-categoria';
        if (!productsByCategory[category]) {
            productsByCategory[category] = [];
        }
        productsByCategory[category].push(product);
    });

    console.log('Categorias agrupadas:', productsByCategory);
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
        categoryNav.appendChild(categoryLink);
    });

    window.addEventListener('scroll', highlightActiveCategory);
}

function renderProducts() {
    const productsContainer = document.getElementById('products');
    if (!productsContainer) {
        console.error('Elemento #products não encontrado no DOM');
        return;
    }
    productsContainer.innerHTML = '';

    const productsByCategory = {};
    if (!products || products.length === 0) {
        console.warn('Nenhum produto disponível para renderizar');
        productsContainer.innerHTML = '<p>Nenhum produto disponível</p>';
        return;
    }

    products.forEach(product => {
        if (!product || !product._id) {
            console.warn('Produto inválido encontrado:', product);
            return;
        }
        const category = product.category || 'sem-categoria';
        if (!productsByCategory[category]) {
            productsByCategory[category] = [];
        }
        productsByCategory[category].push(product);
    });

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
            <p>${product.description || 'Sem descrição disponível'}</p>
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
    if (loadingElement) loadingElement.style.display = 'flex';
}

function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'none';
}

function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (product) {
        cart.push(product);
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
