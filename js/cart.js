/* MANNELI — سبد خرید و چکاوت (منطق نماینده‌اول) */
// ---------- سبد خرید ----------
function addToCart(id, qty = 1) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const item = cart.find(x => x.id === id);
    if (item) item.qty += qty; else cart.push({ ...p, qty: qty });
    updateCartUI();
    showCartToast();
}
function changeQty(id, d) {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty += d;
    if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
    updateCartUI();
}
function cartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function updateCartUI() {
    const badge = $('cart-badge');
    const count = cart.reduce((s, i) => s + i.qty, 0);
    badge.style.display = count ? 'flex' : 'none';
    badge.innerText = faNum(count);

    const box = $('cart-items');
    if (cart.length === 0) {
        box.innerHTML = '<p class="empty-cart">سبد خرید شما خالی است.</p>';
    } else {
        box.innerHTML = cart.map(i => `
            <div class="cart-item">
                <div style="cursor:pointer" onclick="toggleCart(false); openProductDetails(${i.id})">
                    <p class="ci-title" style="transition:color .2s" onmouseover="this.style.color='var(--c-rose)'" onmouseout="this.style.color=''">${i.title}</p>
                    <p class="ci-price">${faNum(i.price * i.qty)} تومان</p>
                </div>
                <div class="qty-ctl">
                    <button onclick="changeQty(${i.id},-1)">−</button>
                    <span>${faNum(i.qty)}</span>
                    <button onclick="changeQty(${i.id},1)">+</button>
                </div>
            </div>`).join('');
    }
    $('cart-total').innerText = cartTotal() ? faNum(cartTotal()) + ' تومان' : '۰ تومان';
    updateCartRepSuggest();
}
function toggleCart(force) {
    const d = $('cart-drawer'), o = $('cart-overlay');
    const show = force === undefined ? !d.classList.contains('show') : force;
    d.classList.toggle('show', show);
    o.classList.toggle('show', show);
}
function showCartToast() {
    const t = $('toast');
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideCartToast, 3500);
}
function hideCartToast() { $('toast').classList.remove('show'); }

// پیشنهاد نماینده در سبد (قبل از دکمه خرید مستقیم)
function findRepForCity(city) {
    if (!city) return null;
    const entry = Object.entries(representatives).find(([k, r]) => k === city || city.includes(r.region) || r.region.includes(city));
    return entry ? entry[1] : null;
}
function updateCartRepSuggest() {
    const box = $('cart-rep-suggest');
    const gateCity = $('gate-city').value;
    const city = gateCity || (currentUser && currentUser.city);
    const r = findRepForCity(city);
    if (!r) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.style.display = 'block';
    box.innerHTML = `
        <div class="rep-suggest">
            <h5><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            نماینده رسمی در شهر شما: ${r.name}</h5>
            <p>تحویل سریع‌تر با تماس مستقیم: <span class="ltr">${r.phone}</span></p>
        </div>`;
}

// ---------- چک‌اوت و صفحه تکمیل اطلاعات ----------
let selectedCheckoutAddressId = null;
let checkoutAddressMode = 'saved'; // 'saved' or 'new'

function triggerCheckout() {
    if (cart.length === 0) {
        showAlert('سبد خرید شما خالی است.', 'warning');
        return;
    }

    toggleCart(false);

    // بررسی ثبت‌نام یا ورود کاربر
    if (!currentUser) {
        redirectAfterAuth = 'checkout';
        showAlert('برای تکمیل خرید و ثبت سفارش، لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.', 'warning');
        setTimeout(() => {
            closeAlert();
            openAuthModal();
        }, 800);
        return;
    }

    // هدایت به صفحه جدید تکمیل اطلاعات
    renderCheckoutPage();
    switchTab('checkout');
}

function renderCheckoutPage() {
    if (!currentUser) return;

    const userAddresses = getUserAddresses(currentUser);
    const savedWrap = $('checkout-saved-addresses-wrap');
    const newWrap = $('checkout-new-address-wrap');
    const newHeader = $('checkout-new-address-header');

    if (userAddresses && userAddresses.length > 0) {
        checkoutAddressMode = 'saved';
        if (savedWrap) savedWrap.style.display = 'block';
        if (newWrap) newWrap.style.display = 'none';
        if (newHeader) newHeader.style.display = 'flex';

        // انتخاب آدرس پیش‌فرض یا اولین آدرس
        let defaultAddr = userAddresses.find(a => a.id === selectedCheckoutAddressId)
                       || userAddresses.find(a => a.isDefault)
                       || userAddresses[0];
        selectedCheckoutAddressId = defaultAddr.id;

        renderCheckoutSavedAddresses(userAddresses);
        selectCheckoutAddress(selectedCheckoutAddressId);
    } else {
        checkoutAddressMode = 'new';
        if (savedWrap) savedWrap.style.display = 'none';
        if (newWrap) newWrap.style.display = 'block';
        if (newHeader) newHeader.style.display = 'none'; // چون آدرس ذخیره‌ای نیست دکمه بازگشت نمایش داده نمی‌شود

        // پر کردن فیلدها از روی اطلاعات موجود کاربر
        $('co-name').value = currentUser.name || (currentUser.firstName ? currentUser.firstName + ' ' + (currentUser.lastName || '') : '');
        $('co-phone').value = currentUser.phone || '';
        $('co-city').value = currentUser.city || '';
        $('co-zip').value = currentUser.zip || '';
        $('co-address').value = currentUser.address || '';
        onCheckoutCityChange();
    }

    // رندر اقلام در پیش‌فاکتور
    const itemsList = $('checkout-items-list');
    if (itemsList) {
        itemsList.innerHTML = cart.map(i => `
            <div class="checkout-item">
                <div>
                    <div class="co-item-title">${i.title}</div>
                    <div class="co-item-sub">${faNum(i.qty)} عدد × ${faNum(i.price)} تومان</div>
                </div>
                <div style="font-weight:700;color:var(--c-rose-deep)">${faNum(i.price * i.qty)} تومان</div>
            </div>
        `).join('');
    }

    // به‌روزرسانی هزینه‌ها
    const total = cartTotal();
    $('co-subtotal').innerText = faNum(total) + ' تومان';
    $('co-grand-total').innerText = faNum(total) + ' تومان';
}

function renderCheckoutSavedAddresses(addresses) {
    const list = $('checkout-addresses-list');
    if (!list) return;

    list.innerHTML = addresses.map(addr => {
        const isSelected = addr.id === selectedCheckoutAddressId;
        return `
            <div class="checkout-address-card ${isSelected ? 'selected' : ''}" id="co-addr-card-${addr.id}" onclick="selectCheckoutAddress(${addr.id})">
                <input type="radio" name="co-selected-addr" class="checkout-address-radio" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); selectCheckoutAddress(${addr.id})">
                <div class="checkout-address-content">
                    <div class="checkout-address-head">
                        <div class="checkout-address-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--c-rose)"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span>${addr.title || 'آدرس تحویل'}</span>
                            ${addr.isDefault ? '<span class="badge-default">پیش‌فرض</span>' : ''}
                        </div>
                        <div class="checkout-address-recipient">
                            تحویل‌گیرنده: <b>${addr.recipientName || currentUser.name || '—'}</b> (${addr.recipientPhone || currentUser.phone || '—'})
                        </div>
                    </div>
                    <div class="checkout-address-body">
                        ${addr.city}، ${addr.address}
                    </div>
                    <div class="checkout-address-meta">
                        <span>کد پستی: ${addr.zip || '—'}</span>
                        <span>شهر: ${addr.city}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectCheckoutAddress(addrId) {
    selectedCheckoutAddressId = addrId;
    checkoutAddressMode = 'saved';

    const userAddresses = getUserAddresses(currentUser);
    const addr = userAddresses.find(a => a.id === addrId);

    // به‌روزرسانی کارت‌ها و رادیوها
    userAddresses.forEach(a => {
        const card = $(`co-addr-card-${a.id}`);
        if (card) {
            const isSel = a.id === addrId;
            card.classList.toggle('selected', isSel);
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = isSel;
        }
    });

    if (addr) {
        // تنظیم شهر جهت بررسی نماینده
        const citySelect = $('co-city');
        if (citySelect) {
            const hasOption = Array.from(citySelect.options).some(o => o.value === addr.city);
            citySelect.value = hasOption ? addr.city : 'سایر';
        }
        onCheckoutCityChange(addr.city);
    }
}

function showNewAddressFormInCheckout() {
    checkoutAddressMode = 'new';
    $('checkout-saved-addresses-wrap').style.display = 'none';
    $('checkout-new-address-wrap').style.display = 'block';
    const newHeader = $('checkout-new-address-header');
    if (newHeader) newHeader.style.display = 'flex';

    // مقادیر پیش‌فرض گیرنده
    $('co-name').value = currentUser.name || (currentUser.firstName ? currentUser.firstName + ' ' + (currentUser.lastName || '') : '');
    $('co-phone').value = currentUser.phone || '';
    $('co-city').value = '';
    $('co-zip').value = '';
    $('co-address').value = '';
    onCheckoutCityChange('');
}

function backToSavedAddressesInCheckout() {
    checkoutAddressMode = 'saved';
    $('checkout-saved-addresses-wrap').style.display = 'block';
    $('checkout-new-address-wrap').style.display = 'none';
    selectCheckoutAddress(selectedCheckoutAddressId);
}

function onCheckoutCityChange(cityParam) {
    const city = cityParam !== undefined ? cityParam : $('co-city').value;
    const rep = findRepForCity(city);
    const banner = $('checkout-rep-banner');
    const optRep = $('opt-shipping-rep');
    const optDirect = $('opt-shipping-direct');

    if (rep) {
        banner.style.display = 'block';
        banner.innerHTML = `
            <h5><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            نماینده رسمی مانلی در ${rep.region}: ${rep.name}</h5>
            <p>مسئول: ${rep.manager} • تماس مستقیم: <span class="ltr">${rep.phone}</span></p>
            <p style="margin-top:4px;font-size:11.5px;color:var(--c-rose-deep)">با انتخاب تحویل از نماینده، سفارش شما به سرعت از انبار محلی تحویل خواهد شد.</p>
        `;
        optRep.style.display = 'flex';
        optRep.querySelector('input').checked = true;
    } else {
        banner.style.display = 'none';
        optRep.style.display = 'none';
        optDirect.querySelector('input').checked = true;
    }
}

function updateShippingMethodUI() {
    // در صورت نیاز به تغییر در هزینه‌ها یا استایل
}

function finalizeCheckoutOrder() {
    if (!currentUser) return;

    let name = '';
    let phone = '';
    let city = '';
    let zip = '';
    let address = '';
    const notes = ($('co-notes').value || '').trim();

    if (checkoutAddressMode === 'saved') {
        const userAddresses = getUserAddresses(currentUser);
        const selectedAddr = userAddresses.find(a => a.id === selectedCheckoutAddressId) || userAddresses[0];
        if (!selectedAddr) {
            showAlert('لطفاً یک آدرس را برای تحویل سفارش انتخاب نمایید.', 'warning');
            return;
        }
        name = selectedAddr.recipientName || currentUser.name || '';
        phone = selectedAddr.recipientPhone || currentUser.phone || '';
        city = selectedAddr.city || '';
        zip = selectedAddr.zip || '';
        address = selectedAddr.address || '';
    } else {
        // حالت آدرس جدید (اگر آدرس ذخیره‌شده نبود یا کاربر آدرس جدید وارد کرد)
        name = $('co-name').value.trim();
        phone = $('co-phone').value.trim();
        city = $('co-city').value;
        zip = $('co-zip').value.trim();
        address = $('co-address').value.trim();

        if (!name || !phone || !city || !zip || !address) {
            showAlert('لطفاً مشخصات و آدرس پستی را به طور کامل تکمیل نمایید.', 'warning');
            return;
        }

        if (phone.replace(/\D/g, '').length < 10) {
            showAlert('شماره تماس وارد شده معتبر نیست.', 'warning');
            return;
        }

        // ذخیره آدرس جدید در دفترچه آدرس‌های کاربر
        const userAddresses = getUserAddresses(currentUser);
        const newAddr = {
            id: Date.now(),
            title: `آدرس تحویل ${city ? `(${city})` : ''}`,
            recipientName: name,
            recipientPhone: phone,
            city: city,
            zip: zip,
            address: address,
            isDefault: userAddresses.length === 0
        };
        userAddresses.push(newAddr);

        // همگام‌سازی با registeredUsers
        const userInDb = registeredUsers.find(u => u.phone === currentUser.phone);
        if (userInDb) {
            if (!Array.isArray(userInDb.addresses)) userInDb.addresses = [];
            userInDb.addresses = [...userAddresses];
            if (newAddr.isDefault) {
                userInDb.city = city;
                userInDb.zip = zip;
                userInDb.address = address;
            }
        }
        if (newAddr.isDefault) {
            currentUser.city = city;
            currentUser.zip = zip;
            currentUser.address = address;
        }
    }

    const shippingMethod = document.querySelector('input[name="shipping-method"]:checked')?.value || 'direct';
    const rep = findRepForCity(city);

    const desc = cart.map(i => i.title + ' × ' + i.qty).join('، ');
    const price = cartTotal();
    const orderId = Math.floor(Math.random() * 90000) + 10000;

    let deliveryType = 'ارسال پستی پیشتاز از تهران';
    if (shippingMethod === 'rep' && rep) {
        deliveryType = 'تحویل از نماینده رسمی: ' + rep.name;
    }

    // کپی اقلام سبد برای نگهداری در سفارش
    const orderItems = cart.map(i => ({ ...i }));

    // ذخیره در سوابق سفارشات
    ordersState.unshift({
        id: orderId,
        desc: desc,
        price: price,
        date: 'امروز',
        status: shippingMethod === 'rep' ? 'ارجاع شده به نماینده رسمی' : 'در حال آماده‌سازی و بسته‌بندی',
        statusCode: 'processing',
        type: deliveryType,
        trackingCode: 'MNL-' + orderId,
        shippingAddress: city + '، ' + address + (zip ? ' (کدپستی: ' + zip + ')' : ''),
        recipientName: name,
        recipientPhone: phone,
        items: orderItems,
        timeline: [
            { title: 'ثبت سفارش و پرداخت', time: 'امروز - دقایقی پیش', done: true },
            { title: shippingMethod === 'rep' ? 'هماهنگی و تحویل از انبار نماینده' : 'پردازش و کنترل کیفی در انبار مرکزی تهران', time: 'در حال انجام', done: true },
            { title: shippingMethod === 'rep' ? 'تحویل به مشتری توسط نماینده' : 'تحویل به پست پیشتاز', time: 'پیش‌بینی: ۱ الی ۲ روز کاری', done: false },
            { title: 'تحویل نهایی مرسوله', time: 'در انتظار ارسال', done: false }
        ]
    });

    // خالی کردن سبد
    cart = [];
    updateCartUI();
    renderCustomerDashboard();

    // پیام تایید و هدایت به پنل کاربری برای مشاهده سفارش
    showAlert(`سفارش #${faNum(orderId)} با موفقیت ثبت شد! نحوه ارسال: ${deliveryType}. سپاس از خرید شما از مانلی.`, 'success');

    setTimeout(() => {
        switchTab('profile');
    }, 1800);
}
