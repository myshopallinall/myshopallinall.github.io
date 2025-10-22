<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Customer Shop</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 2rem;
    background: #fafafa;
  }
  nav {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  nav button {
    padding: 8px 16px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  nav button:hover {
    background: #c0392b;
  }
  .cart-info {
    font-weight: bold;
    font-size: 1.1rem;
  }
  #shop-products {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }
  .product-card {
    background: white;
    border-radius: 6px;
    padding: 1rem;
    box-shadow: 0 1px 5px rgba(0,0,0,0.1);
    text-align: center;
  }
  .product-card img {
    width: 140px;
    height: 140px;
    object-fit: contain;
  }
  .product-name {
    color: #0070f3;
    font-weight: 600;
    margin: 0.5rem 0 0.7rem 0;
  }
  .product-price {
    color: #e91e63;
    font-weight: bold;
    margin: 0.5rem 0;
  }
  .product-desc {
    font-size: 0.9rem;
    color: #666;
  }
  .add-btn {
    background: #0070f3;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px;
  }
  .add-btn:hover {
    background: #005bb5;
  }
  #cart-items {
    background: white;
    padding: 1rem;
    margin-top: 2rem;
    border-radius: 8px;
    max-width: 400px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  #orders-list {
    margin-top: 4rem;
  }
</style>
</head>
<body>
<nav>
  <h1>Shop</h1>
  <div class="cart-info">
    <span id="cart-count">Cart: 0</span>
    <button id="logout-btn">Logout</button>
  </div>
</nav>

<main>
  <section>
    <h2>All Products</h2>
    <div id="shop-products"></div>
  </section>

  <section>
    <h2>Your Cart</h2>
    <div id="cart-items"></div>
    <button id="checkout-btn">Checkout</button>
  </section>

  <section id="orders-list">
    <h2>Your Orders</h2>
  </section>
</main>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const supabase = supabase.createClient("https://wamqheltqmufuzrqlxlb.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbXFoZWx0cW11ZnV6cnFseGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwOTQxMzAsImV4cCI6MjA3NjY3MDEzMH0.xFtK5p22bHNzWcGXUgRUR5f-Q4SGdQperlPf4ItD2sY");
  let customerId = null;
  let cart = [];

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    if (data && data.user) {
      customerId = data.user.id;
      loadProducts();
      loadCustomerOrders();
      updateCartUI();
    } else {
      alert('Please login first!');
      window.location.href = 'login.html';
    }
  }
  
  async function loadProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      alert('Error loading products: ' + error.message);
      return;
    }
    const container = document.getElementById('shop-products');
    container.innerHTML = '';
    data.forEach(prod => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <img src="${prod.image_url || ''}" alt="${prod.name}">
        <div class="product-name">${prod.name}</div>
        <div class="product-price">₹${prod.price}</div>
        <div class="product-desc">${prod.description || ''}</div>
        <button class="add-btn" onclick="addToCart(${prod.id}, '${prod.name}', ${prod.price}, '${prod.seller_id}')">Add to Cart</button>
      `;
      container.appendChild(div);
    });
  }

  window.addToCart = function(productId, name, price, sellerId) {
    const existing = cart.find(item => item.product_id === productId);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({product_id: productId, name, price, seller_id: sellerId, quantity: 1});
    }
    updateCartUI();
  };

  function updateCartUI() {
    document.getElementById('cart-count').innerText = `Cart: ${cart.reduce((sum, item) => sum + item.quantity, 0)}`;
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    cart.forEach(item => {
      cartItems.innerHTML += `
        <div>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</div>`;
    });
  }

  document.getElementById('checkout-btn').onclick = async function() {
    if (cart.length === 0) return alert('Your cart is empty.');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { data: order, error } = await supabase.from('orders').insert([{ customer_id: customerId, total }]).select().single();
    if (error) return alert('Order error: ' + error.message);
    for (const item of cart) {
      await supabase.from('order_items').insert([{
        order_id: order.id,
        product_id: item.product_id,
        seller_id: item.seller_id,
        quantity: item.quantity,
        price: item.price * item.quantity
      }]);
    }
    alert('Order placed successfully!');
    cart = [];
    updateCartUI();
    loadCustomerOrders();
  };

  async function loadCustomerOrders() {
    const { data, error } = await supabase.from('orders').select('*').eq('customer_id', customerId);
    if (error) {
      alert('Error loading orders: ' + error.message);
      return;
    }
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '<h2>Your Orders</h2>';
    data.forEach(order => {
      ordersList.innerHTML += `
        <div>
          <b>Order #${order.id}</b> - ₹${order.total} - Status: ${order.status || 'pending'}<br>
          Date: ${new Date(order.created_at).toLocaleString()}
        </div><hr>`;
    });
  }

  document.getElementById('logout-btn').onclick = async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
  }

  getUser();
</script>
</body>
</html>
