/* MANNELI — سبد خرید و چکاوت (منطق نماینده‌اول) */
// ---------- سبد خرید ----------
function addToCart(id) {
    const p = products.find(x => x.id === id);
    const item = cart.find(x => x.id === id);
    if (item) item.qty += 1; else cart.push({ ...p, qty: 1 });
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
                <div>
                    <p class="ci-title">${i.title}</p>
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

    // پر کردن فیلدهای گیرنده از روی اطلاعات کاربر
    $('co-name').value = currentUser.name || '';
    $('co-phone').value = currentUser.phone || '';
    if (currentUser.city) {
        const citySelect = $('co-city');
        const hasOption = Array.from(citySelect.options).some(o => o.value === currentUser.city);
        citySelect.value = hasOption ? currentUser.city : 'سایر';
    }
    $('co-zip').value = currentUser.zip || '';
    $('co-address').value = currentUser.address || '';

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

    // بررسی نماینده برای شهر انتخابی
    onCheckoutCityChange();
}

function onCheckoutCityChange() {
    const city = $('co-city').value;
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
    const name = $('co-name').value.trim();
    const phone = $('co-phone').value.trim();
    const city = $('co-city').value;
    const zip = $('co-zip').value.trim();
    const address = $('co-address').value.trim();
    const notes = $('co-notes').value.trim();

    if (!name || !phone || !city || !zip || !address) {
        showAlert('لطفاً مشخصات و آدرس پستی را به طور کامل تکمیل نمایید.', 'warning');
        return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
        showAlert('شماره تماس وارد شده معتبر نیست.', 'warning');
        return;
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

    // به‌روزرسانی اطلاعات کاربر
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.city = city;
    currentUser.zip = zip;
    currentUser.address = address;

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
