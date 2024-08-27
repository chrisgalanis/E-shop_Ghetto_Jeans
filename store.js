const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const cartItemsNum = document.querySelector(".cart-items-num");
const addToCartButtons = document.getElementsByClassName("shop-item-button");
const clearCart = document.querySelector(".clear-cart");

let cart = [];
let checkoutCart = [];
let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch("items.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const title = item.name;
        const id = item.id;
        const price = item.price;
        const image = item.imgName;

        return { title, id, price, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }

  async getProductId(id) {
    try {
      let result = await fetch("items.json");
      let data = await result.json();
      let products = data.items;
      products.find((item) => {
        if (item.id == id) {
          console.log(item.price);
          return item.price;
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}
//local storag
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let product = JSON.parse(localStorage.getItem("products"));
    return product.find((product) => product.id == id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  const products = new Products();
  setupAPP();
  products
    .getProducts()
    .then((products) => {
      Storage.saveProducts(products);
    })
    .then(() => {
      var addToCartButtons =
        document.getElementsByClassName("shop-item-button");
      const buttons = [...document.querySelectorAll(".shop-item-button")];
      buttonsDOM = buttons;

      for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i];
        let id = button.id;
        let inCart = cart.find((item) => item.id == id);
        if (inCart) {
          button.innerText = " In Cart";
          button.disabled = true;
        }
        button.addEventListener("click", addToCartClicked);
        closeCartBtn.addEventListener("click", hideCart);
      }

      var removeCartItemButtons = document.getElementsByClassName("btn-danger");
      for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i];
        button.addEventListener("click", removeCartItem);
      }

      var quantityInputs = document.getElementsByClassName(
        "cart-quantity-input",
      );
      for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i];
        input.addEventListener("change", quantityChanged);
      }

      cartBtn.addEventListener("click", showCart);
      clearCart.addEventListener("click", clearWholeCart);
      document
        .getElementsByClassName("btn-purchase")[0]
        .addEventListener("click", purchaseClicked);
    });
}
// Save cart in Local
function setupAPP() {
  cart = Storage.getCart();
  populateCart(cart);
  updateCartTotal();
  cartBtn.addEventListener("click", showCart);
  closeCartBtn.addEventListener("click", hideCart);
}
function populateCart(cart) {
  cart.forEach((item) => addItemToCart(item));
}

var stripeHandler = StripeCheckout.configure({
  key: stripePublicKey,
  locale: "en",
  token: function (token) {
    var items = [];
    var cartItemContainer = document.getElementsByClassName("cart-items")[0];
    var cartRows = cartItemContainer.getElementsByClassName("cart-item");
    for (var i = 0; i < cartRows.length; i++) {
      var cartRow = cartRows[i];
      var quantityElement = cartRow.getElementsByClassName(
        "cart-quantity-input",
      )[0];
      var quantity = quantityElement.innerHTML;
      // console.log(quantity);
      var id = cartRow.dataset.itemId;
      items.push({
        id: id,
        quantity: quantity,
      });
    }

    fetch("/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        stripeTokenId: token.id,
        items: items,
      }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        alert(data.message);
        clearWholeCart();
      })
      .catch(function (error) {
        console.error(error);
      });
  },
});

function purchaseClicked() {
  const products = new Products();
  var total = 0;
  cart.forEach((item) => {
    var price_Json = products.getProductId(item.id);
    total += parseFloat(price_Json) * parseFloat(item.amount);
  });

  stripeHandler.open({
    amount: total,
  });
}

function clearWholeCart(event) {
  console.log(cart.length);
  while (cart.length > 0) {
    var cartItem = document.getElementsByClassName("cart-item")[0];
    console.log(cartItem);
    cartItem.remove();

    id = cart[0].id;
    cart = cart.filter((item) => item.id != id);
    Storage.saveCart(cart);

    let button = getSingleButton(id);
    button.disabled = false;
    button.innerHTML = '<i class="fa fa-cart-plus"></i> add to bag';

    cartItemsNum.innerText = cartItemsNum.innerText - 1;
  }
  updateCartTotal();
}
function removeCartItem(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.parentElement.remove();

  id = buttonClicked.id;
  cart = cart.filter((item) => item.id != id);
  // console.log(cart);
  Storage.saveCart(cart);

  let button = getSingleButton(id);
  button.disabled = false;
  button.innerHTML = '<i class="fa fa-cart-plus"></i> add to bag';

  cartItemsNum.innerText = cartItemsNum.innerText - 1;
  updateCartTotal();
}
function getSingleButton(id) {
  return buttonsDOM.find((button) => button.id == id);
}

function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateCartTotal();
}

function addToCartClicked(event) {
  event.target.innerText = " In Cart";
  event.target.disabled = true;

  var button = event.target;
  var shopItem = button.parentElement.parentElement;
  var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
  var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
  var imageSrc = shopItem.getElementsByClassName("shop-item-image")[0].src;
  var id = shopItem.dataset.itemId;

  //get product from products
  let cartItem = { ...Storage.getProduct(id), amount: 1 };
  // add product to the cart
  cart = [...cart, cartItem];
  // save card in local storage
  Storage.saveCart(cart);
  //set cart values
  addItemToCart(cartItem);
  updateCartTotal();
  showCart();
}

function showCart() {
  cartOverlay.classList.add("transparentBcg");
  cartDOM.classList.add("showCart");
}

function hideCart() {
  cartOverlay.classList.remove("transparentBcg");
  cartDOM.classList.remove("showCart");
}

function addItemToCart(item) {
  var cartRow = document.createElement("div");
  cartRow.classList.add("cart-item");
  cartRow.dataset.itemId = item.id;
  var cartItems = document.getElementsByClassName("cart-items")[0];
  var cartItemNames = cartItems.getElementsByClassName("cart-item-title");
  for (var i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      alert("This item is already added to the cart");
      return;
    }
  }

  //  <div class="cart-item">
  //  <img  src="${imageSrc}">
  //  <h4>${title}</h4>
  // </div>
  // <h5 class="cart-price cart-column">${price}</h5>
  // <div>
  //  <input class="cart-quantity-input item" type="number" value="1">
  //  <button class="btn btn-danger" type="button">REMOVE</button>

  var cartRowContents = `
        <img  src="Images/${item.image}">
        <div>
            <h4>${item.title}</h4>
            <h5 class="cart-price cart-column">${item.price / 100}€</h5>
            <button class="btn btn-danger" type="button" id="${
              item.id
            }">REMOVE</button>
            
        </div>
        <div>
            <i class="fa fa-lg fa-chevron-up"></i>
            <p class="cart-quantity-input">${item.amount}</p>
            <i class="fa fa-lg fa-chevron-down"></i>
        </div>`;
  cartRow.innerHTML = cartRowContents;
  cartItems.append(cartRow);
  cartRow
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeCartItem);
  cartRow
    .getElementsByClassName("fa-chevron-up")[0]
    .addEventListener("click", increaseQuantity);
  cartRow
    .getElementsByClassName("fa-chevron-down")[0]
    .addEventListener("click", decreaseQuantity);
}

function increaseQuantity(event) {
  let addAmount = event.target;
  addAmount.nextElementSibling.innerHTML =
    parseFloat(addAmount.nextElementSibling.innerHTML) + 1;
  let itemId = addAmount.parentElement.parentElement.dataset.itemId;
  cart = cart.map((item) =>
    item.id == itemId ? { ...item, amount: item.amount + 1 } : item,
  );
  Storage.saveCart(cart);
  updateCartTotal();
}

function decreaseQuantity(event) {
  let removeAmount = event.target;
  if (removeAmount.previousElementSibling.innerHTML > 1) {
    removeAmount.previousElementSibling.innerHTML =
      parseFloat(removeAmount.previousElementSibling.innerHTML) - 1;
  } else {
    event.target.parentElement.parentElement.remove();
  }
  updateCartTotal();
}

function updateCartTotal() {
  var cartItemContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemContainer.getElementsByClassName("cart-item");
  var total = 0;
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    var priceElement = cartRow.getElementsByClassName("cart-price")[0];
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input",
    )[0];
    var price = parseFloat(priceElement.innerHTML.replace("€", ""));
    var quantity = parseInt(quantityElement.innerHTML);
    cartItemsNum.innerText = i + 1;
    total = total + price * quantity;
  }
  total = Math.round(total * 100) / 100;
  document.getElementsByClassName("cart-total-price")[0].innerText =
    total + "€";
}
