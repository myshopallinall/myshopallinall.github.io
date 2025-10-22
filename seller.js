<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Seller Dashboard</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0; padding: 2rem;
    background: #f9f9f9;
  }
  h1, h2 {
    color: #0070f3;
  }
  form {
    background: white;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 2rem;
    max-width: 450px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  }
  form input, form textarea {
    display: block;
    width: 100%;
    margin: 0.6rem 0;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1.5px solid #ddd;
    border-radius: 4px;
  }
  form button {
    background: #0070f3;
    border: none;
    padding: 0.7rem 1.2rem;
    color: white;
    font-size: 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }
  form button:hover {
    background: #005bb5;
  }
  #products-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
    width: 120px;
    height: 120px;
    object-fit: contain;
    margin-bottom: 0.7rem;
  }
  .product-name {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #0070f3;
  }
  .product-price {
    color: #e91e63;
    font-weight: bold;
    margin-bottom: 0.3rem;
  }
  .product-desc {
    font-size: 0.9rem;
    color: #666;
  }
  nav {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  nav button {
    padding: 8px 16px;
    background: #e74c3c;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  nav button:hover {
    background: #c0392b;
  }
</style>
</head>
<body>
  <nav>
    <h1>Seller Dashboard</h1>
    <button id="logout-btn">Logout</button>
  </nav>

  <form id="add-product-form">
    <input type="text" id="prod-name" placeholder="Product Name" required />
    <input type="number" id="prod-price" placeholder="Price (₹)" required />
    <textarea id="prod-desc" placeholder="Description"></textarea>
    <input type="file" id="prod-image-file" accept="image/*" />
    <button type="submit">Add Product</button>
  </form>

  <h2>Your Products</h2>
  <div id="products-list"></div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
 const supabase = supabase.createClient("https://wamqheltqmufuzrqlxlb.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbXFoZWx0cW11ZnV6cnFseGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwOTQxMzAsImV4cCI6MjA3NjY3MDEzMH0.xFtK5p22bHNzWcGXUgRUR5f-Q4SGdQperlPf4ItD2sY");

  let sellerId = null;

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    if (data && data.user) {
      sellerId = data.user.id;
      loadSellerProducts();
    } else {
      alert('Please log in first!');
      window.location.href = 'login.html'; // Redirect if not logged in
    }
  }

  async function uploadImage(file) {
    const fileName = `${Date.now()}_${file.name}`;
    let { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      alert('Image upload failed: ' + uploadError.message);
      return null;
    }
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
      
    return urlData.publicUrl;
  }

  document.getElementById('add-product-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('prod-name').value;
    const price = parseInt(document.getElementById('prod-price').value, 10);
    const description = document.getElementById('prod-desc').value;
    const fileInput = document.getElementById('prod-image-file');
    let image_url = '';

    if (fileInput.files.length > 0) {
      image_url = await uploadImage(fileInput.files[0]);
    }

    const { error } = await supabase.from('products').insert([{
      seller_id: sellerId,
      name,
      price,
      description,
      image_url
    }]);

    if (error) {
      alert('Failed to add product: ' + error.message);
    } else {
      alert('Product added successfully!');
      loadSellerProducts();
      e.target.reset();
    }
  };

  async function loadSellerProducts() {
    const { data, error } = await supabase.from('products').select('*').eq('seller_id', sellerId);
    if (error) {
      alert('Error loading products: ' + error.message);
      return;
    }
    const container = document.getElementById('products-list');
    container.innerHTML = '';
    data.forEach(prod => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <img src="${prod.image_url || ''}" alt="${prod.name}" />
        <div class="product-name">${prod.name}</div>
        <div class="product-price">₹${prod.price}</div>
        <div class="product-desc">${prod.description || ''}</div>
      `;
      container.appendChild(div);
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
