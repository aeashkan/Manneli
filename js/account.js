/* MANNELI — حساب کاربری، باشگاه مشتریان و پنل اساتید */
// ---------- مودال هوشمند ورود و عضویت ----------
function handleAuthButtonClick() {
    if (currentUser) {
        switchTab('profile');
    } else {
        openAuthModal();
    }
}

function openAuthModal(targetStep = 'phone') {
    $('auth-modal').classList.add('show');
    showAuthStep(targetStep);
}

function closeAuthModal() {
    $('auth-modal').classList.remove('show');
    currentAuthStep = 'phone';
}

function showAuthStep(step) {
    currentAuthStep = step;
    ['phone', 'otp', 'password', 'register'].forEach(s => {
        const el = $('auth-step-' + s);
        if (el) el.classList.toggle('active', s === step);
    });

    const titleEl = $('auth-modal-title');
    if (step === 'phone') {
        titleEl.innerText = 'ورود / عضویت در مانلی';
        setTimeout(() => $('auth-phone-input')?.focus(), 150);
    } else if (step === 'otp') {
        titleEl.innerText = 'تأیید شماره همراه';
        $('otp-phone-display').innerText = tempAuthPhone;
        $('auth-otp-input').value = '';
        setTimeout(() => $('auth-otp-input')?.focus(), 150);
    } else if (step === 'password') {
        titleEl.innerText = 'ورود با رمز عبور';
        $('pwd-phone-display').innerText = tempAuthPhone;
        $('auth-pwd-input').value = '';
        setTimeout(() => $('auth-pwd-input')?.focus(), 150);
    } else if (step === 'register') {
        titleEl.innerText = 'تکمیل عضویت در مانلی';
        $('reg-phone-display').innerText = tempAuthPhone;
        setTimeout(() => $('reg-name-input')?.focus(), 150);
    }
}

function backToAuthPhone() {
    showAuthStep('phone');
}

function switchToPasswordLogin() {
    showAuthStep('password');
}

function switchToOtpLogin() {
    showAuthStep('otp');
}

// مرحله ۱: بررسی شماره تماس
function checkAuthPhone() {
    const rawPhone = ($('auth-phone-input').value || '').trim();
    const cleanPhone = rawPhone.replace(/\D/g, '');

    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        showAlert('لطفاً شماره همراه معتبر (مثال: 09123456789) وارد کنید.', 'warning');
        return;
    }

    tempAuthPhone = rawPhone;
    const userFound = registeredUsers.find(u => u.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)));

    if (userFound) {
        // کاربر قبلاً ثبت‌نام کرده -> ارسال کد پیامکی تستی ۱۲۳۴ و ورود با پیامک یا رمز
        showAuthStep('otp');
    } else {
        // کاربر جدید است -> هدایت به فرم ثبت‌نام
        showAuthStep('register');
    }
}

// مرحله ۲: بررسی کد OTP (کد تستی 1234)
function verifyAuthOtp() {
    const code = ($('auth-otp-input').value || '').trim();
    if (!code) {
        showAlert('لطفاً کد تأیید ۴ رقمی را وارد کنید.', 'warning');
        return;
    }

    // بررسی کد پیامکی تستی ۱۲۳۴
    if (code === '1234') {
        const cleanPhone = tempAuthPhone.replace(/\D/g, '');
        const userFound = registeredUsers.find(u => u.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)));
        if (userFound) {
            loginUserSuccess(userFound);
        } else {
            // در صورتی که کاربر نبود اما با کد تایید شد
            loginUserSuccess({
                name: 'کاربر مانلی',
                phone: tempAuthPhone,
                city: 'تهران',
                zip: '',
                address: ''
            });
        }
    } else {
        showAlert('کد تأیید وارد شده نادرست است. (کد تستی: 1234)', 'warning');
    }
}

// مرحله ۳: بررسی ورود با رمز عبور
function verifyAuthPassword() {
    const pwd = ($('auth-pwd-input').value || '').trim();
    if (!pwd) {
        showAlert('لطفاً رمز عبور خود را وارد کنید.', 'warning');
        return;
    }

    const cleanPhone = tempAuthPhone.replace(/\D/g, '');
    const userFound = registeredUsers.find(u => u.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)));

    if (userFound && userFound.password === pwd) {
        loginUserSuccess(userFound);
    } else {
        showAlert('رمز عبور وارد شده نادرست است.', 'warning');
    }
}

// مرحله ۴: تکمیل ثبت‌نام کاربر جدید
function completeRegistration() {
    const name = ($('reg-name-input').value || '').trim();
    const pwd = ($('reg-pwd-input').value || '').trim();

    if (!name) {
        showAlert('لطفاً نام و نام خانوادگی خود را وارد کنید.', 'warning');
        return;
    }
    if (!pwd || pwd.length < 3) {
        showAlert('لطفاً یک رمز عبور حداقل ۳ کاراکتری تعیین کنید.', 'warning');
        return;
    }

    const newUser = {
        name,
        phone: tempAuthPhone,
        password: pwd,
        city: '',
        zip: '',
        address: ''
    };

    registeredUsers.push(newUser);
    loginUserSuccess(newUser, true);
}

function loginUserSuccess(user, isNew = false) {
    currentUser = { ...user };
    if (!currentUser.addresses) {
        currentUser.addresses = [];
        if (currentUser.address || currentUser.city) {
            currentUser.addresses.push({
                id: 1,
                title: 'آدرس اصلی (پیش‌فرض)',
                recipientName: currentUser.name || '',
                recipientPhone: currentUser.phone || '',
                city: currentUser.city || '',
                zip: currentUser.zip || '',
                address: currentUser.address || '',
                isDefault: true
            });
        }
    }
    syncProfileUI();
    closeAuthModal();

    if (redirectAfterAuth === 'checkout') {
        redirectAfterAuth = null;
        showAlert((isNew ? 'عضویت شما با موفقیت انجام شد! ' : 'ورود با موفقیت انجام شد، ') + user.name + ' عزیز. در حال انتقال به صفحه سفارش...', 'success');
        setTimeout(() => {
            closeAlert();
            renderCheckoutPage();
            switchTab('checkout');
        }, 1100);
        return;
    }

    showAlert((isNew ? 'عضویت شما در باشگاه مانلی با موفقیت ثبت شد. ' : 'خوش آمدید، ') + user.name + '!', 'success');
}

function logoutUser() {
    currentUser = null;
    syncProfileUI();
    showAlert('با موفقیت از حساب کاربری خارج شدید.', 'info');
}

// تغییر تب در سایدبار حساب کاربری
function switchProfileNav(tabId) {
    document.querySelectorAll('.profile-nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.profile-content-box').forEach(box => {
        box.classList.remove('active');
    });
    const targetBox = $('sec-' + tabId);
    if (targetBox) targetBox.classList.add('active');
}

function renderCustomerDashboard() {
    syncProfileUI();
}

function syncProfileUI() {
    const isAuth = !!currentUser;
    $('profile-guest').style.display = isAuth ? 'none' : 'block';
    $('profile-auth').style.display = isAuth ? 'block' : 'none';

    // تغییر عنوان دکمه هدر به «حساب کاربری» طبق درخواست
    $('user-btn-label').innerText = isAuth ? 'حساب کاربری' : 'ورود / عضویت';

    if (isAuth) {
        // پر کردن سایدبار
        $('sb-user-name').innerText = currentUser.name || 'کاربر مانلی';
        $('sb-user-phone').innerText = currentUser.phone || '—';
        $('sb-orders-count').innerText = faNum(ordersState.length);

        // پر کردن اطلاعات شناسایی (مانند عکس دیجی‌کالا)
        let firstName = currentUser.firstName;
        let lastName = currentUser.lastName;
        if (!firstName && currentUser.name) {
            const parts = currentUser.name.trim().split(' ');
            firstName = parts[0] || '—';
            lastName = parts.slice(1).join(' ') || '—';
        }
        $('info-firstname').innerText = firstName || '—';
        $('info-lastname').innerText = lastName || '—';
        $('info-nationalcode').innerText = currentUser.nationalCode || '—';
        $('info-birthdate').innerText = currentUser.birthDate || '—';

        // اطلاعات تماس
        $('info-phone').innerText = currentUser.phone || '—';
        $('info-email').innerText = currentUser.email || 'ثبت نشده (کلیک جهت ثبت)';

        renderCustomerAddresses();
        renderCustomerOrders();
        renderCustomerTickets();
    }
    updateCartRepSuggest();
}

function renderCustomerOrders() {
    if (!currentUser) return;
    const list = $('cust-orders-list');
    if (!list) return;

    if (ordersState.length === 0) {
        list.innerHTML = `
            <div class="info-section-card" style="text-align:center;padding:36px 20px">
                <p class="form-note">شما تاکنون سفارشی در مانلی ثبت نکرده‌اید.</p>
                <button class="btn btn-primary btn-sm" onclick="switchTab('products')" style="margin-top:10px">مشاهده محصولات تخصصی</button>
            </div>`;
        return;
    }

    list.innerHTML = ordersState.map(o => {
        const isDelivered = o.statusCode === 'delivered' || o.status.includes('تحویل');
        const badgeClass = isDelivered ? 'delivered' : 'processing';
        const badgeIcon = isDelivered ? '✓' : '⟳';

        return `
            <div class="order-card-pro" onclick="openOrderDetails(${o.id})">
                <div class="order-head-pro">
                    <div class="order-id-date">
                        <b>سفارش #${faNum(o.id)}</b>
                        <span>•</span>
                        <span>${o.date}</span>
                    </div>
                    <span class="order-status-badge ${badgeClass}">
                        ${badgeIcon} ${o.status}
                    </span>
                </div>

                <!-- استپ‌بار بصری پیشرفت سفارش -->
                <div class="order-stepper">
                    <div class="stepper-step done">
                        <div class="step-dot">۱</div>
                        <span class="step-title">ثبت سفارش</span>
                    </div>
                    <div class="stepper-step ${isDelivered ? 'done' : 'current'}">
                        <div class="step-dot">۲</div>
                        <span class="step-title">پردازش و آماده‌سازی</span>
                    </div>
                    <div class="stepper-step ${isDelivered ? 'done' : ''}">
                        <div class="step-dot">۳</div>
                        <span class="step-title">تحویل به پست/نماینده</span>
                    </div>
                    <div class="stepper-step ${isDelivered ? 'done' : ''}">
                        <div class="step-dot">۴</div>
                        <span class="step-title">تحویل نهایی</span>
                    </div>
                </div>

                <div class="order-footer-pro">
                    <div>
                        <span>مبلغ کل: </span>
                        <b>${faNum(o.price)} تومان</b>
                    </div>
                    <button class="order-view-details-btn">
                        مشاهده مشخصات و فاکتور
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openOrderDetails(orderId) {
    const o = ordersState.find(x => x.id === orderId);
    if (!o) return;

    $('od-modal-title').innerText = 'جزئیات سفارش #' + faNum(o.id);
    $('od-modal-sub').innerText = 'تاریخ ثبت: ' + o.date + ' | ' + o.type;

    const isDelivered = o.statusCode === 'delivered' || o.status.includes('تحویل');
    const badge = $('od-modal-status-badge');
    badge.className = 'order-status-badge ' + (isDelivered ? 'delivered' : 'processing');
    badge.innerText = o.status;

    // استپ بار مودال
    $('od-modal-stepper').innerHTML = `
        <div class="stepper-step done">
            <div class="step-dot">۱</div>
            <span class="step-title">ثبت اولیه</span>
        </div>
        <div class="stepper-step ${isDelivered ? 'done' : 'current'}">
            <div class="step-dot">۲</div>
            <span class="step-title">پردازش انبار</span>
        </div>
        <div class="stepper-step ${isDelivered ? 'done' : ''}">
            <div class="step-dot">۳</div>
            <span class="step-title">تحویل به باربری</span>
        </div>
        <div class="stepper-step ${isDelivered ? 'done' : ''}">
            <div class="step-dot">۴</div>
            <span class="step-title">تحویل گیرنده</span>
        </div>
    `;

    // اقلام فاکتور
    const items = o.items || [{ title: o.desc, qty: 1, price: o.price }];
    $('od-modal-items').innerHTML = items.map(i => `
        <div class="checkout-item">
            <div>
                <div class="co-item-title">${i.title}</div>
                <div class="co-item-sub">${faNum(i.qty || 1)} عدد × ${faNum(i.price)} تومان</div>
            </div>
            <div style="font-weight:700;color:var(--c-rose-deep)">${faNum((i.price || 0) * (i.qty || 1))} تومان</div>
        </div>
    `).join('');

    $('od-modal-delivery').innerText = o.type || 'ارسال استاندارد';
    $('od-modal-tracking').innerText = o.trackingCode || ('TRK-' + o.id);
    $('od-modal-recipient').innerText = (o.recipientName || (currentUser && currentUser.name)) + ' (' + (o.recipientPhone || (currentUser && currentUser.phone)) + ')';
    $('od-modal-address').innerText = o.shippingAddress || (currentUser && currentUser.address) || 'ثبت در سفارش';
    $('od-modal-price').innerText = faNum(o.price) + ' تومان';

    $('order-details-modal').classList.add('show');
}

function closeOrderDetailsModal() {
    $('order-details-modal').classList.remove('show');
}

// ویرایش مشخصات فردی و تماس
function openEditProfileModal() {
    if (!currentUser) return;
    let firstName = currentUser.firstName;
    let lastName = currentUser.lastName;
    if (!firstName && currentUser.name) {
        const parts = currentUser.name.trim().split(' ');
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
    }

    $('edit-firstname').value = firstName || '';
    $('edit-lastname').value = lastName || '';
    $('edit-nationalcode').value = currentUser.nationalCode || '';
    $('edit-birthdate').value = currentUser.birthDate || '';
    $('edit-email').value = currentUser.email || '';

    $('edit-profile-modal').classList.add('show');
}

function closeEditProfileModal() {
    $('edit-profile-modal').classList.remove('show');
}

function saveProfileInfo() {
    if (!currentUser) return;
    const fn = $('edit-firstname').value.trim();
    const ln = $('edit-lastname').value.trim();
    const nc = $('edit-nationalcode').value.trim();
    const bd = $('edit-birthdate').value.trim();
    const em = $('edit-email').value.trim();

    if (!fn || !ln) {
        showAlert('لطفاً نام و نام خانوادگی را وارد نمایید.', 'warning');
        return;
    }

    currentUser.firstName = fn;
    currentUser.lastName = ln;
    currentUser.name = fn + ' ' + ln;
    currentUser.nationalCode = nc;
    currentUser.birthDate = bd;
    currentUser.email = em;

    // به‌روزرسانی در دیتابیس لوکال کاربران
    const userInDb = registeredUsers.find(u => u.phone === currentUser.phone);
    if (userInDb) {
        Object.assign(userInDb, currentUser);
    }

    closeEditProfileModal();
    syncProfileUI();
    showAlert('اطلاعات شناسایی شما با موفقیت به‌روزرسانی شد.', 'success');
}

// ---------- مدیریت آدرس‌ها ----------
function getUserAddresses(user) {
    if (!user) return [];
    if (!user.addresses) {
        user.addresses = [];
        if (user.address || user.city) {
            user.addresses.push({
                id: 1,
                title: 'آدرس اصلی (پیش‌فرض)',
                recipientName: user.name || '',
                recipientPhone: user.phone || '',
                city: user.city || '',
                zip: user.zip || '',
                address: user.address || '',
                isDefault: true
            });
        }
    }
    return user.addresses;
}

function renderCustomerAddresses() {
    if (!currentUser) return;
    const container = $('cust-addresses-list');
    if (!container) return;

    const list = getUserAddresses(currentUser);

    if (list.length === 0) {
        container.innerHTML = `
            <div class="info-section-card" style="text-align:center;padding:36px 20px">
                <p class="form-note">شما هنوز هیچ آدرسی برای تحویل سفارش‌ها ثبت نکرده‌اید.</p>
                <button class="btn btn-primary btn-sm" onclick="openAddressModal()" style="margin-top:10px">
                    + ثبت اولین آدرس تحویل
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(a => `
        <div class="address-card-pro ${a.isDefault ? 'is-default' : ''}">
            <div class="address-head-row">
                <div style="display:flex;align-items:center;gap:8px">
                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--c-rose-deep)"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${a.title || 'آدرس تحویل'}
                    </h4>
                    ${a.isDefault ? '<span class="address-action-btn default-tag">پیش‌فرض تحویل</span>' : ''}
                </div>
                <div class="address-actions">
                    <button class="address-action-btn edit" onclick="openAddressModal(${a.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        ویرایش آدرس
                    </button>
                    ${!a.isDefault ? `
                        <button class="address-action-btn set-default" onclick="setDefaultAddress(${a.id})">
                            انتخاب به عنوان پیش‌فرض
                        </button>
                    ` : ''}
                    <button class="address-action-btn delete" onclick="deleteAddress(${a.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        حذف
                    </button>
                </div>
            </div>
            <p class="addr-text">${a.address}</p>
            <div class="address-meta">
                <span>استان / شهر: <b>${a.city || '—'}</b></span>
                <span>کد پستی: <b class="ltr">${a.zip || '—'}</b></span>
                <span>تحویل‌گیرنده: <b>${a.recipientName || (currentUser && currentUser.name) || '—'} (${a.recipientPhone || (currentUser && currentUser.phone) || '—'})</b></span>
            </div>
        </div>
    `).join('');
}

function openAddressModal(addressId) {
    if (!currentUser) return;
    const isEdit = typeof addressId !== 'undefined' && addressId !== null;
    const titleEl = $('addr-modal-title');
    const idInput = $('addr-edit-id');
    const titleInput = $('addr-title-input');
    const cityInput = $('addr-city-input');
    const zipInput = $('addr-zip-input');
    const detailInput = $('addr-detail-input');
    const recipientNameInput = $('addr-recipient-name');
    const recipientPhoneInput = $('addr-recipient-phone');
    const isDefaultCheckbox = $('addr-is-default');

    if (isEdit) {
        const addresses = getUserAddresses(currentUser);
        const addr = addresses.find(x => x.id === addressId);
        if (!addr) return;

        titleEl.innerText = 'ویرایش مشخصات آدرس';
        idInput.value = addr.id;
        titleInput.value = addr.title || '';
        cityInput.value = addr.city || '';
        zipInput.value = addr.zip || '';
        detailInput.value = addr.address || '';
        recipientNameInput.value = addr.recipientName || currentUser.name || '';
        recipientPhoneInput.value = addr.recipientPhone || currentUser.phone || '';
        isDefaultCheckbox.checked = !!addr.isDefault;
    } else {
        titleEl.innerText = 'افزودن آدرس جدید';
        idInput.value = '';
        titleInput.value = '';
        cityInput.value = '';
        zipInput.value = '';
        detailInput.value = '';
        recipientNameInput.value = currentUser.name || '';
        recipientPhoneInput.value = currentUser.phone || '';
        const list = getUserAddresses(currentUser);
        isDefaultCheckbox.checked = list.length === 0;
    }

    $('address-modal').classList.add('show');
}

function closeAddressModal() {
    $('address-modal').classList.remove('show');
}

function saveAddressModal() {
    if (!currentUser) return;
    const editId = $('addr-edit-id').value;
    const title = $('addr-title-input').value.trim();
    const city = $('addr-city-input').value.trim();
    const zip = $('addr-zip-input').value.trim();
    const address = $('addr-detail-input').value.trim();
    const recipientName = $('addr-recipient-name').value.trim();
    const recipientPhone = $('addr-recipient-phone').value.trim();
    const isDefault = $('addr-is-default').checked;

    if (!city) {
        showAlert('لطفاً استان و شهر را انتخاب نمایید.', 'warning');
        return;
    }
    if (!address) {
        showAlert('لطفاً نشانی دقیق پستی را وارد نمایید.', 'warning');
        return;
    }
    if (!zip || zip.length < 5) {
        showAlert('لطفاً کد پستی معتبر ۱۰ رقمی را وارد نمایید.', 'warning');
        return;
    }
    if (!recipientName) {
        showAlert('لطفاً نام تحویل‌گیرنده را وارد نمایید.', 'warning');
        return;
    }
    if (!recipientPhone) {
        showAlert('لطفاً شماره تماس تحویل‌گیرنده را وارد نمایید.', 'warning');
        return;
    }

    const addresses = getUserAddresses(currentUser);

    if (isDefault) {
        addresses.forEach(a => { a.isDefault = false; });
    }

    if (editId) {
        const targetId = Number(editId);
        const item = addresses.find(x => x.id === targetId);
        if (item) {
            item.title = title || 'آدرس تحویل';
            item.city = city;
            item.zip = zip;
            item.address = address;
            item.recipientName = recipientName;
            item.recipientPhone = recipientPhone;
            if (isDefault) item.isDefault = true;
        }
    } else {
        const newAddr = {
            id: Date.now(),
            title: title || (addresses.length === 0 ? 'آدرس اصلی (پیش‌فرض)' : 'آدرس تحویل'),
            city,
            zip,
            address,
            recipientName,
            recipientPhone,
            isDefault: isDefault || addresses.length === 0
        };
        addresses.push(newAddr);
    }

    // اگر آدرس پیش‌فرض است، در فیلدهای اصلی کاربر ذخیره شود
    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
    if (defaultAddr) {
        currentUser.city = defaultAddr.city;
        currentUser.zip = defaultAddr.zip;
        currentUser.address = defaultAddr.address;
    }

    // به‌روزرسانی دیتابیس لوکال
    const userInDb = registeredUsers.find(u => u.phone === currentUser.phone);
    if (userInDb) {
        userInDb.addresses = [...addresses];
        if (defaultAddr) {
            userInDb.city = defaultAddr.city;
            userInDb.zip = defaultAddr.zip;
            userInDb.address = defaultAddr.address;
        }
    }

    closeAddressModal();
    renderCustomerAddresses();
    updateCartRepSuggest();
    showAlert(editId ? 'مشخصات آدرس با موفقیت ویرایش شد.' : 'آدرس جدید با موفقیت اضافه شد.', 'success');
}

function setDefaultAddress(addressId) {
    if (!currentUser) return;
    const addresses = getUserAddresses(currentUser);
    addresses.forEach(a => {
        a.isDefault = (a.id === addressId);
    });

    const defaultAddr = addresses.find(a => a.isDefault);
    if (defaultAddr) {
        currentUser.city = defaultAddr.city;
        currentUser.zip = defaultAddr.zip;
        currentUser.address = defaultAddr.address;

        const userInDb = registeredUsers.find(u => u.phone === currentUser.phone);
        if (userInDb) {
            userInDb.addresses = [...addresses];
            userInDb.city = defaultAddr.city;
            userInDb.zip = defaultAddr.zip;
            userInDb.address = defaultAddr.address;
        }
    }

    renderCustomerAddresses();
    updateCartRepSuggest();
    showAlert('آدرس پیش‌فرض تحویل با موفقیت تغییر یافت.', 'success');
}

function deleteAddress(addressId) {
    if (!currentUser) return;
    const addresses = getUserAddresses(currentUser);
    const idx = addresses.findIndex(a => a.id === addressId);
    if (idx === -1) return;

    const wasDefault = addresses[idx].isDefault;
    addresses.splice(idx, 1);

    if (wasDefault && addresses.length > 0) {
        addresses[0].isDefault = true;
        currentUser.city = addresses[0].city;
        currentUser.zip = addresses[0].zip;
        currentUser.address = addresses[0].address;
    } else if (addresses.length === 0) {
        currentUser.city = '';
        currentUser.zip = '';
        currentUser.address = '';
    }

    const userInDb = registeredUsers.find(u => u.phone === currentUser.phone);
    if (userInDb) {
        userInDb.addresses = [...addresses];
        userInDb.city = currentUser.city;
        userInDb.zip = currentUser.zip;
        userInDb.address = currentUser.address;
    }

    renderCustomerAddresses();
    updateCartRepSuggest();
    showAlert('آدرس مورد نظر حذف شد.', 'info');
}

// ---------- تغییر رمز عبور ----------
function changeUserPassword() {
    if (!currentUser) return;
    const curr = ($('pwd-curr-input').value || '').trim();
    const newP = ($('pwd-new-input').value || '').trim();
    const conf = ($('pwd-confirm-input').value || '').trim();

    if (!curr || !newP || !conf) {
        showAlert('لطفاً تمام فیلدهای تغییر رمز عبور را تکمیل نمایید.', 'warning');
        return;
    }

    if (curr !== currentUser.password) {
        showAlert('رمز عبور فعلی وارد شده نادرست است.', 'danger');
        return;
    }

    if (newP.length < 3) {
        showAlert('رمز عبور جدید باید حداقل ۳ رقم یا حرف باشد.', 'warning');
        return;
    }

    if (newP !== conf) {
        showAlert('رمز عبور جدید با تکرار آن همخوانی ندارد.', 'warning');
        return;
    }

    currentUser.password = newP;
    const userInDb = registeredUsers.find(u => u.phone === currentUser.phone);
    if (userInDb) {
        userInDb.password = newP;
    }

    $('pwd-curr-input').value = '';
    $('pwd-new-input').value = '';
    $('pwd-confirm-input').value = '';

    showAlert('رمز عبور حساب کاربری شما با موفقیت تغییر کرد.', 'success');
}

function renderCustomerTickets() {
    if (!currentUser) return;
    $('cust-tickets-list').innerHTML = ticketsState.map(t => ticketRowHTML(t)).join('') || '<p class="form-note">تیکتی ثبت نشده است.</p>';
}
function orderRowHTML(o) {
    const ok = o.status === 'تحویل شده';
    return `<div class="order-row">
        <div><p class="o-title">سفارش #${faNum(o.id)} • ${o.date}</p><p class="o-desc">${o.desc}</p><span class="badge ${ok ? 'badge-ok' : 'badge-warn'}">${o.status} — ${o.type}</span></div>
        <div class="o-price">${faNum(o.price)} تومان</div>
    </div>`;
}
function ticketRowHTML(t) {
    return `<div class="ticket-row">
        <div class="t-head"><span>${t.subject}</span><span>${t.status}</span></div>
        <p>${t.reply}</p>
    </div>`;
}
function sendCustomerTicket() {
    const s = $('cust-ticket-subj').value.trim();
    const m = $('cust-ticket-msg').value.trim();
    if (!s || !m) { showAlert('لطفاً موضوع و متن را بنویسید.', 'warning'); return; }
    ticketsState.unshift({ id: Date.now(), subject: s, date: 'امروز', status: 'در حال بررسی', reply: 'درخواست شما دریافت شد؛ تیم پشتیبانی به‌زودی پاسخ می‌دهد.' });
    $('cust-ticket-subj').value = ''; $('cust-ticket-msg').value = '';
    renderCustomerDashboard();
    showAlert('تیکت شما ثبت شد.', 'success');
}

// ---------- داشبورد مشترک تب‌ها ----------
function switchDashTab(prefix, secId) {
    const root = prefix === 'edu' ? $('edu-dashboard') : $('profile-auth');
    root.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    root.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.sec === secId));
    $(secId).classList.add('active');
}

// ---------- اساتید ----------
function triggerFilePick() { $('edu-file').click(); }
function handleFilePick(input) {
    if (input.files && input.files[0]) {
        $('edu-file-status').innerText = 'فایل «' + input.files[0].name + '» با موفقیت بارگذاری شد.';
    }
}
function submitEducatorApply() {
    const name = $('edu-reg-name').value.trim();
    const phone = $('edu-reg-phone').value.trim();
    const city = $('edu-reg-city').value.trim();
    const insta = $('edu-reg-instagram').value.trim();
    if (!name || !phone || !city || !insta) {
        showAlert('لطفاً فیلدهای ضروری (نام، همراه، شهر، اینستاگرام) را تکمیل کنید.', 'warning'); return;
    }
    ['edu-reg-name','edu-reg-phone','edu-reg-city','edu-reg-exp','edu-reg-specialty','edu-reg-instagram'].forEach(id => $(id).value = '');
    $('edu-file-status').innerText = 'برای آپلود رزومه یا گواهی کلیک کنید';
    showAlert('درخواست شما برای بررسی به دفتر مرکزی ارسال شد. نتیجه ظرف ۴۸ ساعت اعلام می‌شود؛ پس از تایید، کد فعال‌سازی یک‌بارمصرف برای شما ارسال می‌گردد.', 'success');
}
function attemptEducatorLogin() {
    const phone = $('edu-login-phone').value.trim();
    const code = $('edu-login-code').value.trim();
    if (!phone || !code) { showAlert('لطفاً شماره همراه و کد فعال‌سازی را وارد کنید.', 'warning'); return; }
    if (phone.replace(/\D/g, '').length < 10) { showAlert('شماره همراه معتبر نیست.', 'warning'); return; }
    if (code.length < 6) { showAlert('کد فعال‌سازی معتبر نیست.', 'warning'); return; }
    // نسخه نمایشی: کد یک‌بارمصرف واقعی از طریق پیامک ارسال می‌شود
    $('edu-guest-view').style.display = 'none';
    $('edu-dashboard').style.display = 'block';
    $('edu-login-phone').value = ''; $('edu-login-code').value = '';
    renderEducatorDashboard();
    showAlert('ورود شما تایید شد. کد یک‌بارمصرف اکنون استفاده شده و غیرفعال شد.', 'success');
}
function lockEducatorPortal() {
    $('edu-dashboard').style.display = 'none';
    $('edu-guest-view').style.display = 'block';
}
function renderEducatorDashboard() {
    $('edu-orders-list').innerHTML = ordersState.map(o => orderRowHTML(o)).join('') || '<p class="form-note" style="color:rgba(245,238,228,.6)">درخواستی ثبت نشده است.</p>';
    $('edu-tickets-list').innerHTML = ticketsState.map(t => ticketRowHTML(t)).join('') || '<p class="form-note" style="color:rgba(245,238,228,.6)">تیکتی ثبت نشده است.</p>';
    $('edu-events-list').innerHTML = eventsState.map(e => `
        <div class="order-row">
            <div><p class="o-title">${e.title}</p><p class="o-desc">شهر: ${e.city} • ${e.date}</p></div>
            <div class="o-price" style="font-size:12px">ظرفیت: ${faNum(e.capacity)} نفر</div>
        </div>`).join('') || '<p class="form-note" style="color:rgba(245,238,228,.6)">رویدادی ثبت نشده است.</p>';
}
function sendEducatorTicket() {
    const s = $('edu-ticket-subj').value.trim();
    const m = $('edu-ticket-msg').value.trim();
    if (!s || !m) { showAlert('لطفاً موضوع و متن را بنویسید.', 'warning'); return; }
    ticketsState.unshift({ id: Date.now(), subject: s, date: 'امروز', status: 'در حال بررسی', reply: 'تیکت دریافت شد؛ دفتر مرکزی به‌زودی پاسخ می‌دهد.' });
    $('edu-ticket-subj').value = ''; $('edu-ticket-msg').value = '';
    renderEducatorDashboard();
    showAlert('تیکت شما به دفتر مرکزی ارسال شد.', 'success');
}
function registerEducatorEvent() {
    const t = $('edu-event-title').value.trim();
    const d = $('edu-event-date').value.trim();
    const c = $('edu-event-city').value.trim();
    const cap = parseInt($('edu-event-cap').value) || 0;
    if (!t || !d || !c || !cap) { showAlert('لطفاً مشخصات رویداد را کامل وارد کنید.', 'warning'); return; }
    eventsState.unshift({ id: Date.now(), title: t, date: d, city: c, capacity: cap });
    ['edu-event-title','edu-event-date','edu-event-city','edu-event-cap'].forEach(id => $(id).value = '');
    renderEducatorDashboard();
    showAlert('رویداد شما در سایت منتشر شد.', 'success');
}
function requestTestKit() {
    showAlert('درخواست کیت تست کلاسی شما ثبت شد و از انبار مرکزی تهران ارسال خواهد شد.', 'success');
}
function copyCode(code) {
    const tmp = document.createElement('input');
    tmp.value = code; document.body.appendChild(tmp);
    tmp.select(); document.execCommand('copy');
    document.body.removeChild(tmp);
    showAlert('کد «' + code + '» کپی شد.', 'success');
}
