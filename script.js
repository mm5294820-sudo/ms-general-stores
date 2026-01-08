
function loadRecords() {
    const container = document.querySelector('.entry-data');
    if (!container) return;

    const records = JSON.parse(localStorage.getItem('storeRecords')) || [];
    container.innerHTML = ''; // Clear current list

    let totalAmount = 0;

    records.forEach((record, index) => {
        totalAmount += parseFloat(record.tAmount) || 0;
        const recordDiv = document.createElement('div');
        recordDiv.classList.add('input-record');

        recordDiv.innerHTML = `
            <div>
                <input type="text" value="${record.sno}" id="s-no" disabled>
            </div>
            <div>
                <input type="text" value="${record.productName}" id="Product-name" onchange="updateRecord(${index}, 'productName', this.value)">
            </div>
            <div>
                <input type="text" value="${record.invoiceNo}" id="invoice-no" disabled>
            </div>
            <div>
                <input type="number" value="${record.bPrice}" id="b-price" onchange="updateRecord(${index}, 'bPrice', this.value)">
            </div>
            <div>
                <input type="number" value="${record.qty}" id="qty" onchange="updateRecord(${index}, 'qty', this.value)">
            </div>
            <div>
                <input type="text" value="${record.sQty}" id="s-qty" disabled>
            </div>
            <div>
                <input type="text" value="${record.tQty}" id="t-qty" disabled>
            </div>
            <div>
                <input type="number" value="${record.sPrice}" id="s-price" onchange="updateRecord(${index}, 'sPrice', this.value)">
            </div>
            <div>
                <input type="text" value="${record.tAmount}" id="t-amount" disabled>
            </div>
            <div>
                <i class="fa-regular fa-circle-xmark" onclick="deleteRecord(${index})"></i>
            </div>
        `;
        container.appendChild(recordDiv);
    });

    const totalItemsInput = document.querySelector('.t-item');
    const totalAmountInput = document.querySelector('.amount');
    if (totalItemsInput) totalItemsInput.value = records.length;
    if (totalAmountInput) totalAmountInput.value = totalAmount;
}

function updateRecord(index, field, value) {
    let records = JSON.parse(localStorage.getItem('storeRecords')) || [];
    const recordToUpdate = records[index];

    if (recordToUpdate) {
        recordToUpdate[field] = value;

        if (field === 'qty' || field === 'bPrice') {
            const qtyNum = parseFloat(recordToUpdate.qty) || 0;
            const bPriceNum = parseFloat(recordToUpdate.bPrice) || 0;
            const sQtyNum = parseFloat(recordToUpdate.sQty) || 0;
            
            recordToUpdate.tAmount = qtyNum * bPriceNum;
            recordToUpdate.tQty = qtyNum - sQtyNum;
        }

        localStorage.setItem('storeRecords', JSON.stringify(records));
        loadRecords();
    }
}

function deleteRecord(index) {
    let records = JSON.parse(localStorage.getItem('storeRecords')) || [];
    records.splice(index, 1);
    records.forEach((record, i) => {
        record.sno = i + 1;
    });

    localStorage.setItem('storeRecords', JSON.stringify(records));
    loadRecords();
}

function addSalesRow(data = null) {
    const container = document.querySelector('.entry-datas');
    if (!container) return;

    const rowCount = container.querySelectorAll('.input-records').length + 1;
    const recordDiv = document.createElement('div');
    recordDiv.classList.add('input-records');

    const pName = data ? data.productName : '';
    const inv = data ? data.invoiceNo : '';
    const price = data ? data.price : '';
    const qty = data ? data.qty : '';
    const dis = data ? data.discount : '';
    const tAmount = data ? data.tAmount : '';

    recordDiv.innerHTML = `
        <div>
            <input type="text" value="${rowCount}" id="s-no" class="sales-sno" disabled>
        </div>
        <div style="position: relative;">
            <input type="text" placeholder="Product Name" id="Product-name" class="sales-product-name" value="${pName}" oninput="searchProducts(this)" onblur="hideSuggestions(this)" autocomplete="off">
            <div class="suggestions-card" style="position: absolute; top: 100%; left: 0; width: 100%; background: white; border: 1px solid #ccc; z-index: 100; display: none; max-height: 200px; overflow-y: auto; border-radius: 0 0 5px 5px;"></div>
        </div>
        <div style="position: relative;">
            <input type="text" placeholder="invoice no" id="invoice-no" class="sales-invoice-no" value="${inv}" oninput="searchInvoice(this)" onblur="hideSuggestions(this)" autocomplete="off">
            <div class="suggestions-card" style="position: absolute; top: 100%; left: 0; width: 100%; background: white; border: 1px solid #ccc; z-index: 100; display: none; max-height: 200px; overflow-y: auto; border-radius: 0 0 5px 5px;"></div>
        </div>
        <div>
            <input type="number" placeholder="price" id="s-price" class="sales-price" value="${price}" oninput="calculateSalesRow(this)" disabled>
        </div>
        <div>
            <input type="number" placeholder="qty" id="qty" class="sales-qty" value="${qty}" oninput="calculateSalesRow(this)">
        </div>
        <div>
            <input type="number" placeholder="Dis%" id="dis" class="sales-discount" value="${dis}" oninput="calculateSalesRow(this)">
        </div>
        <div>
            <input type="text" placeholder="T-amount" id="t-amount" class="sales-t-amount" value="${tAmount}" disabled>
        </div>
        <div>
            <i class="fa-regular fa-circle-xmark" onclick="deleteSalesRow(this)"></i>
        </div>
    `;
    container.appendChild(recordDiv);
    if (!data) saveSalesState();
}

function searchProducts(input) {
    const query = input.value.trim().toLowerCase();
    const row = input.closest('.input-records');
    const suggestionBox = input.parentElement.querySelector('.suggestions-card');
    
    if (query.length === 0) {
        suggestionBox.style.display = 'none';
        row.querySelector('.sales-invoice-no').value = '';
        row.querySelector('.sales-price').value = '';
        row.querySelector('.sales-qty').value = '';
        row.querySelector('.sales-discount').value = '';
        row.querySelector('.sales-t-amount').value = '';
        updateGrandTotal();
        saveSalesState();
        return;
    }

    const records = JSON.parse(localStorage.getItem('storeRecords')) || [];
    // Filter records that contain the query letter/string
    const matches = records.filter(record => record.productName.toLowerCase().includes(query));

    if (matches.length > 0) {
        suggestionBox.innerHTML = matches.map(record => `
            <div class="suggestion-item" onmousedown='selectProduct(this, ${JSON.stringify(record).replace(/'/g, "&apos;")})'>
                ${record.productName}
            </div>
        `).join('');
        suggestionBox.style.display = 'block';
    } else {
        suggestionBox.style.display = 'none';
    }
    saveSalesState();
}

function searchInvoice(input) {
    const query = input.value.trim().toLowerCase();
    const suggestionBox = input.parentElement.querySelector('.suggestions-card');
    
    if (query.length === 0) {
        suggestionBox.style.display = 'none';
        const row = input.closest('.input-records');
        row.querySelector('.sales-product-name').value = '';
        row.querySelector('.sales-price').value = '';
        row.querySelector('.sales-qty').value = '';
        row.querySelector('.sales-discount').value = '';
        row.querySelector('.sales-t-amount').value = '';
        updateGrandTotal();
        saveSalesState();
        return;
    }

    const records = JSON.parse(localStorage.getItem('storeRecords')) || [];
    const matches = records.filter(record => record.invoiceNo.toString().toLowerCase().includes(query));

    if (matches.length > 0) {
        suggestionBox.innerHTML = matches.map(record => `
            <div class="suggestion-item" onmousedown='selectProduct(this, ${JSON.stringify(record).replace(/'/g, "&apos;")})'>
                ${record.invoiceNo} - ${record.productName}
            </div>
        `).join('');
        suggestionBox.style.display = 'block';
    } else {
        suggestionBox.style.display = 'none';
    }
    saveSalesState();
}

function hideSuggestions(input) {
    // Delay hiding to allow click event on suggestion to register
    setTimeout(() => {
        const suggestionBox = input.parentElement.querySelector('.suggestions-card');
        if (suggestionBox) suggestionBox.style.display = 'none';
    }, 200);
}

function selectProduct(element, record) {
    const row = element.closest('.input-records');
    const nameInput = row.querySelector('.sales-product-name');
    const invoiceInput = row.querySelector('.sales-invoice-no');
    const priceInput = row.querySelector('.sales-price');
    const qtyInput = row.querySelector('.sales-qty');
    const discountInput = row.querySelector('.sales-discount');

    if (nameInput) nameInput.value = record.productName;
    if (invoiceInput) invoiceInput.value = record.invoiceNo;
    if (qtyInput) qtyInput.value = 1;
    if (discountInput) discountInput.value = 0;
    if (priceInput) {
        priceInput.value = record.sPrice;
        calculateSalesRow(priceInput); // Update totals
    }

    row.querySelectorAll('.suggestions-card').forEach(box => box.style.display = 'none');
    saveSalesState();
}

function deleteSalesRow(element) {
    const row = element.closest('.input-records');
    if (row) {
        row.remove();
        reindexSalesRows();
        updateGrandTotal();
        saveSalesState();
    }
}

function reindexSalesRows() {
    const rows = document.querySelectorAll('.entry-datas .input-records');
    rows.forEach((row, index) => {
        const snoInput = row.querySelector('.sales-sno');
        if (snoInput) snoInput.value = index + 1;
    });
}

function calculateSalesRow(element) {
    const row = element.closest('.input-records');
    if (!row) return;

    const price = parseFloat(row.querySelector('.sales-price').value) || 0;
    const qty = parseFloat(row.querySelector('.sales-qty').value) || 0;
    const discount = parseFloat(row.querySelector('.sales-discount').value) || 0;

    const total = (price * qty) * (1 - discount / 100);
    const tAmountInput = row.querySelector('.sales-t-amount');
    if (tAmountInput) tAmountInput.value = total.toFixed(2);

    updateGrandTotal();
    saveSalesState();
}

function updateGrandTotal() {
    const tAmounts = document.querySelectorAll('.sales-t-amount');
    let grandTotal = 0;
    tAmounts.forEach(input => {
        grandTotal += parseFloat(input.value) || 0;
    });
    const totalAmountInput = document.getElementById('amou');
    if (totalAmountInput) totalAmountInput.value = grandTotal.toFixed(2);
}

function saveSalesState() {
    const date = document.getElementById('date')?.value || '';
    const time = document.getElementById('time')?.value || '';
    const cusName = document.getElementById('cus-name')?.value || '';
    
    const rows = [];
    document.querySelectorAll('.entry-datas .input-records').forEach(row => {
        rows.push({
            productName: row.querySelector('.sales-product-name').value,
            invoiceNo: row.querySelector('.sales-invoice-no').value,
            price: row.querySelector('.sales-price').value,
            qty: row.querySelector('.sales-qty').value,
            discount: row.querySelector('.sales-discount').value,
            tAmount: row.querySelector('.sales-t-amount').value
        });
    });

    const state = { date, time, cusName, rows };
    localStorage.setItem('currentSalesState', JSON.stringify(state));
}

function loadSalesState() {
    const state = JSON.parse(localStorage.getItem('currentSalesState'));
    if (!state) return;

    if (document.getElementById('date')) document.getElementById('date').value = state.date;
    if (document.getElementById('time')) document.getElementById('time').value = state.time;
    if (document.getElementById('cus-name')) document.getElementById('cus-name').value = state.cusName;

    const container = document.querySelector('.entry-datas');
    if (container) container.innerHTML = '';

    if (state.rows && state.rows.length > 0) {
        state.rows.forEach(row => addSalesRow(row));
    }
    updateGrandTotal();
}

document.addEventListener('DOMContentLoaded', () => {
    loadRecords();
    loadSalesState();

    ['date', 'time', 'cus-name'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', saveSalesState);
    });

    const addButton = document.querySelector('.addd-butt');
    if (addButton) {
        addButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            let sno = document.querySelector('.s-no').value;
            const productName = document.querySelector('.productname').value;
            const invoiceNo = document.querySelector('.invoice-no').value;
            const bPrice = document.querySelector('.b-price').value;
            const qty = document.querySelector('.qty').value;
            const sPrice = document.querySelector('.s-price').value;

            let records = JSON.parse(localStorage.getItem('storeRecords')) || [];

            if (!sno) {
                sno = records.length + 1;
            } else if (records.some(record => record.sno == sno)) {
                alert("Item with this S/No already exists! (Ye item pehle se add hai)");
                return;
            }
            if (records.some(record => record.productName.trim().toLowerCase() === productName.trim().toLowerCase())) {
                alert("This Product Name already exists! (Ye item pehle se add hai)");
                return;
            }
            if (!productName || !invoiceNo || !bPrice || !qty || !sPrice) {
                alert("Please fill all fields (Saaray khanay pur karein)");
                return;
            }

            const qtyNum = parseFloat(qty) || 0;
            const bPriceNum = parseFloat(bPrice) || 0;
            const totalAmount = qtyNum * bPriceNum;

            const newRecord = {
                sno: sno,
                productName: productName,
                invoiceNo: invoiceNo,
                bPrice: bPrice,
                qty: qty,
                sQty: 0, 
                tQty: qty,
                sPrice: sPrice,
                tAmount: totalAmount
            };
            records.push(newRecord);
            localStorage.setItem('storeRecords', JSON.stringify(records));
            const form = document.querySelector('form');
            if (form) form.reset();
        });
    }

    const addSalesButton = document.querySelector('.add-card');
    if (addSalesButton) {
        addSalesButton.addEventListener('click', (e) => {
            e.preventDefault();
            addSalesRow();
        });
    }
});