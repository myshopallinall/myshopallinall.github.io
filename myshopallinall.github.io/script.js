// Setup your Supabase project details here:
const supabaseUrl = 'https://YOUR_PROJECT_URL.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Anonymous user session for demo purposes
function getCurrentUserId() {
    let uid = localStorage.getItem('shop_uid');
    if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem('shop_uid', uid);
    }
    return uid;
}

let PRODUCTS = [];
let cart = []; // Local cart view for rendering

// Fetch products from Supabase
async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        console.error(error);
        PRODUCTS = [];
    } else {
        PRODUCTS = data;
    }
    renderProducts();
}

// Render products in grid
function renderProducts() {
    const productsSection = document.getElementById('products');
    productsSection.innerHTML = '';
    PRODUCTS.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsSection.appendChild(div);
    });
}

// Add product to cart in Supabase
async function addToCart(productId) {
    const userId = getCurrentUserId();
    // Check if product in cart already
    const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId);
    if (existing && existing.length > 0) {
        // Update qty
        await supabase
            .from('cart_items')
            .update({ qty: existing[0].qty + 1 })
            .eq('id', existing[0].id);
    } else {
        await supabase
            .from('cart_items')
            .insert([{ user_id: userId, product_id: productId, qty: 1 }]);
    }
    updateCartCount();
}

// Update cart icon count
async function updateCartCount() {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
        .from('cart_items')
        .select('qty')
        .eq('user_id', userId);
    if (error || !data) {
        document.getElementById('cart-count').textContent = '0';
    } else {
        const total = data.reduce((sum, item) => sum + item.qty, 0);
        document.getElementById('cart-count').textContent = total;
    }
}

// Fetch cart items for sidebar
async function fetchCartItems() {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
        .from('cart_items')
        .select('*,product:products(*)')
        .eq('user_id', userId);

    // Render cart items
    cart = [];
    let total = 0;
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    if (data) {
        data.forEach(item => {
            cart.push({ ...item.product, qty: item.qty });
            total += item.qty * item.product.price;
            const li = document.createElement('li');
            li.textContent = `${item.product.name} x${item.qty} – ₹${item.product.price * item.qty}`;
            cartItems.appendChild(li);
        });
    }
    document.getElementById('cart-total').textContent = `Total: ₹${total}`;
}

// Cart UI functions
function showCartSidebar() {
    fetchCartItems();
    document.getElementById('cart-sidebar').classList.remove('hidden');
}

function closeCartSidebar() {
    document.getElementById('cart-sidebar').classList.add('hidden');
}

document.getElementById('cart-icon').onclick = showCartSidebar;
document.getElementById('close-cart').onclick = closeCartSidebar;
document.getElementById('checkout-btn').onclick = function () {
    alert('Payment with Razorpay integration will go here.');
};

// Initial load
fetchProducts();
updateCartCount();
