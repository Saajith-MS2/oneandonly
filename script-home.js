(() => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function addToCart(id) {
    const productElement = document.querySelector(`.product:nth-child(${parseInt(id.replace('CO', ''))})`);
    if (!productElement) return;

    const sizeSelect = productElement.querySelector(".size-select");
    const qtySelect = productElement.querySelector(".qty-select");
    const size = sizeSelect.value;
    const quantity = parseInt(qtySelect.value);
    const price = size === "A3" ? 50 : 40;
    const img = productElement.querySelector("img").src;
    const title = productElement.querySelector("p").innerText;

    const existingItem = cart.find(item => item.id === id && item.size === size);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ id, title, size, price, img, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showToast("Added to cart!");
  }

  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach(el => {
      el.textContent = totalItems;
    });
  }

  function showToast(message, color = "#00e676") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.background = "#1e1e1e";
    toast.style.color = color;
    toast.style.padding = "15px 20px";
    toast.style.borderRadius = "8px";
    toast.style.fontWeight = "bold";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    toast.style.zIndex = "9999";
    toast.style.opacity = "0";
    toast.style.pointerEvents = "none";
    toast.style.transform = "translateY(20px)";
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
      toast.style.pointerEvents = "auto";
    }, 10);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 400);
    }, 3000);
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      const modal = document.getElementById("offerModal");
      if (modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    }, 1000);
  });

  window.closeModal = function() {
    const modal = document.getElementById("offerModal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  };

  window.onclick = function(event) {
    const modal = document.getElementById("offerModal");
    if (event.target === modal) {
      window.closeModal();
    }
  };

  window.toggleCollapsible = function(contentId) {
    const content = document.getElementById(contentId);
    const header = content.previousElementSibling;
    const icon = header.querySelector("i");

    if (content.classList.contains("show")) {
      content.classList.remove("show");
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
      header.setAttribute("aria-expanded", "false");
    } else {
      content.classList.add("show");
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
      header.setAttribute("aria-expanded", "true");
    }
  };

  // Poster Search Filter
  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    const searchInput = document.getElementById('posterSearch');
    const products = document.querySelectorAll('.product');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        products.forEach(product => {
          const name = product.getAttribute('data-name').toLowerCase();
          product.style.display = name.includes(filter) ? '' : 'none';
        });
      });
    }

    // Scroll to Top Button Logic
    const scrollBtn = document.getElementById('scrollTopBtn');
    if(scrollBtn){
      window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
          scrollBtn.classList.add('show');
        } else {
          scrollBtn.classList.remove('show');
        }
      });
      scrollBtn.addEventListener('click', () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
    }
  });

  // Expose addToCart globally for inline use
  window.addToCart = addToCart;
})();
document.addEventListener("DOMContentLoaded", () => {
  const collapsibles = document.querySelectorAll(".collapsible-header");

  collapsibles.forEach(header => {
    // Ensure headers are buttons for accessibility if not already
    if (header.tagName.toLowerCase() !== 'button') {
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
    }

    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector("i");

      // Toggle active class on header
      header.classList.toggle("active");

      // Toggle aria-expanded attribute
      const isExpanded = header.getAttribute("aria-expanded") === "true";
      header.setAttribute("aria-expanded", !isExpanded);

      // Toggle icon class for up/down chevron
      if (icon) {
        if (icon.classList.contains("fa-chevron-down")) {
          icon.classList.remove("fa-chevron-down");
          icon.classList.add("fa-chevron-up");
        } else {
          icon.classList.remove("fa-chevron-up");
          icon.classList.add("fa-chevron-down");
        }
      }

      // Animate collapse/expand using max-height
      if (content.style.maxHeight) {
        // Currently expanded -> collapse
        content.style.maxHeight = null;
        content.classList.remove("show");
        // Also hide content after transition
        setTimeout(() => {
          if (!content.style.maxHeight) content.style.display = "none";
        }, 300);
      } else {
        // Currently collapsed -> expand
        content.style.display = "block";
        const scrollHeight = content.scrollHeight;
        content.style.maxHeight = scrollHeight + "px";
        content.classList.add("show");
      }
    });

    // Optional: Keyboard support for accessibility (toggle on Enter or Space)
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        header.click();
      }
    });

    // Initialize aria-expanded and content display state properly
    if (!header.classList.contains("active")) {
      header.setAttribute("aria-expanded", "false");
      const content = header.nextElementSibling;
      content.style.display = "none";
      content.style.maxHeight = null;
    } else {
      header.setAttribute("aria-expanded", "true");
      const content = header.nextElementSibling;
      content.style.display = "block";
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});
