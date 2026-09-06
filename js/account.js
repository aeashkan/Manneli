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

        // آدرس‌ها
        $('addr-full-text').innerText = currentUser.address ? (currentUser.city + '، ' + currentUser.address) : 'هنوز آدرسی برای تحویل ثبت نشده است.';
        $('addr-city-text').innerText = currentUser.city || '—';
        $('addr-zip-text').innerText = currentUser.zip || '—';

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
    $('edit-city').value = currentUser.city || '';
    $('edit-zip').value = currentUser.zip || '';
    $('edit-address').value = currentUser.address || '';

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
    const ct = $('edit-city').value.trim();
    const zp = $('edit-zip').value.trim();
    const ad = $('edit-address').value.trim();

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
    currentUser.city = ct;
    currentUser.zip = zp;
    currentUser.address = ad;

    // به‌روزرسانی در دیتابیس لوکال کاربران
    const userInDb = registeredUsers.find(u => u.phone === currentUser.phone);
    if (userInDb) {
        Object.assign(userInDb, currentUser);
    }

    closeEditProfileModal();
    syncProfileUI();
    showAlert('اطلاعات حساب کاربری شما با موفقیت به‌روزرسانی شد.', 'success');
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
