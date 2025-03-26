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
        }
    } catch (error) {
        console.error('Erro ao verificar o estado da loja:', error);
    } finally {
        hideLoading(); // Adicionei a chamada ao finally para garantir que hideLoading seja chamado
    }
});

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
            .catch(error => console.error('Error loading categories:', error))
            .finally(() => hideLoading()); // Adicionei a chamada ao finally
    }
}

function loadProducts(page = 1) {
    const cachedProducts = localStorage.getItem(`products_page_${page}`);
    if (cachedProducts) {
        products = JSON.parse(cachedProducts);
        console.log('Produtos carregados do cache:', products);
        renderProducts();
        hideLoading(); // Adicionei a chamada aqui
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
            .catch(error => console.error('Error loading products:', error))
            .finally(() => hideLoading()); // Adicionei a chamada ao finally
    }
}
