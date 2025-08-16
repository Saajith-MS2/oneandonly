(() => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Update cart count UI
  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach(el => {
      el.textContent = totalItems;
    });
  }

  // Render cart items
  function renderCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    container.innerHTML = "";
    if (cart.length === 0) {
      container.innerHTML = `<p style="text-align: center; color: #ccc; font-size: 14px;">Your cart is empty.</p>`;
      updateBillingTable();
      populateOfferOptions();
      updateOfferSection();
      updateCartCount();
      return;
    }

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      const div = document.createElement("div");
      div.className = "cart-item";

      const topDiv = document.createElement("div");
      topDiv.className = "cart-item-top";
      topDiv.innerHTML = `
        <img src="${item.img}" alt="${item.title}" class="cart-item-img"/>
        <div class="cart-details">
          <p><strong>${item.title}</strong></p>
          <p>Item Code: <strong>${item.id}</strong></p>
          <p>Size: ${item.size}</p>
          <p>Price: ₹${item.price} × ${item.quantity} = ₹${itemTotal}</p>
        </div>`;

      const bottomDiv = document.createElement("div");
      bottomDiv.className = "cart-item-bottom";
      bottomDiv.innerHTML = `
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="decreaseQuantity(${index})" aria-label="Decrease quantity">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" readonly aria-label="Quantity"/>
          <button class="quantity-btn" onclick="increaseQuantity(${index})" aria-label="Increase quantity">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${index})" aria-label="Remove item from cart">Remove</button>`;

      div.appendChild(topDiv);
      div.appendChild(bottomDiv);
      container.appendChild(div);
    });

    updateBillingTable();
    populateOfferOptions();
    updateOfferSection();
    updateCartCount();
  }

  // Increase quantity
  function increaseQuantity(index) {
    cart[index].quantity++;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    showToast("Quantity updated!", "#00e676");
  }

  // Decrease quantity
  function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
      cart[index].quantity--;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
      showToast("Quantity updated!", "#00e676");
    }
  }

  // Remove item from cart
  function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    showToast("Item removed from cart", "#ff5252");
  }

  // Update billing table with items
  function updateBillingTable() {
    const billingItems = document.getElementById("billing-items");
    if (!billingItems) return;

    billingItems.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.title}</td>
        <td><img src="${item.img}" class="poster-img" alt="${item.title}"></td>
        <td>${item.size}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price}</td>
        <td>₹${itemTotal}</td>`;
      billingItems.appendChild(row);
    });

    document.getElementById("subtotal-value").textContent = `₹${subtotal}`;
    document.getElementById("grand-total-value").textContent = `₹${subtotal}`;
  }

  // Get quantity by size
  function getQtyBySize(size) {
    return cart.filter(item => item.size === size)
               .reduce((sum, item) => sum + item.quantity, 0);
  }

  // Populate offer options
  function populateOfferOptions() {
    const offerSelect = document.getElementById("offer-select");
    if (!offerSelect) return;

    offerSelect.innerHTML = `<option value="">-- Select an offer --</option>`;
    if (getQtyBySize("A4") >= 10) {
      offerSelect.innerHTML += `
        <option value="a4_discount">10 A4 for ₹300 (₹100 OFF)</option>
        <option value="a4_free">14 A4 for ₹400 (4 FREE)</option>`;
    }
    if (getQtyBySize("A3") >= 10) {
      offerSelect.innerHTML += `
        <option value="a3_discount">10 A3 for ₹400 (₹100 OFF)</option>
        <option value="a3_free">14 A3 for ₹500 (4 FREE)</option>`;
    }
  }

  // Update offer section
  function updateOfferSection() {
    const offerSelect = document.getElementById("offer-select");
    const progress = document.getElementById("offer-progress");
    const posterCount = document.getElementById("poster-count");
    const offerMsg = document.getElementById("offer-message");
    const freeMsg = document.getElementById("free-poster-message");
    const subtotalBox = document.getElementById("subtotal-value");
    const discountBox = document.getElementById("discount-line");
    const discountValue = document.getElementById("discount-value");
    const grandTotalBox = document.getElementById("grand-total-value");

    if (!offerSelect) return;

    let a4Qty = getQtyBySize("A4");
    let a3Qty = getQtyBySize("A3");
    let totalQty = a4Qty + a3Qty;
    posterCount.textContent = totalQty;

    const percent = Math.min((Math.max(a3Qty, a4Qty) / 10) * 100, 100);
    progress.style.width = percent + "%";

    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let grandTotal = subtotal;
    let discount = 0;
    let freeNote = "";

    const selectedOffer = offerSelect.value;
    offerMsg.textContent = selectedOffer ? "" : "No offer selected.";

    if (selectedOffer === "a4_discount" && a4Qty >= 10) {
      discount = 100;
      grandTotal = subtotal - discount;
      offerMsg.textContent = "💸 ₹100 OFF on A4 posters applied.";
      freeNote = "💸 ₹100 OFF on A4 posters";
      showToast(freeNote, "#00e676");
    }
    else if (selectedOffer === "a4_free" && a4Qty >= 14) {
      const a4Items = cart.filter(item => item.size === "A4");
      let a4Count = 0, a4Extra = 0;
      a4Items.forEach(item => {
        if (a4Count + item.quantity <= 14) a4Count += item.quantity;
        else a4Extra += (a4Count + item.quantity - 14) * item.price;
      });
      const others = cart.filter(item => item.size !== "A4")
                        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      grandTotal = 400 + a4Extra + others;
      freeNote = "🎁 14 A4 posters for ₹400 (4 FREE)";
      showToast(freeNote, "#00e676");
    }
    else if (selectedOffer === "a3_discount" && a3Qty >= 10) {
      discount = 100;
      grandTotal = subtotal - discount;
      offerMsg.textContent = "💸 ₹100 OFF on A3 posters applied.";
      freeNote = "💸 ₹100 OFF on A3 posters";
      showToast(freeNote, "#00e676");
    }
    else if (selectedOffer === "a3_free" && a3Qty >= 14) {
      const a3Items = cart.filter(item => item.size === "A3");
      let a3Count = 0, a3Extra = 0;
      a3Items.forEach(item => {
        if (a3Count + item.quantity <= 14) a3Count += item.quantity;
        else a3Extra += (a3Count + item.quantity - 14) * item.price;
      });
      const others = cart.filter(item => item.size !== "A3")
                        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      grandTotal = 500 + a3Extra + others;
      freeNote = "🎁 14 A3 posters for ₹500 (4 FREE)";
      showToast(freeNote, "#00e676");
    }
    else if (selectedOffer) {
      offerMsg.textContent = "⚠️ Offer not applicable. Add more posters.";
      freeNote = "";
    }

    subtotalBox.textContent = `₹${subtotal}`;
    grandTotalBox.textContent = `₹${grandTotal}`;
    discountBox.style.display = discount > 0 ? "flex" : "none";
    discountValue.textContent = `– ₹${discount}`;
    freeMsg.textContent = freeNote;
  }

  // Toast notification
  function showToast(message, color = "#00e676") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.style.color = color.includes("#") ? color : "#00e676";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  // Checkout on WhatsApp
  function checkoutCart() {
    if (cart.length === 0) {
      showToast("Your cart is empty!", "#ff5252");
      return;
    }

    const offer = document.getElementById("offer-select").value;
    const a4Qty = getQtyBySize("A4");
    const a3Qty = getQtyBySize("A3");
    let discount = 0;
    let freeNote = "";
    let grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (offer === "a4_discount" && a4Qty >= 10) {
      discount = 100;
      freeNote = "💸 ₹100 OFF on A4 posters";
      grandTotal -= discount;
    } else if (offer === "a4_free" && a4Qty >= 14) {
      freeNote = "🎁 14 A4 posters for ₹400 (4 FREE)";
      let extra = 0, count = 0;
      cart.filter(i => i.size === "A4").forEach(i => {
        if (count + i.quantity <= 14) count += i.quantity;
        else extra += (count + i.quantity - 14) * i.price;
      });
      grandTotal = 400 + extra + cart.filter(i => i.size !== "A4")
                                     .reduce((sum, i) => sum + i.price * i.quantity, 0);
    } else if (offer === "a3_discount" && a3Qty >= 10) {
      discount = 100;
      freeNote = "💸 ₹100 OFF on A3 posters";
      grandTotal -= discount;
    } else if (offer === "a3_free" && a3Qty >= 14) {
      freeNote = "🎁 14 A3 posters for ₹500 (4 FREE)";
      let extra = 0, count = 0;
      cart.filter(i => i.size === "A3").forEach(i => {
        if (count + i.quantity <= 14) count += i.quantity;
        else extra += (count + i.quantity - 14) * i.price;
      });
      grandTotal = 500 + extra + cart.filter(i => i.size !== "A3")
                                     .reduce((sum, i) => sum + i.price * i.quantity, 0);
    }

    // Build WhatsApp message with item codes
    let itemsMessage = "Hey! I want to order these posters:\n\n";
    itemsMessage += "Sl.No | Item Code | Product Name           | Size | Qty | Rate | Total\n";
    itemsMessage += "------|-----------|------------------------|------|-----|------|------\n";

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      itemsMessage +=
        `${(index + 1).toString().padEnd(6)}| ` +
        `${item.id.padEnd(9)}| ` +
        `${item.title.padEnd(24)}| ` +
        `${item.size.padEnd(5)}| ` +
        `${item.quantity.toString().padEnd(4)}| ` +
        `₹${item.price.toString().padEnd(4)}| ` +
        `₹${itemTotal}\n`;
    });

    if (offer) {
      const offerText = document.querySelector(`#offer-select option[value="${offer}"]`).textContent;
      itemsMessage += `\n🎯 Offer: ${offerText}\n`;
    }
    if (freeNote) itemsMessage += `${freeNote}\n`;
    itemsMessage += `\n🧾 Grand Total: ₹${grandTotal}`;

    // Encode for WhatsApp
    const encodedMessage = encodeURIComponent(itemsMessage);
    window.location.href = `https://wa.me/917448467342?text=${encodedMessage}`;
  }

  // Close offer modal
  function closeOfferModal() {
    const modal = document.getElementById('offerModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  // Close modals if clicking outside
  window.onclick = function(event) {
    const modal = document.getElementById('offerModal');
    if (event.target === modal) {
      closeOfferModal();
    }
  };

  // Initialize on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    updateCartCount();
    const offerSelect = document.getElementById("offer-select");
    if (offerSelect) {
      offerSelect.addEventListener("change", updateOfferSection);
    }
    // Show offer modal with delay
    setTimeout(() => {
      const modal = document.getElementById("offerModal");
      if (modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    }, 1500);
  });

  // Expose functions for inline event handlers
  window.increaseQuantity = increaseQuantity;
  window.decreaseQuantity = decreaseQuantity;
  window.removeFromCart = removeFromCart;
  window.checkoutCart = checkoutCart;
  window.closeOfferModal = closeOfferModal;
})();
