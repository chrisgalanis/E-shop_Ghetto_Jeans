const shipmentmethod = document.querySelector(".shipmentMethod");
const next_button = document.querySelector(".next-btn");
const back_button = document.querySelector(".back-btn");
const next_page = document.querySelector(".next") 

back_button.addEventListener('click', function () {
    window.location.href = 'main';
})

shipmentmethod.addEventListener('change', function(){
    console.log(shipmentmethod.value);
    if (shipmentmethod.value === "Αντικαταβολή") {
        console.log("OK");
        next_page.value = 'http://localhost:3000/Finish.html'
    } else if (shipmentmethod.value === "Card") {
        next_page.value = 'http://localhost:3000/Checkout.html'
    }
})

// next_button.addeventlistener('click', function () {
//     console.log(next_page.value);
    
// })
