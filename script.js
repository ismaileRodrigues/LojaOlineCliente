document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    updateTotal();
    updateCartCount();
});

let products = [];
let categories = [];
const cart = [];
let total = 0;

function loadCategories() {
    showLoading();
    fetch('https://online-store-backend-vw45.onrender.com/api/categories')
        .then(response => response.json())
        .then(data => {
            console.log('Categorias carregadas:', data);
            categories = data;
            renderCategoryNav();
        })
        .catch(error => console.error('Erro ao carregar categorias:', error))
        .finally(() => hideLoading());
}

function renderCategoryNav() {
    const categoryNav = document.getElementById('categoryNav');
    if (!categoryNav) {
        console.error('Elemento categoryNav não encontrado no DOM');
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
    const userName = prompt("Por favor, insira o seu nome:");
    const orderSummary = cart.map(item => `${item.name} - R$ ${item.price.toFixed(2)}`).join('\n');
    const whatsappMessage = `Nome: ${userName}\nResumo do Pedido:\n${orderSummary}\nTotal: R$ ${total.toFixed(2)}`;
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


document.addEventListener('DOMContentLoaded', () => {
    const cssLink = document.getElementById('css-link');
    const scriptLink = document.getElementById('script-link');
    const timestamp = new Date().getTime();
    cssLink.href = `style.css?t=${timestamp}`;
    scriptLink.src = `script.js?t=${timestamp}`;

    // Forçar recarga completa com hash
    const currentHash = window.location.hash;
    const currentTimestamp = currentHash ? parseInt(currentHash.replace('#t=', '')) : null;
    if (!currentTimestamp || currentTimestamp !== timestamp) {
        window.location.replace(`${window.location.pathname}#t=${timestamp}`);
    }
});
