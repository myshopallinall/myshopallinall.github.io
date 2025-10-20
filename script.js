// Example Product Data
const PRODUCTS = [
    { id: 1, name: "Echo Dot (4th Gen)", price: 3499, image: "https://m.media-amazon.com/images/I/6182S7MYC2L._AC_UY218_.jpg" },
    { id: 2, name: "Sony Wireless Headphones", price: 8999, image: "https://m.media-amazon.com/images/I/61vY2nTq0pL._AC_UL320_.jpg" },
    { id: 3, name: "Mi Smart Band 6", price: 2499, image: "https://m.media-amazon.com/images/I/41R3vGUNb1S._AC_UL320_.jpg" },
    { id: 4, name: "OnePlus 10R", price: 34999, image: "https://m.media-amazon.com/images/I/81RilAixwKL._AC_UL320_.jpg" }
];

let cart = [];

function renderProducts(products = PRODUCTS) {
    const grid = document.getElementById('products');
    grid.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-name">${product.name}</div>
            <div class="product-price">₹${product.price}</div>
            <button class="add-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

function addToCart(productId) {
    const item = PRODUCTS.find(p => p.id === productId);
    const cartItem = cart.find(i => i.id === productId);
    if (cartItem) {
        cartItem.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartCount();
}

function updateCartCount() {
    document.getElementById('cart-count').innerText = cart.reduce((sum, i) => sum + i.qty, 0);
}

// Search functionality
document.querySelector('.search-bar').addEventListener('input', function (e) {
    const val = e.target.value.toLowerCase();
    renderProducts(PRODUCTS.filter(p => p.name.toLowerCase().includes(val)));
});

renderProducts();
updateCartCount();
