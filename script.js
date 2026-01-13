
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
            isSaved: false,
        },
        settings: {
            shopName: 'My Kirana Store',
            shopAddress: '123 Main Street, City',
            shopContact: '9876543210',
            upiId: 'yourshop@upi',
            gstNumber: '',
            password: '' // Default empty, user needs to set it
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
        inventorySearch: document.getElementById('inventorySearch'),
        sortBy: document.getElementById('sortBy'),
        minPrice: document.getElementById('minPrice'),
        maxPrice: document.getElementById('maxPrice'),
        stockStatus: document.getElementById('stockStatus'),
        filterUnit: document.getElementById('filterUnit'),
        expiryStatus: document.getElementById('expiryStatus'),
        minStock: document.getElementById('minStock'),
        maxStock: document.getElementById('maxStock'),
        searchResultsInfo: document.getElementById('searchResultsInfo'),
        resultsCount: document.getElementById('resultsCount'),
        clearFiltersBtn: document.getElementById('clearFiltersBtn'),
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
        copyBillBtn: document.getElementById('copyBillBtn'),
        // Modals
        inlineBillPreview: document.getElementById('inlineBillPreview'),
        printBillOnly: document.getElementById('printBillOnly'),
        savedBillsModal: document.getElementById('savedBillsModal'),
        savedBillsList: document.getElementById('savedBillsList'),
        savedBillsSearch: document.getElementById('savedBillsSearch'),
        creditBillModal: document.getElementById('creditBillModal'),
        creditBillContent: document.getElementById('creditBillContent'),
        // Customers
        newCustomerName: document.getElementById('newCustomerName'),
        newCustomerPhone: document.getElementById('newCustomerPhone'),
        newCustomerBirthday: document.getElementById('newCustomerBirthday'),
        creditCustomer: document.getElementById('creditCustomer'),
        creditAmount: document.getElementById('creditAmount'),
        creditBill: document.getElementById('creditBill'),
        reminderList: document.getElementById('reminderList'),
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
        // Calendar
        calendarContainer: document.getElementById('calendarContainer'),
        calendarMonthYear: document.getElementById('calendarMonthYear'),
        upcomingFestivals: document.getElementById('upcomingFestivals'),
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
            try {
                const parsed = JSON.parse(savedState);
                
                // Merge all state properties properly
                state.inventory = parsed.inventory || [];
                state.customers = parsed.customers || [];
                state.bills = parsed.bills || [];
                state.expenses = parsed.expenses || [];
                state.creditTransactions = parsed.creditTransactions || [];
                state.savedBillsFilter = parsed.savedBillsFilter || '';
                state.selectedSuggestionIndex = parsed.selectedSuggestionIndex || -1;
                
                // Merge currentBill properly
                if (parsed.currentBill) {
                    state.currentBill = {
                        items: parsed.currentBill.items || [],
                        customer: parsed.currentBill.customer || { name: '', phone: '' },
                        total: parsed.currentBill.total || 0,
                        discountAmount: parsed.currentBill.discountAmount || 0,
                        paymentMethod: parsed.currentBill.paymentMethod || 'cash',
                        paymentDetails: parsed.currentBill.paymentDetails || null,
                        isSaved: parsed.currentBill.isSaved || false
                    };
                } else {
                    state.currentBill = {
                        items: [],
                        customer: { name: '', phone: '' },
                        total: 0,
                        discountAmount: 0,
                        paymentMethod: 'cash',
                        paymentDetails: null,
                        isSaved: false
                    };
                }
                
                // Merge settings properly including password
                if (parsed.settings) {
                    state.settings = {
                        shopName: parsed.settings.shopName || 'My Kirana Store',
                        shopAddress: parsed.settings.shopAddress || '123 Main Street, City',
                        shopContact: parsed.settings.shopContact || '9876543210',
                        upiId: parsed.settings.upiId || 'yourshop@upi',
                        gstNumber: parsed.settings.gstNumber || '',
                        password: parsed.settings.password || '' // Preserve password
                    };
                }
                
                // Initialize creditBills and lastReminderDate for existing customers
                state.customers.forEach(customer => {
                    if (!customer.creditBills) customer.creditBills = [];
                    if (!customer.lastReminderDate) customer.lastReminderDate = null;
                    if (!customer.loyaltyPoints) customer.loyaltyPoints = 0;
                });
            } catch (e) {
                console.error('Error loading state:', e);
                showNotification('Error loading saved data. Starting fresh.', 'error');
            }
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

    // --- PASSWORD SECURITY ---
    const promptPassword = (message = 'Enter password:') => {
        return prompt(message) || '';
    };

    const verifyPassword = (actionName = 'this action') => {
        if (!state.settings.password) {
            // First time setup - ask user to set a password
            const newPassword = promptPassword('No password set. Please set a password for security:');
            if (!newPassword || newPassword.trim() === '') {
                showNotification('Password is required for security.', 'error');
                return false;
            }
            const confirmPassword = promptPassword('Confirm password:');
            if (newPassword !== confirmPassword) {
                showNotification('Passwords do not match. Please try again.', 'error');
                return false;
            }
            state.settings.password = newPassword.trim();
            saveState();
            showNotification('Password set successfully!', 'success');
            return true;
        } else {
            // Verify existing password
            const enteredPassword = promptPassword(`Enter password to ${actionName}:`);
            if (enteredPassword.trim() !== state.settings.password) {
                showNotification('Incorrect password. Access denied.', 'error');
                return false;
            }
            return true;
        }
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
        if (tabId === 'inventory') filterInventory();
        if (tabId === 'customers') renderCustomerList();
        if (tabId === 'analytics') renderAnalytics();
        if (tabId === 'expenses') renderExpenses();
        if (tabId === 'calendar') renderCalendar();
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
        filterInventory();
        a.itemName.value = '';
        a.itemPrice.value = '';
        a.itemStock.value = '';
        a.itemMinStock.value = '';
        a.itemExpiry.value = '';
    };

    const renderInventory = (itemsToRender = null) => {
        a.inventoryList.innerHTML = '';
        const items = itemsToRender !== null ? itemsToRender : state.inventory;
        
        if (items.length === 0) {
            const message = itemsToRender !== null && itemsToRender.length === 0 && state.inventory.length > 0
                ? `<p style="text-align: center; color: #666; padding: 20px;">No items match your search criteria. Try adjusting your filters.</p>`
                : `<p style="text-align: center; color: #666;">No items in inventory.</p>`;
            a.inventoryList.innerHTML = message;
            return;
        }
        
        // Find original indices for edit/delete buttons
        items.forEach((item) => {
            const originalIndex = state.inventory.findIndex(invItem => 
                invItem.name === item.name && 
                invItem.price === item.price && 
                invItem.unit === item.unit
            );
            
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            const isLowStock = item.stock < item.minStock;
            const isExpiring = item.expiry && (new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24) < 30;
            const isExpired = item.expiry && new Date(item.expiry) < new Date();

            itemElement.innerHTML = `
                <h4>${item.name}</h4>
                <p><strong>Price:</strong> ${formatCurrency(item.price)} per ${item.unit}</p>
                <p><strong>Stock:</strong> <span style="font-weight: bold; color: ${isLowStock ? '#d32f2f' : '#2e7d32'};">${item.stock} ${item.unit}</span></p>
                ${item.expiry ? `<p><strong>Expiry:</strong> ${formatDate(item.expiry)}</p>` : ''}
                ${isLowStock ? `<p style="color: #d32f2f; font-weight: bold;">⚠️ LOW STOCK ALERT!</p>` : ''}
                ${isExpiring && !isExpired ? `<p style="color: #ffc107; font-weight: bold;">⏰ EXPIRING SOON!</p>` : ''}
                ${isExpired ? `<p style="color: #d32f2f; font-weight: bold;">❌ EXPIRED!</p>` : ''}
                <div style="margin-top: 15px; display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-small" onclick="editItem(${originalIndex})">✏️ Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteItem(${originalIndex})">🗑️ Delete</button>
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
        filterInventory(); // Use filterInventory instead of renderInventory to maintain search state
        if (showNotif) {
            showNotification(`${item.name} deleted from inventory.`, 'success');
        }
    };

    // --- ADVANCED INVENTORY SEARCH FUNCTIONS ---
    window.filterInventory = () => {
        // If DOM elements not ready, just render normally
        if (!a.inventorySearch || !a.inventoryList) {
            renderInventory();
            return;
        }
        
        const searchQuery = (a.inventorySearch.value || '').trim().toLowerCase();
        const sortBy = a.sortBy ? a.sortBy.value : 'name-asc';
        const minPrice = a.minPrice ? parseFloat(a.minPrice.value) : null;
        const maxPrice = a.maxPrice ? parseFloat(a.maxPrice.value) : null;
        const stockStatus = a.stockStatus ? a.stockStatus.value : 'all';
        const filterUnit = a.filterUnit ? a.filterUnit.value : 'all';
        const expiryStatus = a.expiryStatus ? a.expiryStatus.value : 'all';
        const minStock = a.minStock ? parseFloat(a.minStock.value) : null;
        const maxStock = a.maxStock ? parseFloat(a.maxStock.value) : null;

        let filtered = [...state.inventory];

        // Text search filter
        if (searchQuery) {
            filtered = filtered.filter(item => {
                const searchableText = `${item.name} ${item.unit} ${item.price}`.toLowerCase();
                return searchableText.includes(searchQuery);
            });
        }

        // Price range filter
        if (minPrice !== null && !isNaN(minPrice)) {
            filtered = filtered.filter(item => item.price >= minPrice);
        }
        if (maxPrice !== null && !isNaN(maxPrice)) {
            filtered = filtered.filter(item => item.price <= maxPrice);
        }

        // Stock status filter
        if (stockStatus !== 'all') {
            filtered = filtered.filter(item => {
                const isLowStock = item.stock < item.minStock;
                const isOutOfStock = item.stock === 0;
                if (stockStatus === 'low-stock') return isLowStock && !isOutOfStock;
                if (stockStatus === 'out-of-stock') return isOutOfStock;
                if (stockStatus === 'in-stock') return !isLowStock && !isOutOfStock;
                return true;
            });
        }

        // Unit filter
        if (filterUnit !== 'all') {
            filtered = filtered.filter(item => item.unit === filterUnit);
        }

        // Expiry status filter
        if (expiryStatus !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filtered = filtered.filter(item => {
                if (!item.expiry) {
                    return expiryStatus === 'no-expiry';
                }
                const expiryDate = new Date(item.expiry);
                expiryDate.setHours(0, 0, 0, 0);
                const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
                
                if (expiryStatus === 'expired') return expiryDate < today;
                if (expiryStatus === 'expiring-soon') return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
                if (expiryStatus === 'no-expiry') return false;
                return true;
            });
        }

        // Stock range filter
        if (minStock !== null && !isNaN(minStock)) {
            filtered = filtered.filter(item => item.stock >= minStock);
        }
        if (maxStock !== null && !isNaN(maxStock)) {
            filtered = filtered.filter(item => item.stock <= maxStock);
        }

        // Sorting
        filtered.sort((a, b) => {
            const [field, order] = sortBy.split('-');
            let comparison = 0;
            
            if (field === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (field === 'price') {
                comparison = a.price - b.price;
            } else if (field === 'stock') {
                comparison = a.stock - b.stock;
            }
            
            return order === 'desc' ? -comparison : comparison;
        });

        // Update results count
        if (a.searchResultsInfo && a.resultsCount) {
            if (filtered.length !== state.inventory.length || searchQuery || 
                minPrice !== null || maxPrice !== null || stockStatus !== 'all' || 
                filterUnit !== 'all' || expiryStatus !== 'all' || 
                minStock !== null || maxStock !== null) {
                a.resultsCount.textContent = filtered.length;
                a.searchResultsInfo.style.display = 'block';
            } else {
                a.searchResultsInfo.style.display = 'none';
            }
        }

        // Show/hide clear filters button
        if (a.clearFiltersBtn) {
            const hasActiveFilters = searchQuery || 
                (minPrice !== null && !isNaN(minPrice)) || 
                (maxPrice !== null && !isNaN(maxPrice)) || 
                stockStatus !== 'all' || 
                filterUnit !== 'all' || 
                expiryStatus !== 'all' || 
                (minStock !== null && !isNaN(minStock)) || 
                (maxStock !== null && !isNaN(maxStock));
            a.clearFiltersBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';
        }

        // Render filtered results
        renderInventory(filtered);
    };

    window.toggleAdvancedFilters = () => {
        const filtersDiv = document.getElementById('advancedFilters');
        const toggleBtn = document.getElementById('toggleFiltersBtn');
        if (filtersDiv && toggleBtn) {
            const isVisible = filtersDiv.style.display !== 'none';
            filtersDiv.style.display = isVisible ? 'none' : 'block';
            toggleBtn.textContent = isVisible ? '⚙️ Filters' : '✖️ Close Filters';
        }
    };

    window.clearInventoryFilters = () => {
        if (a.inventorySearch) a.inventorySearch.value = '';
        if (a.sortBy) a.sortBy.value = 'name-asc';
        if (a.minPrice) a.minPrice.value = '';
        if (a.maxPrice) a.maxPrice.value = '';
        if (a.stockStatus) a.stockStatus.value = 'all';
        if (a.filterUnit) a.filterUnit.value = 'all';
        if (a.expiryStatus) a.expiryStatus.value = 'all';
        if (a.minStock) a.minStock.value = '';
        if (a.maxStock) a.maxStock.value = '';
        
        filterInventory();
        if (a.clearFiltersBtn) a.clearFiltersBtn.style.display = 'none';
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
            if (a.copyBillBtn) a.copyBillBtn.disabled = true;
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
            if (a.copyBillBtn) a.copyBillBtn.disabled = false;
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

        // Only restore stock if bill hasn't been saved and item is not manual
        if (!state.currentBill.isSaved && !item.isManual) {
            const inventoryItem = state.inventory.find(i => i.name === item.name);
            if (inventoryItem) {
                inventoryItem.stock += item.quantity;
            }
        }

        state.currentBill.items.splice(index, 1);
        updateBill();
        saveState();
        showNotification(`${item.name} removed from bill.`, 'info');
    };

    window.clearBill = () => {
        const confirmMsg = 'Are you sure you want to clear the current bill? This will start a new bill.';
        
        if (confirm(confirmMsg)) {
            // Clear bill without restoring stock (stock is only restored when items are removed individually)
            state.currentBill.items = [];
            state.currentBill.total = 0;
            state.currentBill.customer = { name: '', phone: '' };
            state.currentBill.paymentMethod = 'cash';
            state.currentBill.discountAmount = 0;
            state.currentBill.paymentDetails = null;
            state.currentBill.isSaved = false;
            a.customerName.value = '';
            a.customerPhone.value = '';
            a.loyaltyDisplay.textContent = 'Points: 0 | Discount: 0%';
            a.paymentMethod.value = 'cash';
            a.quantity.value = '';
            if (a.splitAmount) a.splitAmount.value = '';
            // Clear manual item entry fields
            if (a.manualItemName) a.manualItemName.value = '';
            if (a.manualItemQuantity) a.manualItemQuantity.value = '';
            if (a.manualItemPrice) a.manualItemPrice.value = '';
            handlePaymentMethodChange();

            updateBill();
            
            // Clear the generated bill preview
            if (a.inlineBillPreview) {
                a.inlineBillPreview.innerHTML = '';
            }
            if (a.printBillOnly) {
                a.printBillOnly.innerHTML = '';
            }
            
            showNotification('Bill cleared. Ready for new bill.', 'success');
            saveState();
            renderInventory();
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
            <div style="position: relative; background: linear-gradient(135deg, #fff9e6, #fff8dc); padding: 30px; border-radius: 15px; border: 2px solid #f0e68c; min-height: 100%;">
                <!-- Logo/Image at top left corner with thickness effect -->
                <div style="position: absolute; top: 10px; left: 10px; z-index: 1; opacity: 0.85; filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.2)) drop-shadow(0 0 10px rgba(255,255,255,0.3));">
                    <img src="images/bill-logo.png" alt="Shop Logo" style="max-width: 80px; max-height: 80px; object-fit: contain; border-radius: 8px; background: rgba(255,255,255,0.6); padding: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 3px rgba(255,255,255,0.5);">
                </div>
                
                <!-- Corner grocery items decorations -->
                <div style="position: absolute; top: 10px; right: 10px; font-size: 30px; opacity: 0.3; z-index: 1;">🥫</div>
                <div style="position: absolute; bottom: 10px; left: 10px; font-size: 30px; opacity: 0.3; z-index: 1;">🍚</div>
                <div style="position: absolute; bottom: 10px; right: 10px; font-size: 30px; opacity: 0.3; z-index: 1;">🛍️</div>
                
                <!-- Additional grocery items around corners -->
                <div style="position: absolute; top: 50px; right: 15px; font-size: 25px; opacity: 0.25; z-index: 1;">🍞</div>
                <div style="position: absolute; bottom: 50px; left: 15px; font-size: 25px; opacity: 0.25; z-index: 1;">🥜</div>
                <div style="position: absolute; bottom: 50px; right: 15px; font-size: 25px; opacity: 0.25; z-index: 1;">🧴</div>
                
                <div style="position: relative; z-index: 2;">
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
                        <p>Powered by Venu Kiranam&General store</p>
                    </div>
                </div>
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

    const generateShareableBillText = (bill, billNumber = null) => {
        const shopName = state.settings.shopName;
        const shopAddress = state.settings.shopAddress;
        const shopContact = state.settings.shopContact;
        const gstNumber = state.settings.gstNumber;
        
        const billDate = bill.date ? new Date(bill.date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
        const billTime = bill.date ? new Date(bill.date).toLocaleTimeString('en-IN') : new Date().toLocaleTimeString('en-IN');
        const billNum = billNumber || 'Current Bill';
        
        let billText = `🧾 *${shopName}*\n`;
        billText += `📍 ${shopAddress}\n`;
        billText += `📞 ${shopContact}\n`;
        if (gstNumber) billText += `GSTIN: ${gstNumber}\n`;
        billText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        billText += `📋 *Bill #${billNum}*\n`;
        billText += `📅 Date: ${billDate}\n`;
        billText += `🕐 Time: ${billTime}\n`;
        billText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        
        if (bill.customer?.name || bill.customer?.phone) {
            billText += `👤 *Customer:* ${bill.customer.name || 'N/A'}\n`;
            billText += `📱 *Contact:* ${bill.customer.phone || 'N/A'}\n`;
            billText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        }
        
        billText += `\n*Items:*\n`;
        bill.items.forEach((item, index) => {
            billText += `${index + 1}. ${item.name}\n`;
            billText += `   ${item.quantity} ${item.unit} × ${formatCurrency(item.price)} = ${formatCurrency(item.totalPrice)}\n`;
        });
        
        billText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        billText += `💰 *Subtotal:* ${formatCurrency(bill.total)}\n`;
        if (bill.discountAmount > 0) {
            billText += `🎁 *Discount:* -${formatCurrency(bill.discountAmount)}\n`;
        }
        const grandTotal = bill.total - (bill.discountAmount || 0);
        billText += `\n💵 *GRAND TOTAL: ${formatCurrency(grandTotal)}*\n`;
        
        if (bill.paymentDetails) {
            billText += `\n💳 *Payment:* ${bill.paymentDetails.label || 'Not specified'}\n`;
            if (bill.paymentDetails.breakdown && bill.paymentDetails.breakdown.length > 0) {
                bill.paymentDetails.breakdown.forEach(entry => {
                    billText += `   ${entry.label}: ${formatCurrency(entry.amount)}\n`;
                });
            }
        }
        
        billText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        billText += `🙏 *Thank you for your visit!*\n`;
        billText += `\nPowered by Venu Kiranam&General store`;
        
        return billText;
    };

    window.copyBill = () => {
        if (state.currentBill.items.length === 0) {
            showNotification('Cannot copy an empty bill.', 'error');
            return;
        }

        const billText = generateShareableBillText(state.currentBill);
        
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(billText).then(() => {
                showNotification('Bill copied to clipboard! You can paste it anywhere.', 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = billText;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Bill copied to clipboard!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = billText;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Bill copied to clipboard!', 'success');
        }
    };

    window.shareSavedBill = (index) => {
        const bill = state.bills[index];
        if (!bill) {
            showNotification('Bill not found.', 'error');
            return;
        }

        const billNumber = state.bills.length - index;
        const billText = generateShareableBillText(bill, billNumber);
        const customerPhone = bill.customer?.phone;
        
        // If customer has phone number, create WhatsApp link
        if (customerPhone) {
            const phoneNumber = customerPhone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(billText)}`;
            
            // Try to open WhatsApp
            window.open(whatsappUrl, '_blank');
            showNotification('Opening WhatsApp to share bill...', 'info');
            
            // Also copy to clipboard as fallback
            navigator.clipboard.writeText(billText).then(() => {
                setTimeout(() => {
                    showNotification('Bill text also copied to clipboard!', 'success');
                }, 1000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = billText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            });
        } else {
            // No phone number, just copy to clipboard
            navigator.clipboard.writeText(billText).then(() => {
                showNotification('Bill text copied to clipboard! You can paste it in WhatsApp/SMS.', 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = billText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Bill text copied to clipboard!', 'success');
            });
        }
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
        newBill.billId = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        state.bills.push(newBill);

        // If payment method is credit, automatically add to customer's credit
        if (state.currentBill.paymentMethod === 'credit' && state.currentBill.customer.phone) {
            let customer = state.customers.find(c => c.phone === state.currentBill.customer.phone);
            
            // If customer doesn't exist, create them
            if (!customer && state.currentBill.customer.name) {
                customer = {
                    name: state.currentBill.customer.name,
                    phone: state.currentBill.customer.phone,
                    credit: 0,
                    loyaltyPoints: 0,
                    creditBills: [],
                    lastReminderDate: null
                };
                state.customers.push(customer);
                showNotification(`New customer ${customer.name} created and added to credit.`, 'info');
            }
            
            if (customer) {
                const creditAmount = state.currentBill.total - (state.currentBill.discountAmount || 0);
                customer.credit += creditAmount;
                
                // Add bill reference to credit
                if (!customer.creditBills) customer.creditBills = [];
                const billIndex = state.bills.length - 1; // Index of the bill we just pushed
                const billReference = {
                    billId: newBill.billId,
                    billNumber: state.bills.length - billIndex, // Correct bill number calculation
                    date: newBill.date,
                    amount: creditAmount,
                    items: newBill.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ')
                };
                customer.creditBills.push(billReference);
                
                logCreditTransaction('add', customer, creditAmount, billReference);
                showNotification(`Bill #${billReference.billNumber} (${formatCurrency(creditAmount)}) automatically added to credit for ${customer.name}.`, 'success');
                
                // Refresh customer list and credit status if on customers tab
                renderCustomerList();
                updateCreditStatusCard();
            } else {
                showNotification('Customer phone number required to add bill to credit.', 'error');
            }
        }

        // Mark current bill as saved (stock should not be restored if cleared now)
        state.currentBill.isSaved = true;

        showNotification('Bill saved successfully!', 'success');

        // Clear manual item entry fields
        if (a.manualItemName) a.manualItemName.value = '';
        if (a.manualItemQuantity) a.manualItemQuantity.value = '';
        if (a.manualItemPrice) a.manualItemPrice.value = '';

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

    window.viewCreditBill = (billId, customerIndex) => {
        // Find the bill by billId
        const billIndex = state.bills.findIndex(bill => bill.billId === billId);
        
        if (billIndex === -1) {
            showNotification('Bill not found. It may have been deleted.', 'error');
            return;
        }

        const bill = state.bills[billIndex];
        const billNumber = state.bills.length - billIndex;
        const customer = state.customers[customerIndex];
        
        // Generate bill content for display
        const customerInfo = bill.customer?.name || bill.customer?.phone ? `
            <p style="text-align: left; margin-top: 10px;">
                <strong>Customer:</strong> ${bill.customer.name || 'N/A'}<br>
                <strong>Contact:</strong> ${bill.customer.phone || 'N/A'}
            </p>` : '';
        const gstLine = state.settings.gstNumber ? `<p>GSTIN: ${state.settings.gstNumber}</p>` : '';

        let tableRows = '';
        bill.items.forEach((item, index) => {
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

        const paymentBreakdownHtml = bill.paymentDetails?.breakdown?.map(entry => `<span>${entry.label}: ${formatCurrency(entry.amount)}</span>`).join('') || '';
        const paymentInfoSection = bill.paymentDetails ? `
            <div class="bill-payment-info">
                <p><strong>Payment Method:</strong> ${bill.paymentDetails.label || 'Not specified'}</p>
                ${paymentBreakdownHtml}
            </div>
        ` : '';

        const billDate = bill.date ? new Date(bill.date).toLocaleDateString('en-IN') : 'Unknown';
        const billTime = bill.date ? new Date(bill.date).toLocaleTimeString('en-IN') : 'Unknown';

        const billContent = `
            <div style="position: relative; background: linear-gradient(135deg, #fff9e6, #fff8dc); padding: 30px; border-radius: 15px; border: 2px solid #f0e68c; min-height: 100%;">
                <!-- Logo/Image at top left corner with thickness effect -->
                <div style="position: absolute; top: 10px; left: 10px; z-index: 1; opacity: 0.85; filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.2)) drop-shadow(0 0 10px rgba(255,255,255,0.3));">
                    <img src="images/bill-logo.png" alt="Shop Logo" style="max-width: 80px; max-height: 80px; object-fit: contain; border-radius: 8px; background: rgba(255,255,255,0.6); padding: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 3px rgba(255,255,255,0.5);">
                </div>
                
                <!-- Corner grocery items decorations -->
                <div style="position: absolute; top: 10px; right: 10px; font-size: 30px; opacity: 0.3; z-index: 1;">🥫</div>
                <div style="position: absolute; bottom: 10px; left: 10px; font-size: 30px; opacity: 0.3; z-index: 1;">🍚</div>
                <div style="position: absolute; bottom: 10px; right: 10px; font-size: 30px; opacity: 0.3; z-index: 1;">🛍️</div>
                
                <!-- Additional grocery items around corners -->
                <div style="position: absolute; top: 50px; right: 15px; font-size: 25px; opacity: 0.25; z-index: 1;">🍞</div>
                <div style="position: absolute; bottom: 50px; left: 15px; font-size: 25px; opacity: 0.25; z-index: 1;">🥜</div>
                <div style="position: absolute; bottom: 50px; right: 15px; font-size: 25px; opacity: 0.25; z-index: 1;">🧴</div>
                
                <div style="position: relative; z-index: 2;">
                    <div class="shop-header">
                        <div class="bill-proprietor">Proprietor: Venu Gopal</div>
                        <h1>${state.settings.shopName}</h1>
                        <p>${state.settings.shopAddress}</p>
                        <p>Contact: ${state.settings.shopContact}</p>
                        ${gstLine}
                        <p>Date: ${billDate}</p>
                        <p>Time: ${billTime}</p>
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
                        <p><strong>Subtotal:</strong> ${formatCurrency(bill.total)}</p>
                        ${bill.discountAmount > 0 ? `<p><strong>Discount:</strong> -${formatCurrency(bill.discountAmount)}</p>` : ''}
                        <h2 style="margin-top: 10px;">GRAND TOTAL: ${formatCurrency(bill.total - (bill.discountAmount || 0))}</h2>
                    </div>
                    ${paymentInfoSection}
                    ${customerInfo}
                    <div class="bill-footer">
                        <p>Thank you for your visit!</p>
                        <p>Powered by Venu Kiranam&General store</p>
                    </div>
                    <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <p style="margin: 0;"><strong>📌 Credit Reference:</strong></p>
                        <p style="margin: 5px 0 0 0;">This bill is linked to credit for <strong>${customer.name}</strong></p>
                        <p style="margin: 5px 0 0 0;">Credit Amount: <strong>${formatCurrency(customer.credit)}</strong></p>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="btn btn-primary" onclick="shareSavedBill(${billIndex})" style="margin-right: 10px;">📱 Share This Bill</button>
                        <button class="btn btn-secondary" onclick="printCreditBill(${billIndex})">🖨️ Print</button>
                    </div>
                </div>
            </div>
        `;

        a.creditBillContent.innerHTML = billContent;
        a.creditBillModal.style.display = 'flex';
    };

    window.closeCreditBillModal = () => {
        a.creditBillModal.style.display = 'none';
    };

    // Close credit bill modal when clicking outside
    if (a.creditBillModal) {
        a.creditBillModal.addEventListener('click', (e) => {
            if (e.target === a.creditBillModal) {
                closeCreditBillModal();
            }
        });
    }

    window.printCreditBill = (billIndex) => {
        const bill = state.bills[billIndex];
        if (!bill) return;

        // Create a temporary print window
        const printWindow = window.open('', '_blank');
        const billDate = bill.date ? new Date(bill.date).toLocaleDateString('en-IN') : 'Unknown';
        const billTime = bill.date ? new Date(bill.date).toLocaleTimeString('en-IN') : 'Unknown';
        const customerInfo = bill.customer?.name || bill.customer?.phone ? `
            <p style="text-align: left; margin-top: 10px;">
                <strong>Customer:</strong> ${bill.customer.name || 'N/A'}<br>
                <strong>Contact:</strong> ${bill.customer.phone || 'N/A'}
            </p>` : '';
        const gstLine = state.settings.gstNumber ? `<p>GSTIN: ${state.settings.gstNumber}</p>` : '';

        let tableRows = '';
        bill.items.forEach((item, index) => {
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

        const paymentBreakdownHtml = bill.paymentDetails?.breakdown?.map(entry => `<span>${entry.label}: ${formatCurrency(entry.amount)}</span>`).join('') || '';
        const paymentInfoSection = bill.paymentDetails ? `
            <div class="bill-payment-info">
                <p><strong>Payment Method:</strong> ${bill.paymentDetails.label || 'Not specified'}</p>
                ${paymentBreakdownHtml}
            </div>
        ` : '';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill #${state.bills.length - billIndex}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #fff9e6, #fff8dc); }
                    .shop-header { text-align: center; margin-bottom: 20px; }
                    .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .bill-table th { background-color: #f2f2f2; }
                    .bill-footer { text-align: center; margin-top: 20px; }
                    .bill-container { position: relative; padding: 30px; }
                    .corner-icon { position: absolute; font-size: 30px; opacity: 0.3; }
                    .corner-icon.top-left { top: 10px; left: 10px; }
                    .corner-icon.top-right { top: 10px; right: 10px; }
                    .corner-icon.bottom-left { bottom: 10px; left: 10px; }
                    .corner-icon.bottom-right { bottom: 10px; right: 10px; }
                </style>
            </head>
            <body>
                <div class="bill-container">
                    <!-- Logo/Image at top left corner with thickness effect -->
                    <div style="position: absolute; top: 10px; left: 10px; z-index: 1; opacity: 0.85; filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.2)) drop-shadow(0 0 10px rgba(255,255,255,0.3));">
                        <img src="images/bill-logo.png" alt="Shop Logo" style="max-width: 80px; max-height: 80px; object-fit: contain; border-radius: 8px; background: rgba(255,255,255,0.6); padding: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 3px rgba(255,255,255,0.5);">
                    </div>
                    <div class="corner-icon top-right">🥫</div>
                    <div class="corner-icon bottom-left">🍚</div>
                    <div class="corner-icon bottom-right">🛍️</div>
                    <div style="position: relative; z-index: 2;">
                        <div class="shop-header">
                    <div>Proprietor: Venu Gopal</div>
                    <h1>${state.settings.shopName}</h1>
                    <p>${state.settings.shopAddress}</p>
                    <p>Contact: ${state.settings.shopContact}</p>
                    ${gstLine}
                    <p>Date: ${billDate}</p>
                    <p>Time: ${billTime}</p>
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
                    <p><strong>Subtotal:</strong> ${formatCurrency(bill.total)}</p>
                    ${bill.discountAmount > 0 ? `<p><strong>Discount:</strong> -${formatCurrency(bill.discountAmount)}</p>` : ''}
                    <h2 style="margin-top: 10px;">GRAND TOTAL: ${formatCurrency(bill.total - (bill.discountAmount || 0))}</h2>
                </div>
                ${paymentInfoSection}
                ${customerInfo}
                <div class="bill-footer">
                    <p>Thank you for your visit!</p>
                    <p>Powered by Venu Kiranam&General store</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
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
                        <button class="btn btn-success" onclick="shareSavedBill(${index})" style="margin-bottom: 5px;">📱 Share</button>
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

        state.customers.push({ name, phone, birthday, credit: 0, loyaltyPoints: 0, creditBills: [], lastReminderDate: null });
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
            const creditBills = customer.creditBills || [];
            
            // Generate credit bills HTML
            let creditBillsHtml = '';
            if (creditBills.length > 0) {
                creditBillsHtml = '<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">';
                creditBillsHtml += '<p style="font-size: 12px; color: #666; margin-bottom: 5px;"><strong>Reference Bills:</strong></p>';
                creditBills.forEach((billRef, billIdx) => {
                    const billDate = billRef.date ? new Date(billRef.date).toLocaleDateString() : 'Unknown';
                    const safeBillId = billRef.billId.replace(/'/g, "\\'"); // Escape single quotes
                    creditBillsHtml += `
                        <div style="margin: 5px 0; padding: 8px; background: #f5f5f5; border-radius: 5px; cursor: pointer; border: 1px solid #ddd;"
                             onclick="viewCreditBill('${safeBillId}', ${index})"
                             onmouseover="this.style.background='#e8f5e9'" 
                             onmouseout="this.style.background='#f5f5f5'"
                             title="Click to view bill details">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <span style="font-weight: bold; color: #1976d2;">📄 Bill #${billRef.billNumber}</span>
                                    <span style="font-size: 11px; color: #666; margin-left: 8px;">${formatCurrency(billRef.amount)}</span>
                                    <span style="font-size: 11px; color: #888; margin-left: 8px;">(${billDate})</span>
                                </div>
                                <span style="font-size: 11px; color: #4caf50; font-weight: bold;">Click to view →</span>
                            </div>
                        </div>
                    `;
                });
                creditBillsHtml += '</div>';
            }

            customerElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h4>${customer.name}</h4>
                        <p>Phone: ${customer.phone}</p>
                        <p>Loyalty Points: ${customer.loyaltyPoints}</p>
                        ${customer.birthday ? `<p>Birthday: ${formatDate(customer.birthday)}</p>` : ''}
                    </div>
                    <div style="text-align: right; min-width: 150px;">
                        <h3 style="color: ${creditDue ? '#d32f2f' : '#2e7d32'}; margin-bottom: 5px;">Credit: ${formatCurrency(customer.credit)}</h3>
                        <small style="color: ${creditDue ? '#d32f2f' : '#2e7d32'};">
                            ${creditDue ? 'Pending due' : 'No dues'}
                        </small>
                        ${creditBillsHtml}
                        <button
                            class="btn btn-danger"
                            style="padding: 4px 8px; font-size: 12px; margin-top: 10px;"
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
        const creditBills = customer.creditBills || [];
        
        let billsHtml = '';
        if (creditBills.length > 0) {
            billsHtml = '<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;"><strong>Credit Bills:</strong><ul style="margin: 10px 0; padding-left: 20px;">';
            creditBills.forEach(bill => {
                const billDate = bill.date ? new Date(bill.date).toLocaleDateString() : 'Unknown';
                billsHtml += `<li style="margin: 5px 0;">Bill #${bill.billNumber} - ${formatCurrency(bill.amount)} (${billDate})</li>`;
            });
            billsHtml += '</ul></div>';
        }
        
        const statusHtml = `
            <div>
                <h4>${customer.name}</h4>
                <p>Phone: ${customer.phone}</p>
            </div>
            <div class="credit-status-amount">
                <span>${formatCurrency(due)}</span>
                <small>${due > 0 ? 'Outstanding' : 'Clear'}</small>
            </div>
            ${billsHtml}
        `;
        a.creditStatusCard.innerHTML = statusHtml;
        a.creditStatusCard.classList.toggle('has-overdue', due > 0);
    };

    const logCreditTransaction = (type, customer, amount, billReference = null) => {
        const safeAmount = Number(amount) || 0;
        state.creditTransactions.unshift({
            id: `${customer.phone}-${Date.now()}`,
            type,
            customerName: customer.name,
            customerPhone: customer.phone,
            amount: safeAmount,
            balance: customer.credit,
            billReference: billReference,
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
            const billRef = entry.billReference ? `<p style="font-size: 11px; color: #666; margin-top: 5px;">📄 Bill #${entry.billReference.billNumber}</p>` : '';
            entryElement.innerHTML = `
                <div>
                    <strong>${entry.customerName}</strong>
                    <p style="font-size: 12px; color: #666;">${date}</p>
                    <p style="font-size: 12px; color: #888;">${entry.customerPhone}</p>
                    ${billRef}
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

    const generateReminderMessage = (customer, amount, language = 'en') => {
        const customerName = customer.name || 'Customer';
        const greetings = {
            'en': `Namaste ${customerName} 🙏`,
            'hi': `नमस्ते ${customerName} 🙏`,
            'te': `నమస్కారం ${customerName} 🙏`
        };
        const messages = {
            'en': [
                `This is a gentle reminder that your kirana balance of ${formatCurrency(amount)} is pending.`,
                `Please clear it when convenient. Thank you 😊`
            ],
            'hi': [
                `यह एक सौम्य अनुस्मारक है कि आपका किराना बैलेंस ${formatCurrency(amount)} लंबित है।`,
                `कृपया सुविधानुसार इसे क्लियर करें। धन्यवाद 😊`
            ],
            'te': [
                `మీ కిరాణా బ్యాలెన్స్ ${formatCurrency(amount)} పెండింగ్‌లో ఉందని ఇది ఒక సౌమ్యమైన రిమైండర్.`,
                `దయచేసి సౌకర్యంగా ఉన్నప్పుడు క్లియర్ చేయండి. ధన్యవాదాలు 😊`
            ]
        };
        
        const greeting = greetings[language] || greetings['en'];
        const message = messages[language] || messages['en'];
        
        return `${greeting}\n${message[0]}\n${message[1]}`;
    };

    window.generateReminders = () => {
        if (!a.reminderList) return;
        
        const currentDate = new Date();
        const reminders = [];
        
        state.customers.forEach((customer, index) => {
            if (customer.credit <= 0) return; // Skip customers with no pending credit
            
            const lastReminderDate = customer.lastReminderDate ? new Date(customer.lastReminderDate) : null;
            const daysSinceReminder = lastReminderDate 
                ? Math.floor((currentDate - lastReminderDate) / (1000 * 60 * 60 * 24))
                : Infinity; // Never reminded, so always eligible
            
            // Send reminder if 21 days have passed or never reminded
            if (daysSinceReminder >= 21) {
                // Determine language preference (can be enhanced later)
                const language = 'en'; // Default to English, can be made configurable
                const message = generateReminderMessage(customer, customer.credit, language);
                
                reminders.push({
                    customer: customer,
                    customerIndex: index,
                    amount: customer.credit,
                    message: message,
                    daysSinceReminder: daysSinceReminder === Infinity ? 'Never' : daysSinceReminder,
                    lastReminderDate: lastReminderDate
                });
            }
        });
        
        if (reminders.length === 0) {
            a.reminderList.innerHTML = '<p style="text-align: center; color: #666;">No reminders needed at this time. All customers with pending credit have been reminded recently.</p>';
            return;
        }
        
        a.reminderList.innerHTML = '';
        reminders.forEach(reminder => {
            const reminderElement = document.createElement('div');
            reminderElement.className = 'credit-history-entry credit-added';
            reminderElement.style.marginBottom = '15px';
            reminderElement.style.padding = '15px';
            reminderElement.style.border = '1px solid #ddd';
            reminderElement.style.borderRadius = '8px';
            reminderElement.style.backgroundColor = '#fff9e6';
            
            const billInfo = reminder.customer.creditBills && reminder.customer.creditBills.length > 0
                ? `<p style="font-size: 12px; color: #666; margin-top: 5px;"><strong>Bills:</strong> ${reminder.customer.creditBills.map(b => `Bill #${b.billNumber}`).join(', ')}</p>`
                : '';
            
            reminderElement.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>${reminder.customer.name}</strong>
                    <p style="font-size: 12px; color: #666;">Phone: ${reminder.customer.phone}</p>
                    <p style="font-size: 12px; color: #666;">Pending: ${formatCurrency(reminder.amount)}</p>
                    ${billInfo}
                    <p style="font-size: 11px; color: #888;">Days since last reminder: ${reminder.daysSinceReminder}</p>
                </div>
                <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong style="font-size: 12px;">Reminder Message:</strong>
                    <p style="white-space: pre-wrap; font-size: 13px; margin-top: 5px;">${reminder.message}</p>
                </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn btn-success btn-small" onclick="sendReminder(${reminder.customerIndex})" style="flex: 1;">📱 Send via WhatsApp</button>
                        <button class="btn btn-secondary btn-small" onclick="copyReminderMessage(${reminder.customerIndex})" style="flex: 1;">📋 Copy Message</button>
                    </div>
            `;
            a.reminderList.appendChild(reminderElement);
        });
    };

    window.sendReminder = (customerIndex) => {
        const customer = state.customers[customerIndex];
        if (!customer) return;
        
        if (!customer.phone) {
            showNotification(`No phone number available for ${customer.name}.`, 'error');
            return;
        }
        
        const language = 'en';
        const message = generateReminderMessage(customer, customer.credit, language);
        const phoneNumber = customer.phone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        
        // Open WhatsApp with the reminder message
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        // Update last reminder date
        customer.lastReminderDate = new Date().toISOString();
        saveState();
        showNotification(`WhatsApp reminder sent to ${customer.name}!`, 'success');
        generateReminders(); // Refresh the list
    };

    // Auto-send reminders function - checks and sends automatically
    window.autoSendReminders = () => {
        const currentDate = new Date();
        let remindersSent = 0;
        
        state.customers.forEach((customer) => {
            if (customer.credit <= 0 || !customer.phone) return; // Skip customers with no pending credit or no phone
            
            const lastReminderDate = customer.lastReminderDate ? new Date(customer.lastReminderDate) : null;
            const daysSinceReminder = lastReminderDate 
                ? Math.floor((currentDate - lastReminderDate) / (1000 * 60 * 60 * 24))
                : Infinity; // Never reminded, so always eligible
            
            // Auto-send reminder if 21 days have passed
            if (daysSinceReminder >= 21) {
                const language = 'en';
                const message = generateReminderMessage(customer, customer.credit, language);
                const phoneNumber = customer.phone.replace(/[^0-9]/g, '');
                
                // Open WhatsApp with the reminder message
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                
                // Use setTimeout to stagger the WhatsApp opens (avoid popup blocker issues)
                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                }, remindersSent * 500); // Stagger by 500ms
                
                // Update last reminder date
                customer.lastReminderDate = currentDate.toISOString();
                remindersSent++;
            }
        });
        
        if (remindersSent > 0) {
            saveState();
            showNotification(`Auto-sent ${remindersSent} reminder(s) via WhatsApp!`, 'success');
            // Refresh reminders list after a short delay
            setTimeout(() => {
                if (a.reminderList && a.reminderList.parentElement) {
                    generateReminders();
                }
            }, 1000);
        }
    };

    window.copyReminderMessage = (customerIndex) => {
        const customer = state.customers[customerIndex];
        if (!customer) return;
        
        const language = 'en';
        const message = generateReminderMessage(customer, customer.credit, language);
        
        // Copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            showNotification('Reminder message copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = message;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Reminder message copied to clipboard!', 'success');
        });
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

    window.onCreditCustomerChange = () => {
        updateCreditStatusCard();
        loadCreditBills();
    };

    const loadCreditBills = () => {
        if (!a.creditBill) return;
        a.creditBill.innerHTML = '<option value="">Select a bill (optional)...</option>';
        
        // Show all saved bills (completed bills) as options for reference
        state.bills.forEach((bill, index) => {
            const billDate = bill.date ? new Date(bill.date).toLocaleDateString() : 'Unknown date';
            const customerName = bill.customer?.name || bill.customer?.phone || 'Walk-in Customer';
            const billTotal = bill.total - (bill.discountAmount || 0);
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Bill #${state.bills.length - index} - ${customerName} - ${formatCurrency(billTotal)} - ${billDate}`;
            a.creditBill.appendChild(option);
        });
    };

    window.addCredit = () => {
        const customerIndex = a.creditCustomer.value;
        
        if (customerIndex === "") {
            showNotification('Please select a customer.', 'error');
            return;
        }

        // Amount is mandatory
        const amount = parseFloat(a.creditAmount.value);
        if (isNaN(amount) || amount <= 0) {
            showNotification('Please enter a valid amount.', 'error');
            return;
        }

        const customer = state.customers[customerIndex];
        let billReference = null;

        // Bill selection is optional - for reference only
        const billIndex = a.creditBill.value;
        if (billIndex !== "") {
            const bill = state.bills[billIndex];
            // Generate billId if it doesn't exist (for legacy bills)
            if (!bill.billId) {
                bill.billId = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            billReference = {
                billId: bill.billId,
                billNumber: state.bills.length - billIndex,
                date: bill.date,
                amount: amount, // Use the entered amount, not bill total
                items: bill.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', '),
                isReference: true // Mark as reference bill
            };
        }

        customer.credit += amount;
        if (billReference) {
            if (!customer.creditBills) customer.creditBills = [];
            customer.creditBills.push(billReference);
        }
        
        logCreditTransaction('add', customer, amount, billReference);
        saveState();
        renderCustomerList();
        renderAnalytics();
        renderCreditHistory();
        updateCreditStatusCard();
        
        const message = billReference 
            ? `${formatCurrency(amount)} added to credit for ${customer.name} (Reference: Bill #${billReference.billNumber}).`
            : `${formatCurrency(amount)} added to credit for ${customer.name}.`;
        showNotification(message, 'success');
        
        if (a.creditAmount) a.creditAmount.value = '';
        if (a.creditBill) a.creditBill.value = '';
        loadCreditBills(); // Reload bills
    };

    window.collectPayment = () => {
        // Password protection
        if (!verifyPassword('collect payment')) {
            return;
        }

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
        const remainingCredit = Math.max(0, priorCredit - amount);
        
        // Update credit bills - remove bills that are fully paid
        if (customer.creditBills && customer.creditBills.length > 0) {
            let remainingPayment = appliedAmount;
            customer.creditBills = customer.creditBills.filter(bill => {
                if (remainingPayment >= bill.amount) {
                    remainingPayment -= bill.amount;
                    return false; // Bill is fully paid, remove it
                } else {
                    bill.amount -= remainingPayment;
                    remainingPayment = 0;
                    return true; // Bill partially paid, keep it
                }
            });
        }
        
        customer.credit = remainingCredit;
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

    // --- CALENDAR FUNCTIONS ---
    let currentCalendarDate = new Date();

    // Festival data for Indian festivals (2024-2025)
    const festivalsData = {
        '2024': {
            '1': [{ day: 14, name: 'Makar Sankranti', type: 'major' }, { day: 26, name: 'Republic Day', type: 'national' }],
            '2': [{ day: 14, name: 'Valentine\'s Day', type: 'minor' }, { day: 19, name: 'Shivratri', type: 'major' }],
            '3': [{ day: 8, name: 'Holi', type: 'major' }, { day: 25, name: 'Holi', type: 'major' }, { day: 29, name: 'Good Friday', type: 'minor' }, { day: 31, name: 'Easter', type: 'minor' }],
            '4': [{ day: 9, name: 'Ugadi', type: 'major' }, { day: 11, name: 'Ram Navami', type: 'major' }, { day: 14, name: 'Ambedkar Jayanti', type: 'national' }, { day: 17, name: 'Ramzan/Eid-ul-Fitr', type: 'major' }],
            '5': [{ day: 1, name: 'Labour Day', type: 'national' }, { day: 23, name: 'Buddha Purnima', type: 'major' }],
            '6': [{ day: 17, name: 'Eid-ul-Adha', type: 'major' }],
            '7': [{ day: 17, name: 'Muharram', type: 'major' }],
            '8': [{ day: 15, name: 'Independence Day', type: 'national' }, { day: 19, name: 'Raksha Bandhan', type: 'major' }, { day: 26, name: 'Janmashtami', type: 'major' }],
            '9': [{ day: 7, name: 'Ganesh Chaturthi', type: 'major' }, { day: 17, name: 'Onam', type: 'major' }],
            '10': [{ day: 2, name: 'Gandhi Jayanti', type: 'national' }, { day: 3, name: 'Dussehra', type: 'major' }, { day: 12, name: 'Karva Chauth', type: 'major' }, { day: 17, name: 'Diwali', type: 'major' }, { day: 18, name: 'Govardhan Puja', type: 'major' }, { day: 19, name: 'Bhai Dooj', type: 'major' }],
            '11': [{ day: 1, name: 'Chhath Puja', type: 'major' }, { day: 15, name: 'Children\'s Day', type: 'minor' }],
            '12': [{ day: 25, name: 'Christmas', type: 'major' }]
        },
        '2025': {
            '1': [{ day: 14, name: 'Makar Sankranti', type: 'major' }, { day: 26, name: 'Republic Day', type: 'national' }],
            '2': [{ day: 14, name: 'Valentine\'s Day', type: 'minor' }, { day: 8, name: 'Shivratri', type: 'major' }],
            '3': [{ day: 14, name: 'Holi', type: 'major' }, { day: 29, name: 'Ram Navami', type: 'major' }],
            '4': [{ day: 13, name: 'Eid-ul-Fitr', type: 'major' }, { day: 14, name: 'Ambedkar Jayanti', type: 'national' }, { day: 21, name: 'Ram Navami', type: 'major' }],
            '5': [{ day: 1, name: 'Labour Day', type: 'national' }, { day: 12, name: 'Buddha Purnima', type: 'major' }],
            '6': [{ day: 6, name: 'Eid-ul-Adha', type: 'major' }],
            '7': [{ day: 7, name: 'Muharram', type: 'major' }],
            '8': [{ day: 3, name: 'Raksha Bandhan', type: 'major' }, { day: 15, name: 'Independence Day', type: 'national' }, { day: 15, name: 'Janmashtami', type: 'major' }],
            '9': [{ day: 26, name: 'Ganesh Chaturthi', type: 'major' }, { day: 6, name: 'Onam', type: 'major' }],
            '10': [{ day: 2, name: 'Gandhi Jayanti', type: 'national' }, { day: 22, name: 'Dussehra', type: 'major' }, { day: 1, name: 'Karva Chauth', type: 'major' }, { day: 6, name: 'Diwali', type: 'major' }, { day: 7, name: 'Govardhan Puja', type: 'major' }, { day: 8, name: 'Bhai Dooj', type: 'major' }],
            '11': [{ day: 20, name: 'Chhath Puja', type: 'major' }, { day: 15, name: 'Children\'s Day', type: 'minor' }],
            '12': [{ day: 25, name: 'Christmas', type: 'major' }]
        },
        '2026': {
            '1': [{ day: 14, name: 'Makar Sankranti', type: 'major' }, { day: 26, name: 'Republic Day', type: 'national' }],
            '2': [{ day: 14, name: 'Valentine\'s Day', type: 'minor' }, { day: 27, name: 'Shivratri', type: 'major' }],
            '3': [{ day: 3, name: 'Holi', type: 'major' }, { day: 18, name: 'Ram Navami', type: 'major' }],
            '4': [{ day: 2, name: 'Eid-ul-Fitr', type: 'major' }, { day: 14, name: 'Ambedkar Jayanti', type: 'national' }, { day: 10, name: 'Ram Navami', type: 'major' }],
            '5': [{ day: 1, name: 'Labour Day', type: 'national' }, { day: 1, name: 'Buddha Purnima', type: 'major' }],
            '6': [{ day: 26, name: 'Eid-ul-Adha', type: 'major' }],
            '7': [{ day: 27, name: 'Muharram', type: 'major' }],
            '8': [{ day: 22, name: 'Raksha Bandhan', type: 'major' }, { day: 15, name: 'Independence Day', type: 'national' }, { day: 3, name: 'Janmashtami', type: 'major' }],
            '9': [{ day: 15, name: 'Ganesh Chaturthi', type: 'major' }, { day: 25, name: 'Onam', type: 'major' }],
            '10': [{ day: 2, name: 'Gandhi Jayanti', type: 'national' }, { day: 11, name: 'Dussehra', type: 'major' }, { day: 20, name: 'Karva Chauth', type: 'major' }, { day: 25, name: 'Diwali', type: 'major' }, { day: 26, name: 'Govardhan Puja', type: 'major' }, { day: 27, name: 'Bhai Dooj', type: 'major' }],
            '11': [{ day: 8, name: 'Chhath Puja', type: 'major' }, { day: 15, name: 'Children\'s Day', type: 'minor' }],
            '12': [{ day: 25, name: 'Christmas', type: 'major' }]
        },
        '2027': {
            '1': [{ day: 14, name: 'Makar Sankranti', type: 'major' }, { day: 26, name: 'Republic Day', type: 'national' }],
            '2': [{ day: 14, name: 'Valentine\'s Day', type: 'minor' }, { day: 16, name: 'Shivratri', type: 'major' }],
            '3': [{ day: 22, name: 'Holi', type: 'major' }, { day: 7, name: 'Ram Navami', type: 'major' }],
            '4': [{ day: 22, name: 'Eid-ul-Fitr', type: 'major' }, { day: 14, name: 'Ambedkar Jayanti', type: 'national' }, { day: 30, name: 'Ram Navami', type: 'major' }],
            '5': [{ day: 1, name: 'Labour Day', type: 'national' }, { day: 20, name: 'Buddha Purnima', type: 'major' }],
            '6': [{ day: 16, name: 'Eid-ul-Adha', type: 'major' }],
            '7': [{ day: 16, name: 'Muharram', type: 'major' }],
            '8': [{ day: 11, name: 'Raksha Bandhan', type: 'major' }, { day: 15, name: 'Independence Day', type: 'national' }, { day: 23, name: 'Janmashtami', type: 'major' }],
            '9': [{ day: 4, name: 'Ganesh Chaturthi', type: 'major' }, { day: 14, name: 'Onam', type: 'major' }],
            '10': [{ day: 2, name: 'Gandhi Jayanti', type: 'national' }, { day: 1, name: 'Dussehra', type: 'major' }, { day: 9, name: 'Karva Chauth', type: 'major' }, { day: 14, name: 'Diwali', type: 'major' }, { day: 15, name: 'Govardhan Puja', type: 'major' }, { day: 16, name: 'Bhai Dooj', type: 'major' }],
            '11': [{ day: 28, name: 'Chhath Puja', type: 'major' }, { day: 15, name: 'Children\'s Day', type: 'minor' }],
            '12': [{ day: 25, name: 'Christmas', type: 'major' }]
        },
        '2028': {
            '1': [{ day: 14, name: 'Makar Sankranti', type: 'major' }, { day: 26, name: 'Republic Day', type: 'national' }],
            '2': [{ day: 14, name: 'Valentine\'s Day', type: 'minor' }, { day: 5, name: 'Shivratri', type: 'major' }],
            '3': [{ day: 11, name: 'Holi', type: 'major' }, { day: 26, name: 'Ram Navami', type: 'major' }],
            '4': [{ day: 10, name: 'Eid-ul-Fitr', type: 'major' }, { day: 14, name: 'Ambedkar Jayanti', type: 'national' }, { day: 18, name: 'Ram Navami', type: 'major' }],
            '5': [{ day: 1, name: 'Labour Day', type: 'national' }, { day: 9, name: 'Buddha Purnima', type: 'major' }],
            '6': [{ day: 5, name: 'Eid-ul-Adha', type: 'major' }],
            '7': [{ day: 5, name: 'Muharram', type: 'major' }],
            '8': [{ day: 30, name: 'Raksha Bandhan', type: 'major' }, { day: 15, name: 'Independence Day', type: 'national' }, { day: 11, name: 'Janmashtami', type: 'major' }],
            '9': [{ day: 22, name: 'Ganesh Chaturthi', type: 'major' }, { day: 2, name: 'Onam', type: 'major' }],
            '10': [{ day: 2, name: 'Gandhi Jayanti', type: 'national' }, { day: 19, name: 'Dussehra', type: 'major' }, { day: 28, name: 'Karva Chauth', type: 'major' }, { day: 3, name: 'Diwali', type: 'major' }, { day: 4, name: 'Govardhan Puja', type: 'major' }, { day: 5, name: 'Bhai Dooj', type: 'major' }],
            '11': [{ day: 16, name: 'Chhath Puja', type: 'major' }, { day: 15, name: 'Children\'s Day', type: 'minor' }],
            '12': [{ day: 25, name: 'Christmas', type: 'major' }]
        },
        '2029': {
            '1': [{ day: 14, name: 'Makar Sankranti', type: 'major' }, { day: 26, name: 'Republic Day', type: 'national' }],
            '2': [{ day: 14, name: 'Valentine\'s Day', type: 'minor' }, { day: 23, name: 'Shivratri', type: 'major' }],
            '3': [{ day: 1, name: 'Holi', type: 'major' }, { day: 15, name: 'Ram Navami', type: 'major' }],
            '4': [{ day: 30, name: 'Eid-ul-Fitr', type: 'major' }, { day: 14, name: 'Ambedkar Jayanti', type: 'national' }, { day: 7, name: 'Ram Navami', type: 'major' }],
            '5': [{ day: 1, name: 'Labour Day', type: 'national' }, { day: 28, name: 'Buddha Purnima', type: 'major' }],
            '6': [{ day: 25, name: 'Eid-ul-Adha', type: 'major' }],
            '7': [{ day: 25, name: 'Muharram', type: 'major' }],
            '8': [{ day: 19, name: 'Raksha Bandhan', type: 'major' }, { day: 15, name: 'Independence Day', type: 'national' }, { day: 31, name: 'Janmashtami', type: 'major' }],
            '9': [{ day: 12, name: 'Ganesh Chaturthi', type: 'major' }, { day: 22, name: 'Onam', type: 'major' }],
            '10': [{ day: 2, name: 'Gandhi Jayanti', type: 'national' }, { day: 8, name: 'Dussehra', type: 'major' }, { day: 17, name: 'Karva Chauth', type: 'major' }, { day: 22, name: 'Diwali', type: 'major' }, { day: 23, name: 'Govardhan Puja', type: 'major' }, { day: 24, name: 'Bhai Dooj', type: 'major' }],
            '11': [{ day: 5, name: 'Chhath Puja', type: 'major' }, { day: 15, name: 'Children\'s Day', type: 'minor' }],
            '12': [{ day: 25, name: 'Christmas', type: 'major' }]
        },
        '2030': {
            '1': [{ day: 14, name: 'Makar Sankranti', type: 'major' }, { day: 26, name: 'Republic Day', type: 'national' }],
            '2': [{ day: 14, name: 'Valentine\'s Day', type: 'minor' }, { day: 12, name: 'Shivratri', type: 'major' }],
            '3': [{ day: 20, name: 'Holi', type: 'major' }, { day: 4, name: 'Ram Navami', type: 'major' }],
            '4': [{ day: 19, name: 'Eid-ul-Fitr', type: 'major' }, { day: 14, name: 'Ambedkar Jayanti', type: 'national' }, { day: 27, name: 'Ram Navami', type: 'major' }],
            '5': [{ day: 1, name: 'Labour Day', type: 'national' }, { day: 17, name: 'Buddha Purnima', type: 'major' }],
            '6': [{ day: 14, name: 'Eid-ul-Adha', type: 'major' }],
            '7': [{ day: 14, name: 'Muharram', type: 'major' }],
            '8': [{ day: 8, name: 'Raksha Bandhan', type: 'major' }, { day: 15, name: 'Independence Day', type: 'national' }, { day: 20, name: 'Janmashtami', type: 'major' }],
            '9': [{ day: 1, name: 'Ganesh Chaturthi', type: 'major' }, { day: 11, name: 'Onam', type: 'major' }],
            '10': [{ day: 2, name: 'Gandhi Jayanti', type: 'national' }, { day: 27, name: 'Dussehra', type: 'major' }, { day: 6, name: 'Karva Chauth', type: 'major' }, { day: 11, name: 'Diwali', type: 'major' }, { day: 12, name: 'Govardhan Puja', type: 'major' }, { day: 13, name: 'Bhai Dooj', type: 'major' }],
            '11': [{ day: 24, name: 'Chhath Puja', type: 'major' }, { day: 15, name: 'Children\'s Day', type: 'minor' }],
            '12': [{ day: 25, name: 'Christmas', type: 'major' }]
        }
    };

    const getFestivalsForDate = (year, month, day) => {
        const yearStr = year.toString();
        const monthStr = month.toString();
        const yearFestivals = festivalsData[yearStr];
        if (!yearFestivals) {
            // If year not found, try to get festivals from a base year pattern
            // Use modulo to cycle through available years for future dates
            const baseYear = year >= 2024 && year <= 2030 ? yearStr : 
                           year > 2030 ? '2030' : 
                           year < 2024 ? '2024' : yearStr;
            const baseFestivals = festivalsData[baseYear];
            if (!baseFestivals) return [];
            const monthFestivals = baseFestivals[monthStr];
            if (!monthFestivals) return [];
            return monthFestivals.filter(f => f.day === day);
        }
        const monthFestivals = yearFestivals[monthStr];
        if (!monthFestivals) return [];
        return monthFestivals.filter(f => f.day === day);
    };

    const renderCalendar = () => {
        if (!a.calendarContainer) return;

        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const today = new Date();
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        a.calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Calendar HTML with mobile responsiveness
        let calendarHtml = `
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; font-size: clamp(10px, 2vw, 14px);">
                <thead>
                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <th style="padding: clamp(8px, 2vw, 15px); text-align: center; font-weight: bold; font-size: clamp(10px, 2vw, 14px);">Sun</th>
                        <th style="padding: clamp(8px, 2vw, 15px); text-align: center; font-weight: bold; font-size: clamp(10px, 2vw, 14px);">Mon</th>
                        <th style="padding: clamp(8px, 2vw, 15px); text-align: center; font-weight: bold; font-size: clamp(10px, 2vw, 14px);">Tue</th>
                        <th style="padding: clamp(8px, 2vw, 15px); text-align: center; font-weight: bold; font-size: clamp(10px, 2vw, 14px);">Wed</th>
                        <th style="padding: clamp(8px, 2vw, 15px); text-align: center; font-weight: bold; font-size: clamp(10px, 2vw, 14px);">Thu</th>
                        <th style="padding: clamp(8px, 2vw, 15px); text-align: center; font-weight: bold; font-size: clamp(10px, 2vw, 14px);">Fri</th>
                        <th style="padding: clamp(8px, 2vw, 15px); text-align: center; font-weight: bold; font-size: clamp(10px, 2vw, 14px);">Sat</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let currentDay = 1;
        let isFirstWeek = true;

        // Generate calendar rows
        while (currentDay <= daysInMonth) {
            calendarHtml += '<tr>';
            for (let i = 0; i < 7; i++) {
                if (isFirstWeek && i < startingDayOfWeek) {
                    calendarHtml += '<td style="padding: clamp(5px, 1.5vw, 10px); text-align: center; height: clamp(60px, 12vw, 80px); border: 1px solid #e0e0e0; min-height: 60px;"></td>';
                } else if (currentDay > daysInMonth) {
                    calendarHtml += '<td style="padding: clamp(5px, 1.5vw, 10px); text-align: center; height: clamp(60px, 12vw, 80px); border: 1px solid #e0e0e0; min-height: 60px;"></td>';
                } else {
                    const festivals = getFestivalsForDate(year, month + 1, currentDay);
                    const isToday = isCurrentMonth && currentDay === today.getDate();
                    const hasFestival = festivals.length > 0;
                    const majorFestival = festivals.find(f => f.type === 'major');
                    const nationalFestival = festivals.find(f => f.type === 'national');

                    let cellStyle = 'padding: clamp(5px, 1.5vw, 10px); text-align: center; height: clamp(60px, 12vw, 80px); border: 1px solid #e0e0e0; vertical-align: top; min-height: 60px;';
                    let cellBg = '';
                    
                    if (isToday) {
                        cellBg = 'background: linear-gradient(135deg, #e3f2fd, #bbdefb);';
                    } else if (majorFestival) {
                        cellBg = 'background: linear-gradient(135deg, #fff3e0, #ffe0b2);';
                    } else if (nationalFestival) {
                        cellBg = 'background: linear-gradient(135deg, #e8f5e9, #c8e6c9);';
                    } else if (hasFestival) {
                        cellBg = 'background: #f5f5f5;';
                    }

                    // Make cell clickable if it has festivals
                    const clickHandler = hasFestival ? `onclick="showFestivalDetails(${year}, ${month + 1}, ${currentDay})"` : '';
                    const cursorStyle = hasFestival ? 'cursor: pointer;' : '';
                    calendarHtml += `<td style="${cellStyle} ${cellBg} ${cursorStyle}" ${clickHandler}>`;
                    calendarHtml += `<div style="font-weight: ${isToday ? 'bold' : 'normal'}; font-size: clamp(12px, 2.5vw, 16px); color: ${isToday ? '#1976d2' : '#333'}; margin-bottom: 3px;">${currentDay}</div>`;
                    
                    if (hasFestival) {
                        festivals.forEach(festival => {
                            const festivalColor = festival.type === 'major' ? '#f57c00' : festival.type === 'national' ? '#2e7d32' : '#666';
                            const festivalEmoji = festival.type === 'major' ? '🎉' : festival.type === 'national' ? '🇮🇳' : '📅';
                            calendarHtml += `<div style="font-size: clamp(8px, 1.5vw, 10px); color: ${festivalColor}; margin: 1px 0; font-weight: bold; line-height: 1.2; overflow: hidden; text-overflow: ellipsis;" title="${festival.name}">${festivalEmoji} ${festival.name}</div>`;
                        });
                    }
                    
                    calendarHtml += '</td>';
                    currentDay++;
                }
            }
            calendarHtml += '</tr>';
            isFirstWeek = false;
        }

        calendarHtml += '</tbody></table>';
        a.calendarContainer.innerHTML = calendarHtml;

        // Render upcoming festivals
        renderUpcomingFestivals();
    };

    const renderUpcomingFestivals = () => {
        if (!a.upcomingFestivals) return;

        const today = new Date();
        const next30Days = [];
        const festivalsList = [];

        // Get festivals for next 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            
            const festivals = getFestivalsForDate(year, month, day);
            if (festivals.length > 0) {
                festivals.forEach(festival => {
                    festivalsList.push({
                        date: new Date(year, month - 1, day),
                        name: festival.name,
                        type: festival.type,
                        daysFromNow: i
                    });
                });
            }
        }

        if (festivalsList.length === 0) {
            a.upcomingFestivals.innerHTML = '<p style="text-align: center; color: #666;">No festivals in the next 30 days.</p>';
            return;
        }

        let festivalsHtml = '<div style="display: grid; gap: 10px;">';
        festivalsList.forEach(festival => {
            const dateStr = festival.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const typeColor = festival.type === 'major' ? '#f57c00' : festival.type === 'national' ? '#2e7d32' : '#666';
            const typeBg = festival.type === 'major' ? '#fff3e0' : festival.type === 'national' ? '#e8f5e9' : '#f5f5f5';
            const emoji = festival.type === 'major' ? '🎉' : festival.type === 'national' ? '🇮🇳' : '📅';
            
            festivalsHtml += `
                <div style="padding: 12px; background: ${typeBg}; border-radius: 8px; border-left: 4px solid ${typeColor}; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: ${typeColor}; font-size: 14px;">${emoji} ${festival.name}</strong>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${dateStr}</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 12px; color: #666;">${festival.daysFromNow === 0 ? 'Today' : festival.daysFromNow === 1 ? 'Tomorrow' : `In ${festival.daysFromNow} days`}</span>
                    </div>
                </div>
            `;
        });
        festivalsHtml += '</div>';
        a.upcomingFestivals.innerHTML = festivalsHtml;
    };

    window.previousMonth = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    };

    window.nextMonth = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    };

    window.goToToday = () => {
        currentCalendarDate = new Date();
        renderCalendar();
    };

    window.showFestivalDetails = (year, month, day) => {
        const festivals = getFestivalsForDate(year, month, day);
        if (festivals.length === 0) return;

        const festivalModal = document.getElementById('festivalModal');
        const festivalModalHeader = document.getElementById('festivalModalHeader');
        const festivalModalTitle = document.getElementById('festivalModalTitle');
        const festivalModalBody = document.getElementById('festivalModalBody');

        if (!festivalModal) return;

        const dateStr = new Date(year, month - 1, day).toLocaleDateString('en-IN', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });

        // Determine background theme based on festival type
        let headerBg = 'linear-gradient(135deg, #667eea, #764ba2)'; // Default
        let bodyBg = '#ffffff';
        
        const majorFestival = festivals.find(f => f.type === 'major');
        const nationalFestival = festivals.find(f => f.type === 'national');
        
        if (majorFestival) {
            headerBg = 'linear-gradient(135deg, #ff9800, #f57c00)';
            bodyBg = 'linear-gradient(135deg, #fff3e0, #ffe0b2)';
        } else if (nationalFestival) {
            headerBg = 'linear-gradient(135deg, #4caf50, #2e7d32)';
            bodyBg = 'linear-gradient(135deg, #e8f5e9, #c8e6c9)';
        }

        festivalModalHeader.style.background = headerBg;
        festivalModalBody.style.background = bodyBg;

        let festivalsHtml = `<h2 style="margin-bottom: 20px; color: #333;">${dateStr}</h2>`;
        
        festivals.forEach(festival => {
            const emoji = festival.type === 'major' ? '🎉' : festival.type === 'national' ? '🇮🇳' : '📅';
            const typeText = festival.type === 'major' ? 'Major Festival' : festival.type === 'national' ? 'National Holiday' : 'Special Day';
            const typeColor = festival.type === 'major' ? '#f57c00' : festival.type === 'national' ? '#2e7d32' : '#666';
            
            festivalsHtml += `
                <div style="background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 15px; margin-bottom: 15px; border-left: 5px solid ${typeColor}; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
                    <h3 style="color: ${typeColor}; margin-bottom: 10px; font-size: 24px;">${festival.name}</h3>
                    <p style="color: #666; font-weight: 600;">${typeText}</p>
                </div>
            `;
        });

        festivalModalBody.innerHTML = festivalsHtml;
        festivalModalTitle.textContent = `${festivals.length > 1 ? 'Festivals' : 'Festival'} on ${day}`;
        festivalModal.style.display = 'flex';
    };

    window.closeFestivalModal = () => {
        const festivalModal = document.getElementById('festivalModal');
        if (festivalModal) {
            festivalModal.style.display = 'none';
        }
    };

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        const festivalModal = document.getElementById('festivalModal');
        if (festivalModal && e.target === festivalModal) {
            closeFestivalModal();
        }
    });

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
        // Password protection for settings changes
        if (!verifyPassword('save settings')) {
            return;
        }

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
        // Password protection
        if (!verifyPassword('factory reset')) {
            return;
        }

        if (confirm('ARE YOU ABSOLUTELY SURE? This will delete all your data permanently. This action cannot be undone.')) {
            if (prompt('To confirm, please type "DELETE" in all caps.') === 'DELETE') {
                localStorage.removeItem('kiranaProState');
                location.reload();
            } else {
                showNotification('Reset cancelled. Incorrect confirmation.', 'info');
            }
        }
    };

    window.exportData = () => {
        // Password protection
        if (!verifyPassword('export data')) {
            return;
        }

        // Create a data object with all state
        const exportDataObj = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                inventory: state.inventory,
                customers: state.customers,
                bills: state.bills,
                expenses: state.expenses,
                creditTransactions: state.creditTransactions,
                settings: state.settings
            }
        };

        // Convert to JSON string
        const dataStr = JSON.stringify(exportDataObj, null, 2);
        
        // Create a blob and download
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kirana-shop-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully! You can now transfer this file to another device.', 'success');
    };

    // Initialize import file input handler on page load
    const initImportFileInput = () => {
        const importInput = document.getElementById('importFileInput');
        if (importInput) {
            importInput.addEventListener('change', function (e) {
                const file = e.target.files[0];

                // Reset input value to allow selecting same file again
                e.target.value = '';

                if (!file) {
                    // User cancelled
                    return;
                }

                // Validate file type
                if (!file.name.toLowerCase().endsWith('.json')) {
                    showNotification('Please select a valid JSON file.', 'error');
                    return;
                }

                const reader = new FileReader();

                reader.onload = (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);

                        // Validate the imported data structure
                        if (!importedData.data) {
                            showNotification('Invalid data file format. Please ensure the file was exported from this application.', 'error');
                            return;
                        }

                        // Confirm before importing
                        if (confirm('Importing data will replace all current data. Are you sure you want to continue?')) {
                            // Backup current state
                            const backup = JSON.stringify(state);

                            try {
                                // Import the data
                                if (importedData.data.inventory) state.inventory = importedData.data.inventory;
                                if (importedData.data.customers) state.customers = importedData.data.customers;
                                if (importedData.data.bills) state.bills = importedData.data.bills;
                                if (importedData.data.expenses) state.expenses = importedData.data.expenses;
                                if (importedData.data.creditTransactions) state.creditTransactions = importedData.data.creditTransactions;
                                if (importedData.data.settings) {
                                    state.settings = {
                                        shopName: importedData.data.settings.shopName || state.settings.shopName,
                                        shopAddress: importedData.data.settings.shopAddress || state.settings.shopAddress,
                                        shopContact: importedData.data.settings.shopContact || state.settings.shopContact,
                                        upiId: importedData.data.settings.upiId || state.settings.upiId,
                                        gstNumber: importedData.data.settings.gstNumber || state.settings.gstNumber,
                                        password: importedData.data.settings.password || state.settings.password
                                    };
                                }

                                // Reset current bill on import
                                state.currentBill = {
                                    items: [],
                                    customer: { name: '', phone: '' },
                                    total: 0,
                                    discountAmount: 0,
                                    paymentMethod: 'cash',
                                    paymentDetails: null,
                                    isSaved: false
                                };

                                // Initialize customer properties
                                state.customers.forEach(customer => {
                                    if (!customer.creditBills) customer.creditBills = [];
                                    if (!customer.lastReminderDate) customer.lastReminderDate = null;
                                    if (!customer.loyaltyPoints) customer.loyaltyPoints = 0;
                                });

                                // Save to localStorage
                                saveState();

                                // Refresh all views
                                renderSettings();
                                renderInventory();
                                renderCustomerList();
                                renderAnalytics();
                                renderExpenses();
                                renderCreditHistory();
                                updateBill();
                                updateCreditStatusCard();

                                // Update header
                                const headerElement = document.querySelector('.header h1');
                                if (headerElement) {
                                    headerElement.textContent = `🏪 ${state.settings.shopName}`;
                                }

                                showNotification('Data imported successfully!', 'success');
                            } catch (error) {
                                // Restore backup on error
                                try {
                                    state = JSON.parse(backup);
                                } catch (parseError) {
                                    console.error('Failed to restore backup:', parseError);
                                }
                                showNotification('Error importing data. Operation cancelled.', 'error');
                                console.error('Import error:', error);
                            }
                        }
                    } catch (error) {
                        showNotification('Error reading file. Please check the file format.', 'error');
                        console.error('File read error:', error);
                    }
                };

                reader.onerror = () => {
                    showNotification('Error reading file. Please try again.', 'error');
                };

                reader.readAsText(file);
            });
        }
    };

    window.importData = () => {
        // Get the file input
        const importInput = document.getElementById('importFileInput');
        const hiddenTrigger = document.getElementById('hiddenFileTrigger');
        
        if (!importInput) {
            showNotification('Import feature not available. Please refresh the page.', 'error');
            return;
        }

        // Reset value to allow selecting same file again
        importInput.value = '';

        // Try clicking the hidden button first (it has onclick handler)
        // This maintains user interaction better than direct input.click()
        if (hiddenTrigger) {
            try {
                hiddenTrigger.click();
                return;
            } catch (err) {
                console.log('Hidden trigger failed, trying direct input click');
            }
        }

        // Fallback: try direct input click
        try {
            importInput.click();
        } catch (err) {
            console.error('Error triggering file input:', err);
            showNotification('Unable to open file dialog. Please refresh the page and try again.', 'error');
        }
    };

    window.changePassword = () => {
        // First verify current password
        if (!state.settings.password) {
            // No password set, set new one
            const newPassword = promptPassword('Set new password:');
            if (!newPassword || newPassword.trim() === '') {
                showNotification('Password cannot be empty.', 'error');
                return;
            }
            const confirmPassword = promptPassword('Confirm password:');
            if (newPassword !== confirmPassword) {
                showNotification('Passwords do not match. Please try again.', 'error');
                return;
            }
            state.settings.password = newPassword.trim();
            saveState();
            showNotification('Password set successfully!', 'success');
        } else {
            // Verify current password first
            const currentPassword = promptPassword('Enter current password:');
            if (currentPassword.trim() !== state.settings.password) {
                showNotification('Incorrect current password. Password change cancelled.', 'error');
                return;
            }
            // Get new password
            const newPassword = promptPassword('Enter new password:');
            if (!newPassword || newPassword.trim() === '') {
                showNotification('Password cannot be empty.', 'error');
                return;
            }
            const confirmPassword = promptPassword('Confirm new password:');
            if (newPassword !== confirmPassword) {
                showNotification('Passwords do not match. Please try again.', 'error');
                return;
            }
            state.settings.password = newPassword.trim();
            saveState();
            showNotification('Password changed successfully!', 'success');
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
        filterInventory(); // Will fallback to renderInventory if DOM not ready
        renderCustomerList();
        renderAnalytics();
        renderExpenses();
        renderCreditHistory();
        if (a.paymentMethod) {
            a.paymentMethod.value = state.currentBill.paymentMethod || 'cash';
        }
        updateBill();
        updateCreditStatusCard();
        initImportFileInput();
        
        // Auto-check for reminders on page load (but don't auto-send, just check)
        // User can manually click "Auto-Send All" if they want
        setTimeout(() => {
            if (state.customers && state.customers.length > 0) {
                const hasPendingReminders = state.customers.some(customer => {
                    if (customer.credit <= 0 || !customer.phone) return false;
                    const lastReminderDate = customer.lastReminderDate ? new Date(customer.lastReminderDate) : null;
                    const daysSinceReminder = lastReminderDate 
                        ? Math.floor((new Date() - lastReminderDate) / (1000 * 60 * 60 * 24))
                        : Infinity;
                    return daysSinceReminder >= 21;
                });
                if (hasPendingReminders) {
                    showNotification('💡 You have pending payment reminders! Check the Customers tab.', 'info');
                }
            }
        }, 2000);

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

