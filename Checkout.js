let cart = [];

class Products {
  async getProductId(id) {
    try {
      let result = await fetch("items.json");
      let data = await result.json();
      let products = data.items;
      let selectedItem = products.find((item) => item.id == id);
      if (selectedItem) {
        return selectedItem.price;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

async function updateCartTotal() {
  const products = new Products();
  let total = 0;
  for (const item of cart) {
    const price = await products.getProductId(item.id);
    total += (parseFloat(price) / 100) * parseFloat(item.amount);
  }
  document.getElementsByClassName("cart-total-price")[0].innerText =
    total + "€";
}

function getCart() {
  return localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [];
}

function showCart(item) {
  var cartRow = document.createElement("div");
  cartRow.classList.add("cart-item");
  cartRow.dataset.itemId = item.id;
  var cartItems = document.getElementsByClassName("cart-items")[0];

  var cartRowContents = `
    <img  src="Images/${item.image}">
    <div>
        <h4>${item.title}</h4>
        <h5 class="cart-price cart-column">${item.price / 100}€</h5>
    </div>
    <div>
        <p class="cart-quantity-input">Quantity: ${item.amount}</p>
    </div>`;
  cartRow.innerHTML = cartRowContents;
  cartItems.append(cartRow);
}

function ready() {
  cart = getCart();
  cart.forEach((item) => showCart(item));
  updateCartTotal();
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready());
} else {
  ready();
}
