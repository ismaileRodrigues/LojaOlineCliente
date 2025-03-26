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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('https://online-store-backend-vw45.onrender.com/api/store-status');
        const data = await response.json();

        if (data.status === 'closed') {
            document.body.innerHTML = '<h1>Loja Fechada</h1>';
        } else {
            showLoading();
            await loadCategories();
            await loadProducts();
            updateTotal();
            updateCartCount();
            hideLoading();
        }
    } catch (error) {
        console.error('Erro ao verificar o estado da loja:', error);
        hideLoading();
    }
});

function loadCategories() {
    const cachedCategories = localStorage.getItem('categories');
    if (cachedCategories) {
        categories = JSON.parse(cachedCategories);
        console.log('Categorias carregadas do cache:', categories);
        renderCategoryNav();
        hideLoading();
        return Promise.resolve();
    } else {
        return fetch('https://online-store-backend-vw45.onrender.com/api/categories')
            .then(response => response.json())
            .then(data => {
                console.log('Categorias carregadas da API:', data);
                categories = data;
                localStorage.setItem('categories', JSON.stringify(categories));
                renderCategoryNav();
                hideLoading();
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                hideLoading();
            });
    }
}

function loadProducts(page = 1) {
    const cachedProducts = localStorage.getItem(`products_page_${page}`);
    if (cachedProducts) {
        products = JSON.parse(cachedProducts);
        console.log('Produtos carregados do cache:', products);
        renderProducts();
        hideLoading();
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
                hideLoading();
            })
            .catch(error => {
                console.error('Error loading products:', error);
                hideLoading();
            });
    }
}
