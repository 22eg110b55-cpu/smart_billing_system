document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let state = {
        inventory: [],
        customers: [],
        bills: [],
        expenses: [],
        creditTransactions: [],
        savedBillsFilter: '',
        currentBill: {
            items: [],
            customer: { name: '', phone: '' },
            total: 0,
            discountAmount: 0,
            paymentMethod: 'cash',
            paymentDetails: null,
        },
        settings: {
            shopName: 'My Kirana Store',
            shopAddress: '123 Main Street, City',
            shopContact: '9876543210',
            upiId: 'yourshop@upi',
            gstNumber: ''
        },
        selectedSuggestionIndex: -1
    };

    // --- DOM ELEMENT REFERENCES ---
    const a = {
        // Tabs
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        // Inventory
        itemName: document.getElementById('itemName'),
        itemPrice: document.getElementById('itemPrice'),
        itemUnit: document.getElementById('itemUnit'),
        itemStock: document.getElementById('itemStock'),
        itemMinStock: document.getElementById('itemMinStock'),
        itemExpiry: document.getElementById('itemExpiry'),
        inventoryList: document.getElementById('inventoryList'),
        // Billing
        searchItem: document.getElementById('searchItem'),
        suggestions: document.getElementById('suggestions'),
        quantity: document.getElementById('quantity'),
        manualItemName: document.getElementById('manualItemName'),
        manualItemQuantity: document.getElementById('manualItemQuantity'),
        manualItemPrice: document.getElementById('manualItemPrice'),
        billItems: document.getElementById('billItems'),
        billTotal: document.getElementById('billTotal'),
        customerName: document.getElementById('customerName'),
        customerPhone: document.getElementById('customerPhone'),
        loyaltyDisplay: document.getElementById('loyaltyDisplay'),
        paymentMethod: document.getElementById('paymentMethod'),
        upiIdGroup: document.getElementById('upiIdGroup'),
        upiId: document.getElementById('upiId'),
        splitAmountGroup: document.getElementById('splitAmountGroup'),
        splitAmount: document.getElementById('splitAmount'),
        paymentDetails: document.getElementById('paymentDetails'),
        qrCodeContainer: document.getElementById('qrCodeContainer'),
        qrCanvasContainer: document.getElementById('qrCanvasContainer'),
        displayedUpiId: document.getElementById('displayedUpiId'),
        summaryText: document.getElementById('summaryText'),
        showBillBtn: document.getElementById('showBillBtn'),
        saveBillBtn: document.getElementById('saveBillBtn'),
        // Modals
        inlineBillPreview: document.getElementById('inlineBillPreview'),
        printBillOnly: document.getElementById('printBillOnly'),
        savedBillsModal: document.getElementById('savedBillsModal'),
        savedBillsList: document.getElementById('savedBillsList'),
        savedBillsSearch: document.getElementById('savedBillsSearch'),
        // Customers
        newCustomerName: document.getElementById('newCustomerName'),
        newCustomerPhone: document.getElementById('newCustomerPhone'),
        newCustomerBirthday: document.getElementById('newCustomerBirthday'),
        creditCustomer: document.getElementById('creditCustomer'),
        creditAmount: document.getElementById('creditAmount'),
        customerList: document.getElementById('customerList'),
        creditStatusCard: document.getElementById('creditStatusCard'),
        creditHistoryList: document.getElementById('creditHistoryList'),
        // Analytics
        todayRevenue: document.getElementById('todayRevenue'),
        weekRevenue: document.getElementById('weekRevenue'),
        monthRevenue: document.getElementById('monthRevenue'),
        totalCreditDue: document.getElementById('totalCreditDue'),
        topSellingItems: document.getElementById('topSellingItems'),
        expiringItems: document.getElementById('expiringItems'),
        // Expenses
        expenseCategory: document.getElementById('expenseCategory'),
        expenseAmount: document.getElementById('expenseAmount'),
        expenseDescription: document.getElementById('expenseDescription'),
        expenseDate: document.getElementById('expenseDate'),
        expenseSummary: document.getElementById('expenseSummary'),
        expenseList: document.getElementById('expenseList'),
        // Settings
        shopName: document.getElementById('shopName'),
        shopAddress: document.getElementById('shopAddress'),
        shopContact: document.getElementById('shopContact'),
        settingUpiId: document.getElementById('settingUpiId'),
        gstNumber: document.getElementById('gstNumber'),
    };

    // --- LOCAL STORAGE FUNCTIONS ---
    const saveState = () => {
        localStorage.setItem('kiranaProState', JSON.stringify(state));
    };

    const loadState = () => {
        const savedState = localStorage.getItem('kiranaProState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            state = {
                ...state,
                ...parsed,
                currentBill: {
                    ...state.currentBill,
                    ...parsed.currentBill,
                },
            };
            state.creditTransactions = state.creditTransactions || [];
            state.savedBillsFilter = state.savedBillsFilter || '';
            state.currentBill.items = state.currentBill.items || [];
            state.currentBill.customer = state.currentBill.customer || { name: '', phone: '' };
            state.currentBill.discountAmount = state.currentBill.discountAmount || 0;
            state.currentBill.paymentMethod = state.currentBill.paymentMethod || 'cash';
            state.currentBill.paymentDetails = state.currentBill.paymentDetails || null;
            state.settings = {
                ...state.settings,
                ...(parsed.settings || {})
            };
            state.settings.gstNumber = state.settings.gstNumber || '';
        }
    };

    // --- UTILITY FUNCTIONS ---
    const formatCurrency = (amount) => {
        return `₹${Number(amount).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        let isHiding = false;
        const hideNotification = () => {
            if (isHiding) return;
            isHiding = true;
            notification.classList.add('hide');
            notification.addEventListener('animationend', () => notification.remove(), { once: true });
        };

        const timeoutId = setTimeout(hideNotification, 4500);
        notification.addEventListener('click', () => {
            clearTimeout(timeoutId);
            hideNotification();
        });
    };

    // --- TAB SWITCHING ---
    window.showTab = (tabId) => {
        a.tabContents.forEach(content => {
            content.classList.remove('active');
        });
        a.tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add('active');

        // Trigger specific renders for each tab
        if (tabId === 'inventory') renderInventory();
        if (tabId === 'customers') renderCustomerList();
        if (tabId === 'analytics') renderAnalytics();
        if (tabId === 'expenses') renderExpenses();
        if (tabId === 'settings') renderSettings();
    };

    // --- INVENTORY FUNCTIONS ---
    window.addItem = () => {
        const name = a.itemName.value.trim();
        const price = parseFloat(a.itemPrice.value);
        const stock = parseInt(a.itemStock.value);
        const unit = a.itemUnit.value;
        const minStock = parseInt(a.itemMinStock.value) || 0;
        const expiry = a.itemExpiry.value;

        if (!name || isNaN(price) || isNaN(stock)) {
            showNotification('Please fill all required fields.', 'error');
            return;
        }

        const existingItem = state.inventory.find(item => item.name.toLowerCase() === name.toLowerCase());
        if (existingItem) {
            existingItem.stock += stock;
            existingItem.price = price;
            existingItem.unit = unit;
            showNotification(`${name} stock updated successfully!`, 'success');
        } else {
            state.inventory.push({ name, price, stock, unit, minStock, expiry });
            showNotification(`${name} added to inventory!`, 'success');
        }

        saveState();
        renderInventory();
        a.itemName.value = '';
        a.itemPrice.value = '';
        a.itemStock.value = '';
        a.itemMinStock.value = '';
        a.itemExpiry.value = '';
    };

    const renderInventory = () => {
        a.inventoryList.innerHTML = '';
        if (state.inventory.length === 0) {
            a.inventoryList.innerHTML = `<p style="text-align: center; color: #666;">No items in inventory.</p>`;
            return;
        }
        state.inventory.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            const isLowStock = item.stock < item.minStock;
            const isExpiring = item.expiry && (new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24) < 30;

            itemElement.innerHTML = `
                <h4>${item.name}</h4>
                <p><strong>Price:</strong> ${formatCurrency(item.price)} per ${item.unit}</p>
                <p><strong>Stock:</strong> <span style="font-weight: bold; color: ${isLowStock ? '#d32f2f' : '#2e7d32'};">${item.stock} ${item.unit}</span></p>
                ${item.expiry ? `<p><strong>Expiry:</strong> ${formatDate(item.expiry)}</p>` : ''}
                ${isLowStock ? `<p style="color: #d32f2f; font-weight: bold;">LOW STOCK ALERT!</p>` : ''}
                ${isExpiring ? `<p style="color: #ffc107; font-weight: bold;">EXPIRING SOON!</p>` : ''}
                <div style="margin-top: 15px; display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-small" onclick="editItem(${index})">✏️ Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteItem(${index})">🗑️ Delete</button>
                </div>
            `;
            a.inventoryList.appendChild(itemElement);
        });
    };

    window.editItem = (index) => {
        const item = state.inventory[index];
        if (item) {
            a.itemName.value = item.name;
            a.itemPrice.value = item.price;
            a.itemUnit.value = item.unit;
            a.itemStock.value = item.stock;
            a.itemMinStock.value = item.minStock;
            a.itemExpiry.value = item.expiry;
            deleteItem(index, false, true); // Remove old entry silently
            showNotification('Editing item...', 'info');
            showTab('inventory');
        }
    };

    window.deleteItem = (index, showNotif = true, skipConfirm = false) => {
        const item = state.inventory[index];
        if (!item) return;
        const proceed = skipConfirm || confirm(`Are you sure you want to delete ${item.name}?`);
        if (!proceed) return;
        state.inventory.splice(index, 1);
        saveState();
        renderInventory();
        if (showNotif) {
            showNotification(`${item.name} deleted from inventory.`, 'success');
        }
    };

    // --- BILLING FUNCTIONS ---
    let selectedItem = null;
    let lastSearch = '';

    window.showSuggestions = () => {
        const query = a.searchItem.value.trim().toLowerCase();
        if (query.length < 2 || query === lastSearch) {
            a.suggestions.style.display = 'none';
            return;
        }

        lastSearch = query;
        a.suggestions.innerHTML = '';
        const filteredItems = state.inventory.filter(item =>
            item.name.toLowerCase().includes(query)
        ).sort((x, y) => {
            const xName = x.name.toLowerCase();
            const yName = y.name.toLowerCase();
            if (xName.startsWith(query) && !yName.startsWith(query)) return -1;
            if (!xName.startsWith(query) && yName.startsWith(query)) return 1;
            return xName.localeCompare(yName);
        });

        if (filteredItems.length > 0) {
            filteredItems.forEach((item, index) => {
                const suggestionElement = document.createElement('div');
                suggestionElement.className = 'autocomplete-suggestion';
                suggestionElement.setAttribute('data-index', index);
                suggestionElement.innerHTML = `
                    <div>
                        <div class="suggestion-name">${item.name}</div>
                        <div class="suggestion-price">${formatCurrency(item.price)} per ${item.unit}</div>
                    </div>
                    <div class="suggestion-stock" style="color: ${item.stock < item.minStock ? '#d32f2f' : '#28a745'};">Stock: ${item.stock}</div>
                `;
                suggestionElement.addEventListener('click', () => selectSuggestion(item));
                a.suggestions.appendChild(suggestionElement);
            });
            a.suggestions.style.display = 'block';
            state.selectedSuggestionIndex = -1;
        } else {
            a.suggestions.style.display = 'none';
        }
    };

    const selectSuggestion = (item) => {
        selectedItem = item;
        a.searchItem.value = item.name;
        a.suggestions.style.display = 'none';
        a.quantity.focus();
    };

    window.handleKeyDown = (e) => {
        const suggestions = document.querySelectorAll('.autocomplete-suggestion');
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            state.selectedSuggestionIndex = (state.selectedSuggestionIndex + 1) % suggestions.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            state.selectedSuggestionIndex = (state.selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (state.selectedSuggestionIndex > -1) {
                suggestions[state.selectedSuggestionIndex].click();
            } else {
                addToBill();
            }
        }

        suggestions.forEach((s, i) => s.classList.toggle('selected', i === state.selectedSuggestionIndex));
    };

    window.addToBill = () => {
        if (!selectedItem) {
            showNotification('Please select an item first!', 'error');
            return;
        }

        const quantity = parseFloat(a.quantity.value);
        if (isNaN(quantity) || quantity <= 0) {
            showNotification('Please enter a valid quantity.', 'error');
            return;
        }

        if (selectedItem.stock < quantity) {
            showNotification(`Not enough stock! Only ${selectedItem.stock} ${selectedItem.unit} available.`, 'error');
            return;
        }

        // Check if item already exists in the current bill
        const existingBillItem = state.currentBill.items.find(item => item.name === selectedItem.name && !item.isManual);
        if (existingBillItem) {
            existingBillItem.quantity += quantity;
            existingBillItem.totalPrice = existingBillItem.quantity * existingBillItem.price;
        } else {
            state.currentBill.items.push({
                name: selectedItem.name,
                quantity: quantity,
                unit: selectedItem.unit,
                price: selectedItem.price,
                totalPrice: quantity * selectedItem.price
            });
        }

        // Update inventory stock
        const inventoryItem = state.inventory.find(item => item.name === selectedItem.name);
        if (inventoryItem) {
            inventoryItem.stock -= quantity;
        }

        updateBill();
        showNotification(`Added ${quantity} ${selectedItem.unit} of ${selectedItem.name}.`, 'success');

        // Clear inputs for next item
        a.searchItem.value = '';
        a.quantity.value = '';
        selectedItem = null;
        a.searchItem.focus();
    };

    // Manual item entry (no inventory link)
    window.addManualItemToBill = () => {
        const name = (a.manualItemName?.value || '').trim();
        const quantity = parseFloat(a.manualItemQuantity?.value || '0');
        const price = parseFloat(a.manualItemPrice?.value || '0');

        if (!name) {
            showNotification('Please enter manual item name.', 'error');
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            showNotification('Please enter a valid manual item quantity.', 'error');
            return;
        }
        if (isNaN(price) || price < 0) {
            showNotification('Please enter a valid manual item price.', 'error');
            return;
        }

        state.currentBill.items.push({
            name,
            quantity,
            unit: 'pcs',
            price,
            totalPrice: quantity * price,
            isManual: true,
        });

        updateBill();
        showNotification(`Added manual item: ${name}.`, 'success');

        if (a.manualItemName) a.manualItemName.value = '';
        if (a.manualItemQuantity) a.manualItemQuantity.value = '';
        if (a.manualItemPrice) a.manualItemPrice.value = '';
    };

    const updateBill = () => {
        a.billItems.innerHTML = '';
        state.currentBill.total = state.currentBill.items.reduce((sum, item) => sum + item.totalPrice, 0);

        if (state.currentBill.items.length === 0) {
            a.billItems.innerHTML = `<p style="text-align: center; color: #666; padding: 40px;">No items added yet</p>`;
            if (a.showBillBtn) a.showBillBtn.disabled = true;
            if (a.saveBillBtn) a.saveBillBtn.disabled = true;
        } else {
            state.currentBill.items.forEach((item, index) => {
                const billItemElement = document.createElement('div');
                billItemElement.className = 'bill-item';
                billItemElement.innerHTML = `
                    <div class="bill-item-details">
                        <div class="bill-item-name">${item.name}</div>
                        <div class="bill-item-info">${item.quantity} ${item.unit} x ${formatCurrency(item.price)}</div>
                    </div>
                    <div class="bill-item-actions">
                        <div class="bill-item-total">${formatCurrency(item.totalPrice)}</div>
                        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="removeFromBill(${index})">Remove</button>
                    </div>
                `;
                a.billItems.appendChild(billItemElement);
            });
            if (a.showBillBtn) a.showBillBtn.disabled = false;
            if (a.saveBillBtn) a.saveBillBtn.disabled = false;
        }
        a.billTotal.textContent = `Total: ${formatCurrency(state.currentBill.total)}`;
        handlePaymentMethodChange(); // Update payment details whenever the total changes
    };

    // Show bill in the inline preview and scroll to it
    window.showBill = () => {
        generatePrintableBill();
        if (a.inlineBillPreview) {
            a.inlineBillPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    window.removeFromBill = (index) => {
        const item = state.currentBill.items[index];

        // Add stock back to inventory
        const inventoryItem = state.inventory.find(i => i.name === item.name);
        if (inventoryItem) {
            inventoryItem.stock += item.quantity;
        }

        state.currentBill.items.splice(index, 1);
        updateBill();
        saveState();
        showNotification(`${item.name} removed from bill.`, 'info');
    };

    window.clearBill = () => {
        if (confirm('Are you sure you want to clear the current bill? This will restore the stock of all items.')) {
            // Restore stock for all items
            state.currentBill.items.forEach(billItem => {
                const inventoryItem = state.inventory.find(i => i.name === billItem.name);
                if (inventoryItem) {
                    inventoryItem.stock += billItem.quantity;
                }
            });

            state.currentBill.items = [];
            state.currentBill.total = 0;
            state.currentBill.customer = { name: '', phone: '' };
            state.currentBill.paymentMethod = 'cash';
            state.currentBill.discountAmount = 0;
            state.currentBill.paymentDetails = null;
            a.customerName.value = '';
            a.customerPhone.value = '';
            a.loyaltyDisplay.textContent = 'Points: 0 | Discount: 0%';
            a.paymentMethod.value = 'cash';
            a.quantity.value = '';
            if (a.splitAmount) a.splitAmount.value = '';
            handlePaymentMethodChange();

            updateBill();
            saveState();
            renderInventory();
            showNotification('Bill cleared and stock restored.', 'info');
        }
    };

    const generatePrintableBill = () => {
        const customerInfo = state.currentBill.customer.name || state.currentBill.customer.phone ? `
            <p style="text-align: left; margin-top: 10px;">
                <strong>Customer:</strong> ${state.currentBill.customer.name || 'N/A'}<br>
                <strong>Contact:</strong> ${state.currentBill.customer.phone || 'N/A'}
            </p>` : '';
        const gstLine = state.settings.gstNumber ? `<p>GSTIN: ${state.settings.gstNumber}</p>` : '';

        let tableRows = '';
        state.currentBill.items.forEach((item, index) => {
            tableRows += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity} ${item.unit}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td style="text-align: right;">${formatCurrency(item.totalPrice)}</td>
                </tr>
            `;
        });

        const paymentBreakdownHtml = state.currentBill.paymentDetails?.breakdown?.map(entry => `<span>${entry.label}: ${formatCurrency(entry.amount)}</span>`).join('') || '';
        const paymentInfoSection = state.currentBill.paymentDetails ? `
            <div class="bill-payment-info">
                <p><strong>Payment Method:</strong> ${state.currentBill.paymentDetails.label || 'Not specified'}</p>
                ${paymentBreakdownHtml}
            </div>
        ` : '';

        const billContent = `
            <div class="shop-header">
                <div class="bill-proprietor">Proprietor: Venu Gopal</div>
                <h1>${state.settings.shopName}</h1>
                <p>${state.settings.shopAddress}</p>
                <p>Contact: ${state.settings.shopContact}</p>
                ${gstLine}
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <p>Time: ${new Date().toLocaleTimeString()}</p>
            </div>
            <table class="bill-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <div style="text-align: right; margin-top: 20px;">
                <p><strong>Subtotal:</strong> ${formatCurrency(state.currentBill.total)}</p>
                ${state.currentBill.discountAmount > 0 ? `<p><strong>Discount:</strong> -${formatCurrency(state.currentBill.discountAmount)}</p>` : ''}
                <h2 style="margin-top: 10px;">GRAND TOTAL: ${formatCurrency(state.currentBill.total - (state.currentBill.discountAmount || 0))}</h2>
            </div>
            ${paymentInfoSection}
            ${customerInfo}
            <div class="bill-footer">
                <p>Thank you for your visit!</p>
                <p>Powered by Kirana Shop Pro</p>
            </div>
        `;
        if (a.inlineBillPreview) {
            a.inlineBillPreview.innerHTML = billContent;
        }
        if (a.printBillOnly) {
            a.printBillOnly.innerHTML = billContent;
        }
    };

    window.printBill = () => {
        window.print();
    };

    window.saveBill = () => {
        if (state.currentBill.items.length === 0) {
            showNotification('Cannot save an empty bill.', 'error');
            return;
        }

        // Check and update customer loyalty
        if (state.currentBill.customer.phone) {
            const customer = state.customers.find(c => c.phone === state.currentBill.customer.phone);
            if (customer) {
                customer.loyaltyPoints += Math.floor(state.currentBill.total / 100);
                showNotification(`Customer ${customer.name} earned loyalty points!`, 'info');
            }
        }

        const newBill = JSON.parse(JSON.stringify(state.currentBill));
        newBill.date = new Date().toISOString();
        newBill.discountAmount = newBill.discountAmount || 0;
        state.bills.push(newBill);

        showNotification('Bill saved successfully!', 'success');

        saveState();
        renderAnalytics();
        renderCreditHistory();
        updateCreditStatusCard();
        if (a.savedBillsModal?.style.display === 'flex') {
            renderSavedBills();
        }
    };

    window.showSavedBills = () => {
        a.savedBillsModal.style.display = 'flex';
        if (a.savedBillsSearch) {
            a.savedBillsSearch.value = state.savedBillsFilter || '';
            a.savedBillsSearch.focus();
        }
        renderSavedBills();
    };

    window.closeSavedBillsModal = () => {
        a.savedBillsModal.style.display = 'none';
    };

    const matchesSavedBillQuery = (bill, index, query) => {
        if (!query) return true;
        const billNumber = `bill #${state.bills.length - index}`.toLowerCase();
        const customerName = (bill.customer?.name || 'Walk-in Customer').toLowerCase();
        const phone = (bill.customer?.phone || '').toLowerCase();
        const billDate = bill.date ? new Date(bill.date).toLocaleString().toLowerCase() : '';
        const totalText = formatCurrency(bill.total).toLowerCase();
        const itemsText = bill.items.map(item => `${item.name} ${item.quantity} ${item.unit}`).join(' ').toLowerCase();
        const paymentText = (bill.paymentDetails?.label || bill.paymentMethod || '').toLowerCase();
        return [billNumber, customerName, phone, billDate, totalText, itemsText, paymentText].some(field => field.includes(query));
    };

    const renderSavedBills = () => {
        const query = (state.savedBillsFilter || '').toLowerCase();
        a.savedBillsList.innerHTML = '';
        if (a.savedBillsSearch) {
            a.savedBillsSearch.value = state.savedBillsFilter || '';
        }
        if (state.bills.length === 0) {
            a.savedBillsList.innerHTML = `<p style="text-align: center; color: #666;">No saved bills found.</p>`;
            return;
        }

        const filteredBills = state.bills
            .map((bill, index) => ({ bill, index }))
            .filter(({ bill, index }) => matchesSavedBillQuery(bill, index, query));

        if (filteredBills.length === 0) {
            a.savedBillsList.innerHTML = `<p style="text-align: center; color: #666;">No saved bills match "${state.savedBillsFilter}".</p>`;
            return;
        }

        filteredBills.forEach(({ bill, index }) => {
            const billElement = document.createElement('div');
            billElement.className = 'saved-bill-item';
            const billDate = bill.date ? new Date(bill.date).toLocaleString() : 'Date not available';
            const customerName = bill.customer?.name || 'Walk-in Customer';
            const billItems = bill.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
            const paymentLabel = bill.paymentDetails?.label || `Paid via ${(bill.paymentMethod || 'N/A').toUpperCase()}`;
            const paymentBreakdown = bill.paymentDetails?.breakdown?.map(entry => `${entry.label} ${formatCurrency(entry.amount)}`).join(', ');

            billElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>Bill #${state.bills.length - index}</h4>
                        <p><strong>Customer:</strong> ${customerName}</p>
                        <p><strong>Date:</strong> ${billDate}</p>
                        <p><strong>Total:</strong> ${formatCurrency(bill.total)}</p>
                        <p><strong>Payment:</strong> ${paymentLabel}${paymentBreakdown ? ` • ${paymentBreakdown}` : ''}</p>
                        <p style="font-size: 14px; margin-top: 5px; color: #666;">
                            Items: ${billItems}
                        </p>
                    </div>
                    <div>
                        <button class="btn btn-secondary" onclick="resaveBill(${index})">📝 Re-bill</button>
                        <button class="btn btn-danger" onclick="deleteBill(${index})">🗑️ Delete</button>
                    </div>
                </div>
            `;
            a.savedBillsList.appendChild(billElement);
        });
    };

    window.filterSavedBills = () => {
        state.savedBillsFilter = (a.savedBillsSearch?.value || '').trim();
        renderSavedBills();
    };

    window.resaveBill = (index) => {
        state.currentBill = JSON.parse(JSON.stringify(state.bills[index])); // Deep copy
        showNotification('Bill loaded to billing tab.', 'info');
        showTab('billing');
        if (a.paymentMethod) {
            a.paymentMethod.value = state.currentBill.paymentMethod || 'cash';
        }
        updateBill();
    };

    window.deleteBill = (index) => {
        if (confirm('Are you sure you want to delete this saved bill?')) {
            state.bills.splice(index, 1);
            saveState();
            renderSavedBills();
            renderAnalytics();
            showNotification('Bill deleted successfully.', 'success');
        }
    };

    const buildPaymentDetails = (method, total) => {
        const safeTotal = Math.max(0, total);
        const details = {
            method,
            label: '',
            breakdown: [],
            total: safeTotal,
        };

        switch (method) {
            case 'cash':
                details.label = 'Paid by Cash';
                if (safeTotal > 0) details.breakdown.push({ label: 'Cash', amount: safeTotal, type: 'cash' });
                break;
            case 'upi':
                details.label = 'Paid by UPI';
                if (safeTotal > 0) details.breakdown.push({ label: 'UPI', amount: safeTotal, type: 'upi' });
                break;
            case 'card':
                details.label = 'Paid by Card';
                if (safeTotal > 0) details.breakdown.push({ label: 'Card', amount: safeTotal, type: 'card' });
                break;
            case 'credit':
                details.label = 'Billed on Credit';
                if (safeTotal > 0) details.breakdown.push({ label: 'Credit', amount: safeTotal, type: 'credit' });
                break;
            case 'split': {
                details.label = 'Split Payment (Cash + UPI)';
                let cashAmount = parseFloat(a.splitAmount?.value || '0') || 0;
                cashAmount = Math.min(Math.max(cashAmount, 0), safeTotal);
                const upiAmount = Math.max(safeTotal - cashAmount, 0);
                if (cashAmount > 0) details.breakdown.push({ label: 'Cash', amount: cashAmount, type: 'cash' });
                if (upiAmount > 0) details.breakdown.push({ label: 'UPI', amount: upiAmount, type: 'upi' });
                details.splitMeta = { cashAmount, upiAmount };
                break;
            }
            default:
                details.label = 'Payment Pending';
                break;
        }

        if (details.breakdown.length === 0 && safeTotal > 0) {
            details.breakdown.push({ label: 'Amount', amount: safeTotal, type: 'cash' });
        }

        return details;
    };

    window.handlePaymentMethodChange = () => {
        const method = a.paymentMethod.value;
        a.upiIdGroup.style.display = method === 'upi' ? 'block' : 'none';
        a.splitAmountGroup.style.display = method === 'split' ? 'block' : 'none';

        a.paymentDetails.style.display = 'block';
        a.qrCodeContainer.style.display = 'none';

        state.currentBill.paymentMethod = method;
        generatePaymentSummary();
    };

    const generatePaymentSummary = () => {
        const method = a.paymentMethod.value;
        const total = Math.max(0, state.currentBill.total - (state.currentBill.discountAmount || 0));
        const paymentDetails = buildPaymentDetails(method, total);
        state.currentBill.paymentDetails = paymentDetails;
        let summaryHtml = '';

        if (paymentDetails.breakdown.length > 0) {
            paymentDetails.breakdown.forEach(entry => {
                summaryHtml += `<span class="payment-method-badge payment-${entry.type}">${entry.label}: ${formatCurrency(entry.amount)}</span>`;
            });
        } else {
            summaryHtml = `<span class="payment-method-badge payment-card">Payment pending</span>`;
        }

        if (method === 'upi' && paymentDetails.total > 0) {
            a.qrCodeContainer.style.display = 'block';
            generateQrCode(paymentDetails.total);
        } else if (method === 'split') {
            const upiEntry = paymentDetails.breakdown.find(entry => entry.type === 'upi');
            if (upiEntry && upiEntry.amount > 0) {
                a.qrCodeContainer.style.display = 'block';
                generateQrCode(upiEntry.amount);
            } else {
                a.qrCodeContainer.style.display = 'none';
            }
        } else {
            a.qrCodeContainer.style.display = 'none';
        }

        a.summaryText.innerHTML = summaryHtml;
    };

    const generateQrCode = (amount) => {
        if (!state.settings.upiId) {
            a.qrCanvasContainer.textContent = 'UPI ID not set in settings.';
            return;
        }

        a.displayedUpiId.textContent = state.settings.upiId;
        const upiData = `upi://pay?pa=${state.settings.upiId}&pn=${encodeURIComponent(state.settings.shopName)}&am=${amount.toFixed(2)}&cu=INR`;

        // Clear old QR
        a.qrCanvasContainer.innerHTML = '';

        // Use qrcodejs
        new QRCode(a.qrCanvasContainer, {
            text: upiData,
            width: 200,
            height: 200,
            correctLevel: QRCode.CorrectLevel.H
        });
    };

    window.calculateSplitPayment = () => {
        generatePaymentSummary();
    };

    window.checkCustomerLoyalty = () => {
        const phone = a.customerPhone.value.trim();
        const customer = state.customers.find(c => c.phone === phone);

        if (customer) {
            let discountPercentage = 0;
            if (customer.loyaltyPoints >= 500) discountPercentage = 10;
            else if (customer.loyaltyPoints >= 200) discountPercentage = 5;
            else if (customer.loyaltyPoints >= 100) discountPercentage = 2;

            state.currentBill.customer.name = customer.name;
            state.currentBill.customer.phone = customer.phone;
            state.currentBill.discountAmount = state.currentBill.total * (discountPercentage / 100);

            a.loyaltyDisplay.innerHTML = `
                Points: ${customer.loyaltyPoints} | 
                <span style="color: ${discountPercentage > 0 ? '#4caf50' : '#d32f2f'};">Discount: ${discountPercentage}%</span>
            `;
            updateBill();
        } else {
            state.currentBill.customer.name = a.customerName.value.trim();
            state.currentBill.customer.phone = phone;
            state.currentBill.discountAmount = 0;
            a.loyaltyDisplay.textContent = 'Points: 0 | Discount: 0%';
            updateBill();
        }
    };

    // --- CUSTOMER FUNCTIONS ---
    window.addCustomer = () => {
        const name = a.newCustomerName.value.trim();
        const phone = a.newCustomerPhone.value.trim();
        const birthday = a.newCustomerBirthday.value;

        if (!name || !phone) {
            showNotification('Name and Phone are required.', 'error');
            return;
        }

        if (state.customers.some(c => c.phone === phone)) {
            showNotification('Customer with this phone number already exists.', 'error');
            return;
        }

        state.customers.push({ name, phone, birthday, credit: 0, loyaltyPoints: 0 });
        saveState();
        renderCustomerList();
        showNotification(`${name} added as a new customer!`, 'success');
        a.newCustomerName.value = '';
        a.newCustomerPhone.value = '';
        a.newCustomerBirthday.value = '';
    };

    const renderCustomerList = () => {
        a.customerList.innerHTML = '';
        const creditCustomerSelect = a.creditCustomer;
        const previousSelection = creditCustomerSelect.value;
        creditCustomerSelect.innerHTML = '<option value="">Select customer...</option>';

        if (state.customers.length === 0) {
            a.customerList.innerHTML = `<p style="text-align: center; color: #666;">No customers added yet</p>`;
            updateCreditStatusCard();
            return;
        }

        state.customers.forEach((customer, index) => {
            const customerElement = document.createElement('div');
            customerElement.className = 'customer-item';
            customerElement.style.marginBottom = '10px';
            customerElement.style.padding = '10px';
            customerElement.style.borderBottom = '1px solid #ddd';

            const creditDue = customer.credit > 0;

            customerElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>${customer.name}</h4>
                        <p>Phone: ${customer.phone}</p>
                        <p>Loyalty Points: ${customer.loyaltyPoints}</p>
                        ${customer.birthday ? `<p>Birthday: ${formatDate(customer.birthday)}</p>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <h3 style="color: ${creditDue ? '#d32f2f' : '#2e7d32'};">Credit: ${formatCurrency(customer.credit)}</h3>
                        <small style="color: ${creditDue ? '#d32f2f' : '#2e7d32'};">
                            ${creditDue ? 'Pending due' : 'No dues'}
                        </small>
                        <button
                            class="btn btn-danger"
                            style="padding: 4px 8px; font-size: 12px; margin-top: 5px;"
                            ${creditDue ? 'disabled title="Clear outstanding credit before deleting"' : ''}
                            onclick="deleteCustomer(${index})"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
            a.customerList.appendChild(customerElement);

            // Populate credit management dropdown
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${customer.name} (${customer.phone})`;
            creditCustomerSelect.appendChild(option);
        });

        if (previousSelection !== '' && state.customers[parseInt(previousSelection, 10)]) {
            creditCustomerSelect.value = previousSelection;
        } else {
            creditCustomerSelect.value = '';
        }
        updateCreditStatusCard();
    };

    const updateCreditStatusCard = () => {
        if (!a.creditStatusCard) return;
        const selectedIndex = a.creditCustomer.value;
        if (selectedIndex === '' || !state.customers[selectedIndex]) {
            a.creditStatusCard.innerHTML = 'Select a customer to view their credit insights.';
            a.creditStatusCard.classList.remove('has-overdue');
            return;
        }
        const customer = state.customers[selectedIndex];
        const due = customer.credit;
        const statusHtml = `
            <div>
                <h4>${customer.name}</h4>
                <p>Phone: ${customer.phone}</p>
            </div>
            <div class="credit-status-amount">
                <span>${formatCurrency(due)}</span>
                <small>${due > 0 ? 'Outstanding' : 'Clear'}</small>
            </div>
        `;
        a.creditStatusCard.innerHTML = statusHtml;
        a.creditStatusCard.classList.toggle('has-overdue', due > 0);
    };

    const logCreditTransaction = (type, customer, amount) => {
        const safeAmount = Number(amount) || 0;
        state.creditTransactions.unshift({
            id: `${customer.phone}-${Date.now()}`,
            type,
            customerName: customer.name,
            customerPhone: customer.phone,
            amount: safeAmount,
            balance: customer.credit,
            timestamp: new Date().toISOString()
        });
        state.creditTransactions = state.creditTransactions.slice(0, 25);
    };

    const renderCreditHistory = () => {
        if (!a.creditHistoryList) return;
        a.creditHistoryList.innerHTML = '';
        if (state.creditTransactions.length === 0) {
            a.creditHistoryList.innerHTML = `<p style="text-align: center; color: #666;">No credit activity yet.</p>`;
            return;
        }
        state.creditTransactions.slice(0, 10).forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = `credit-history-entry ${entry.type === 'add' ? 'credit-added' : 'credit-paid'}`;
            const date = new Date(entry.timestamp).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            entryElement.innerHTML = `
                <div>
                    <strong>${entry.customerName}</strong>
                    <p style="font-size: 12px; color: #666;">${date}</p>
                    <p style="font-size: 12px; color: #888;">${entry.customerPhone}</p>
                </div>
                <div class="credit-history-amount">
                    <span>${entry.type === 'add' ? '+' : '-'}${formatCurrency(entry.amount)}</span>
                    <small>Balance: ${formatCurrency(entry.balance)}</small>
                </div>
            `;
            a.creditHistoryList.appendChild(entryElement);
        });
    };

    window.clearCreditHistory = () => {
        if (state.creditTransactions.length === 0) {
            showNotification('No credit history to clear.', 'info');
            return;
        }
        if (confirm('Clear all saved credit history records?')) {
            state.creditTransactions = [];
            saveState();
            renderCreditHistory();
            showNotification('Credit history cleared.', 'info');
        }
    };

    if (a.creditCustomer) {
        a.creditCustomer.addEventListener('change', updateCreditStatusCard);
    }

    window.deleteCustomer = (index) => {
        const customer = state.customers[index];
        if (customer.credit > 0) {
            showNotification(`Settle ${formatCurrency(customer.credit)} before deleting ${customer.name}.`, 'error');
            return;
        }
        if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
            state.customers.splice(index, 1);
            state.creditTransactions = state.creditTransactions.filter(entry => entry.customerPhone !== customer.phone);
            saveState();
            renderCustomerList();
            renderCreditHistory();
            updateCreditStatusCard();
            showNotification('Customer deleted successfully.', 'success');
        }
    };

    window.addCredit = () => {
        const customerIndex = a.creditCustomer.value;
        const amount = parseFloat(a.creditAmount.value);

        if (customerIndex === "" || isNaN(amount) || amount <= 0) {
            showNotification('Please select a customer and enter a valid amount.', 'error');
            return;
        }

        const customer = state.customers[customerIndex];
        customer.credit += amount;
        logCreditTransaction('add', customer, amount);
        saveState();
        renderCustomerList();
        renderAnalytics();
        renderCreditHistory();
        updateCreditStatusCard();
        showNotification(`${formatCurrency(amount)} added to credit for ${state.customers[customerIndex].name}.`, 'success');
        a.creditAmount.value = '';
    };

    window.collectPayment = () => {
        const customerIndex = a.creditCustomer.value;
        const amount = parseFloat(a.creditAmount.value);

        if (customerIndex === "" || isNaN(amount) || amount <= 0) {
            showNotification('Please select a customer and enter a valid amount.', 'error');
            return;
        }

        const customer = state.customers[customerIndex];
        const priorCredit = customer.credit;
        if (priorCredit <= 0) {
            showNotification(`${customer.name} has no outstanding credit.`, 'info');
            return;
        }
        const appliedAmount = Math.min(amount, priorCredit);
        customer.credit = Math.max(0, priorCredit - amount);
        logCreditTransaction('payment', customer, appliedAmount);
        saveState();
        renderCustomerList();
        renderAnalytics();
        renderCreditHistory();
        updateCreditStatusCard();
        showNotification(`Payment of ${formatCurrency(appliedAmount)} collected from ${customer.name}.`, 'success');
        a.creditAmount.value = '';
    };

    // --- ANALYTICS FUNCTIONS ---
    const getAnalyticsSummary = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const startOfWeekDate = new Date(now);
        startOfWeekDate.setDate(startOfWeekDate.getDate() - startOfWeekDate.getDay());
        const startOfWeek = startOfWeekDate.toISOString().split('T')[0];
        const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonth = startOfMonthDate.toISOString().split('T')[0];

        let todayRevenue = 0;
        let weekRevenue = 0;
        let monthRevenue = 0;
        let totalCreditDue = 0;
        const salesData = {};

        state.bills.forEach(bill => {
            const billDate = bill.date?.split('T')[0] || '';
            const billTotal = bill.total || 0;
            if (billDate === today) todayRevenue += billTotal;
            if (billDate >= startOfWeek) weekRevenue += billTotal;
            if (billDate >= startOfMonth) monthRevenue += billTotal;
            bill.items.forEach(item => {
                salesData[item.name] = (salesData[item.name] || 0) + item.quantity;
            });
        });

        state.customers.forEach(customer => {
            totalCreditDue += customer.credit;
        });

        const sortedSales = Object.entries(salesData)
            .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));

        const expiringItems = state.inventory
            .filter(item => item.expiry)
            .map(item => {
                const days = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
                return { name: item.name, stock: item.stock, unit: item.unit, days };
            })
            .filter(item => item.days > 0 && item.days < 30);

        return {
            todayRevenue,
            weekRevenue,
            monthRevenue,
            totalCreditDue,
            sortedSales,
            expiringItems
        };
    };

    const renderAnalytics = () => {
        const summary = getAnalyticsSummary();

        a.todayRevenue.textContent = formatCurrency(summary.todayRevenue);
        a.weekRevenue.textContent = formatCurrency(summary.weekRevenue);
        a.monthRevenue.textContent = formatCurrency(summary.monthRevenue);
        a.totalCreditDue.textContent = formatCurrency(summary.totalCreditDue);

        a.topSellingItems.innerHTML = '';
        if (summary.sortedSales.length === 0) {
            a.topSellingItems.innerHTML = `<p style="text-align: center; color: #666;">No sales data available</p>`;
        } else {
            const list = document.createElement('ul');
            list.style.listStyle = 'none';
            list.style.padding = '0';
            summary.sortedSales.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.name}: ${item.quantity} units`;
                li.style.padding = '8px 0';
                li.style.borderBottom = '1px dashed #ddd';
                list.appendChild(li);
            });
            a.topSellingItems.appendChild(list);
        }

        a.expiringItems.innerHTML = '';
        if (summary.expiringItems.length === 0) {
            a.expiringItems.innerHTML = `<p style="text-align: center; color: #666;">No expiring items</p>`;
        } else {
            const list = document.createElement('ul');
            list.style.listStyle = 'none';
            list.style.padding = '0';
            summary.expiringItems.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.name} (${item.stock} ${item.unit}) - Expires in ${item.days} days`;
                li.style.padding = '8px 0';
                li.style.borderBottom = '1px dashed #ddd';
                list.appendChild(li);
            });
            a.expiringItems.appendChild(list);
        }
    };

    window.printAnalyticsReport = () => {
        const summary = getAnalyticsSummary();
        const reportWindow = window.open('', '_blank', 'width=900,height=700');
        if (!reportWindow) {
            showNotification('Please enable pop-ups to export the analytics report.', 'error');
            return;
        }

        const now = new Date();
        const reportStyles = `
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
                h1, h2, h3 { color: #2c3e50; margin-bottom: 10px; }
                .section { margin-bottom: 25px; }
                .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
                .card { border: 1px solid #ddd; border-radius: 10px; padding: 15px; background: #fafafa; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f0f0f0; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        `;

        const topSellingRows = summary.sortedSales.length
            ? summary.sortedSales.map(item => `<tr><td>${item.name}</td><td>${item.quantity} units</td></tr>`).join('')
            : `<tr><td colspan="2">No sales data available</td></tr>`;

        const expiringRows = summary.expiringItems.length
            ? summary.expiringItems.map(item => `<tr><td>${item.name}</td><td>${item.stock} ${item.unit}</td><td>${item.days} days</td></tr>`).join('')
            : `<tr><td colspan="3">No expiring items in the next 30 days</td></tr>`;

        const reportHtml = `
            <html>
                <head>
                    <title>Analytics Report - ${state.settings.shopName}</title>
                    ${reportStyles}
                </head>
                <body>
                    <h1>${state.settings.shopName} - Analytics Report</h1>
                    <p><strong>Address:</strong> ${state.settings.shopAddress}</p>
                    <p><strong>Contact:</strong> ${state.settings.shopContact}</p>
                    ${state.settings.gstNumber ? `<p><strong>GSTIN:</strong> ${state.settings.gstNumber}</p>` : ''}
                    <p><strong>Generated on:</strong> ${now.toLocaleString()}</p>

                    <div class="section">
                        <h2>Revenue Snapshot</h2>
                        <div class="metrics">
                            <div class="card"><h3>Today</h3><p>${formatCurrency(summary.todayRevenue)}</p></div>
                            <div class="card"><h3>This Week</h3><p>${formatCurrency(summary.weekRevenue)}</p></div>
                            <div class="card"><h3>This Month</h3><p>${formatCurrency(summary.monthRevenue)}</p></div>
                            <div class="card"><h3>Total Credit Due</h3><p>${formatCurrency(summary.totalCreditDue)}</p></div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>Top Selling Items</h2>
                        <table>
                            <thead><tr><th>Item</th><th>Quantity Sold</th></tr></thead>
                            <tbody>${topSellingRows}</tbody>
                        </table>
                    </div>

                    <div class="section">
                        <h2>Expiring Inventory (Next 30 Days)</h2>
                        <table>
                            <thead><tr><th>Item</th><th>Stock</th><th>Days to Expiry</th></tr></thead>
                            <tbody>${expiringRows}</tbody>
                        </table>
                    </div>

                    <div class="footer">
                        Report generated by Kirana Shop Pro | Proprietor: Venu Gopal
                    </div>
                </body>
            </html>
        `;

        reportWindow.document.write(reportHtml);
        reportWindow.document.close();
        reportWindow.focus();
        reportWindow.print();

        // Auto-download a copy for offline reference
        const blob = new Blob([reportHtml], { type: 'application/msword' });
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = `Analytics_Report_${now.toISOString().split('T')[0]}.doc`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    };

    // --- EXPENSE FUNCTIONS ---
    window.addExpense = () => {
        const category = a.expenseCategory.value;
        const amount = parseFloat(a.expenseAmount.value);
        const description = a.expenseDescription.value.trim();
        const date = a.expenseDate.value;

        if (isNaN(amount) || amount <= 0 || !date) {
            showNotification('Please enter a valid amount and date.', 'error');
            return;
        }

        state.expenses.push({ category, amount, description, date });
        saveState();
        renderExpenses();
        showNotification('Expense added successfully!', 'success');
        a.expenseAmount.value = '';
        a.expenseDescription.value = '';
        a.expenseDate.valueAsDate = new Date();
    };

    const renderExpenses = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyExpenses = state.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });

        const expenseSummary = monthlyExpenses.reduce((summary, expense) => {
            summary[expense.category] = (summary[expense.category] || 0) + expense.amount;
            return summary;
        }, {});

        a.expenseSummary.innerHTML = '';
        let summaryHtml = '';
        if (Object.keys(expenseSummary).length > 0) {
            const totalMonthlyExpense = Object.values(expenseSummary).reduce((sum, amount) => sum + amount, 0);
            summaryHtml += `<p style="font-weight: bold; font-size: 1.2rem;">Total This Month: ${formatCurrency(totalMonthlyExpense)}</p><hr style="margin: 10px 0;">`;
            for (const category in expenseSummary) {
                summaryHtml += `<p>${category.charAt(0).toUpperCase() + category.slice(1)}: ${formatCurrency(expenseSummary[category])}</p>`;
            }
            a.expenseSummary.innerHTML = summaryHtml;
        } else {
            a.expenseSummary.innerHTML = `<p style="text-align: center; color: #666;">No expense data for this month.</p>`;
        }

        // Render Expense List
        a.expenseList.innerHTML = '';
        if (monthlyExpenses.length > 0) {
            let tableHtml = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 10px; text-align: left;">Date</th>
                            <th style="padding: 10px; text-align: left;">Category</th>
                            <th style="padding: 10px; text-align: left;">Description</th>
                            <th style="padding: 10px; text-align: right;">Amount</th>
                            <th style="padding: 10px; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            monthlyExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((expense) => {
                const originalIndex = state.expenses.indexOf(expense); // Find original index for deletion
                tableHtml += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatDate(expense.date)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${expense.description}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(expense.amount)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">
                            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteExpense(${originalIndex})">🗑️</button>
                        </td>
                    </tr>
                `;
            });
            tableHtml += `
                    </tbody>
                </table>
            `;
            a.expenseList.innerHTML = tableHtml;
        } else {
            a.expenseList.innerHTML = `<p style="text-align: center; color: #666;">No expenses logged yet.</p>`;
        }
    };

    window.deleteExpense = (index) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            state.expenses.splice(index, 1);
            saveState();
            renderExpenses();
            showNotification('Expense deleted successfully.', 'success');
        }
    };

    // --- SETTINGS FUNCTIONS ---
    const renderSettings = () => {
        a.shopName.value = state.settings.shopName;
        a.shopAddress.value = state.settings.shopAddress;
        a.shopContact.value = state.settings.shopContact;
        a.settingUpiId.value = state.settings.upiId;
        if (a.gstNumber) {
            a.gstNumber.value = state.settings.gstNumber || '';
        }
    };

    window.saveSettings = () => {
        state.settings.shopName = a.shopName.value.trim();
        state.settings.shopAddress = a.shopAddress.value.trim();
        state.settings.shopContact = a.shopContact.value.trim();
        state.settings.upiId = a.settingUpiId.value.trim();
        state.settings.gstNumber = (a.gstNumber?.value || '').trim().toUpperCase();

        saveState();
        renderSettings(); // Re-render settings to show saved data
        showNotification('Settings saved successfully!', 'success');

        // Update the shop name on the main header immediately
        document.querySelector('.header h1').textContent = `🏪 ${state.settings.shopName}`;
    };

    window.resetData = () => {
        if (confirm('ARE YOU ABSOLUTELY SURE? This will delete all your data permanently. This action cannot be undone.')) {
            if (prompt('To confirm, please type "DELETE" in all caps.') === 'DELETE') {
                localStorage.removeItem('kiranaProState');
                location.reload();
            } else {
                showNotification('Reset cancelled. Incorrect confirmation.', 'info');
            }
        }
    };

    // --- INITIALIZATION ---
    const init = () => {
        loadState();
        showTab('billing'); // Start on billing tab
        a.expenseDate.valueAsDate = new Date();
        document.querySelector('.header h1').textContent = `🏪 ${state.settings.shopName}`;

        // Load saved settings on app start
        renderSettings();
        renderInventory();
        renderCustomerList();
        renderAnalytics();
        renderExpenses();
        renderCreditHistory();
        if (a.paymentMethod) {
            a.paymentMethod.value = state.currentBill.paymentMethod || 'cash';
        }
        updateBill();
        updateCreditStatusCard();

        // Global key listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                // Can add a help modal here in the future
                showNotification('Help (F1) pressed. Future feature!', 'info');
            }
        });
    };

    // Run initialization
    init();
});
