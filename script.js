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
            hideLoading(); // Adicione esta linha aqui
        }
    } catch (error) {
        console.error('Erro ao verificar o estado da loja:', error);
        hideLoading(); // Adicione esta linha aqui para garantir que o loading seja escondido em caso de erro
    }
});

function loadCategories() {
    const cachedCategories = localStorage.getItem('categories');
    if (cachedCategories) {
        categories = JSON.parse(cachedCategories);
        console.log('Categorias carregadas do cache:', categories);
        renderCategoryNav();
        hideLoading(); // Adicione esta linha aqui
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
                hideLoading(); // Adicione esta linha aqui para garantir que o loading seja escondido em caso de erro
            });
    }
}

function loadProducts(page = 1) {
    const cachedProducts = localStorage.getItem(`products_page_${page}`);
    if (cachedProducts) {
        products = JSON.parse(cachedProducts);
        console.log('Produtos carregados do cache:', products);
        renderProducts();
        hideLoading(); // Adicione esta linha aqui
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
                hideLoading(); // Adicione esta linha aqui
            })
            .catch(error => {
                console.error('Error loading products:', error);
                hideLoading(); // Adicione esta linha aqui para garantir que o loading seja escondido em caso de erro
            });
    }
}
