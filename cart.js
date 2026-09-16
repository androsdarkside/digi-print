// Tarifs par page mis à jour selon tes choix (en FCFA)
const RATES = {
    'nb_verso': 15,            // Noir & Blanc Verso simple
    'nb_recto_verso': 25,      // Noir & Blanc Recto-Verso
    'couleur_verso': 50,       // Couleur Verso simple
    'couleur_recto_verso': 90  // Couleur Recto-Verso
};

let cart = JSON.parse(localStorage.getItem('digiprint_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

function saveCart() {
    localStorage.setItem('digiprint_cart', JSON.stringify(cart));
}

function openCart() {
    document.getElementById('cart-modal').style.display = 'flex';
    renderCart();
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function addToCart(name, defaultPrice, type, defaultPages = 1, customPrintMode = 'nb_recto_verso') {
    const existingIndex = cart.findIndex(item => item.name === name);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            name: name,
            type: type, // 'service', 'doc', ou 'custom_file'
            price: defaultPrice,
            qty: 1,
            pages: defaultPages,
            printMode: customPrintMode
        });
    }
    saveCart();
    updateCartCount();
    alert(`"${name}" a été ajouté à votre panier !`);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = totalItems;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateItemOption(index, field, value) {
    if (field === 'printMode') {
        cart[index].printMode = value;
    } else if (field === 'qty') {
        cart[index].qty = parseInt(value) || 1;
    } else if (field === 'pages') {
        cart[index].pages = parseInt(value) || 1;
    }
    saveCart();
    renderCart();
}

function calculateItemPrice(item) {
    if (item.type === 'service') {
        return item.price * item.qty;
    } else {
        const ratePerPage = RATES[item.printMode] || 25;
        return ratePerPage * item.pages * item.qty;
    }
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalPriceEl = document.getElementById('cart-total-price');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #6b7280;">Votre panier est vide.</p>`;
        if (totalPriceEl) totalPriceEl.innerText = '0';
        return;
    }

    let html = '';
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = calculateItemPrice(item);
        grandTotal += itemTotal;

        html += `
            <div class="cart-item">
                <div class="cart-item-header">
                    <strong>${item.name}</strong>
                    <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                </div>
        `;

        if (item.type === 'doc' || item.type === 'custom_file') {
            html += `
                <div class="cart-item-controls">
                    <label>Pages: <input type="number" value="${item.pages}" min="1" style="width:50px;" onchange="updateItemOption(${index}, 'pages', this.value)"></label>
                    <label>Format: 
                        <select onchange="updateItemOption(${index}, 'printMode', this.value)">
                            <option value="nb_verso" ${item.printMode === 'nb_verso' ? 'selected' : ''}>N&B Verso simple (15f)</option>
                            <option value="nb_recto_verso" ${item.printMode === 'nb_recto_verso' ? 'selected' : ''}>N&B Recto-Verso (25f)</option>
                            <option value="couleur_verso" ${item.printMode === 'couleur_verso' ? 'selected' : ''}>Couleur Verso simple (50f)</option>
                            <option value="couleur_recto_verso" ${item.printMode === 'couleur_recto_verso' ? 'selected' : ''}>Couleur Recto-Verso (90f)</option>
                        </select>
                    </label>
                </div>
            `;
        }

        html += `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; font-size:0.85rem;">
                    <label>Quantité: <input type="number" value="${item.qty}" min="1" style="width:40px;" onchange="updateItemOption(${index}, 'qty', this.value)"></label>
                    <span style="font-weight:bold; color:var(--primary-dark);">${itemTotal} FCFA</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    if (totalPriceEl) totalPriceEl.innerText = grandTotal;
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    let message = "Bonjour DIGI-PRINT 👋, je souhaite passer la commande suivante :\n\n";
    let grandTotal = 0;

    cart.forEach((item, idx) => {
        const itemTotal = calculateItemPrice(item);
        grandTotal += itemTotal;
        message += `${idx + 1}. *${item.name}* (Qté: ${item.qty})\n`;
        if (item.type === 'doc' || item.type === 'custom_file') {
            message += `   - Nombre de pages : ${item.pages}\n`;
            message += `   - Format d'impression : ${item.printMode}\n`;
        }
        message += `   - Sous-total : ${itemTotal} FCFA\n\n`;
    });

    message += `*TOTAL GLOBAL : ${grandTotal} FCFA*\n\n*(Je vous envoie mes fichiers personnels en pièces jointes juste en dessous)*`;

    // Remplace par ton numéro WhatsApp professionnel
    const phoneNumber = "22600000000"; 
    const encodedMessage = encodeURIComponent(message);
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}