/* MANNELI — کاتالوگ: محصولات و نمایندگان */
// ---------- متغیرهای صفحه جزئیات محصول ----------
let currentPdpProductId = null;
let currentPdpQty = 1;

// ---------- محصولات ----------
function renderProducts(cat = 'all') {
    const grid = $('products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const list = cat === 'all' ? products : products.filter(p => p.category === cat);
    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openProductDetails(p.id);
        card.innerHTML = `
            <img class="product-img" src="${p.img}" alt="${p.title}" loading="lazy"
                 onerror="this.style.display='none'">
            <div class="product-body">
                <span class="product-cat">${p.category}</span>
                <h3 class="product-title">${p.title}</h3>
                <div class="product-specs">
                    ${p.specs.map(s => `<span><b>${s[0]}:</b> ${s[1]}</span>`).join('')}
                </div>
                <span class="product-claim">${p.claim}</span>
                <div class="product-foot">
                    <div class="product-price-row">
                        <span style="font-size:12px;color:var(--c-muted)">قیمت مصوب</span>
                        <span class="product-price">${faNum(p.price)} <small>تومان</small></span>
                    </div>
                    <button class="btn btn-primary btn-sm btn-block" onclick="event.stopPropagation(); addToCart(${p.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        افزودن به سبد
                    </button>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}
function filterProducts(cat) {
    document.querySelectorAll('#products-filter-row .filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.cat === cat));
    renderProducts(cat);
}

// ---------- صفحه اختصاصی جزئیات کالا (PDP) ----------
function openProductDetails(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;

    currentPdpProductId = p.id;
    currentPdpQty = 1;

    // به‌روزرسانی نان‌ریزه (Breadcrumb)
    const bcCat = $('pdp-bc-cat');
    if (bcCat) {
        bcCat.innerText = p.category;
        bcCat.onclick = () => {
            switchTab('products');
            filterProducts(p.category);
        };
    }
    const bcTitle = $('pdp-bc-title');
    if (bcTitle) bcTitle.innerText = p.title;

    // تصویر و گالری کالا
    const imgEl = $('pdp-img');
    if (imgEl) {
        imgEl.src = p.img;
        imgEl.alt = p.title;
    }
    const claimEl = $('pdp-claim-badge');
    if (claimEl) claimEl.innerText = p.claim || 'ضمانت اصالت مانلی';

    // اطلاعات هویتی و فنی
    const catEl = $('pdp-cat');
    if (catEl) catEl.innerText = p.category;

    const skuEl = $('pdp-sku');
    if (skuEl) skuEl.innerText = 'کد کالا: ' + (p.code || ('MNL-00' + p.id));

    const titleEl = $('pdp-title');
    if (titleEl) titleEl.innerText = p.title;

    const ratingEl = $('pdp-rating');
    if (ratingEl) ratingEl.innerText = faNum(p.rating || 4.9);

    const reviewsCountEl = $('pdp-reviews-count');
    if (reviewsCountEl) reviewsCountEl.innerText = faNum(p.reviewsCount || 42) + ' دیدگاه همکاران و اساتید';

    const ratingCountPill = $('pdp-rating-count-pill');
    if (ratingCountPill) ratingCountPill.innerText = `(${faNum(p.reviewsCount || 42)})`;

    const reviewsLinkText = $('pdp-reviews-link-text');
    if (reviewsLinkText) reviewsLinkText.innerText = `${faNum(p.reviewsCount || 42)} دیدگاه`;

    const recommendPct = $('pdp-recommend-pct');
    if (recommendPct) {
        const pct = 90 + ((p.id * 3) % 9);
        recommendPct.innerText = `${faNum(pct)}٪`;
    }

    // مشخصات سریع
    const quickSpecsEl = $('pdp-quick-specs');
    if (quickSpecsEl) {
        quickSpecsEl.innerHTML = p.specs.map(s => `
            <div class="pdp-quick-spec-item">
                <b>${s[0]}:</b>
                <span>${s[1]}</span>
            </div>
        `).join('');
    }

    // معرفی و توضیحات
    const descEl = $('pdp-description');
    if (descEl) {
        descEl.innerText = p.description || 'تجهیزات و مواد تخصصی مانلی با بالاترین استانداردهای کیفی برای استفاده حرفه‌ای در سالن‌های ناخن طراحی و تولید شده است.';
    }

    // ویژگی‌های برجسته
    const featuresList = $('pdp-features-list');
    if (featuresList) {
        const feats = p.features && p.features.length > 0 ? p.features : [
            "فرمولاسیون ایمن و مورد تایید اساتید ارشد کاشت ناخن",
            "دوام و کارایی بالا در ساعات کاری طولانی سالنی",
            "سازگاری کامل با کلیه برندها و استانداردهای روز بین‌المللی"
        ];
        featuresList.innerHTML = feats.map(f => `
            <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${f}</span>
            </li>
        `).join('');
    }

    // باکس خرید و قیمت
    const priceEl = $('pdp-price');
    if (priceEl) priceEl.innerText = faNum(p.price);

    const mobPriceEl = $('pdp-mob-price');
    if (mobPriceEl) mobPriceEl.innerText = faNum(p.price);

    const qtyValEl = $('pdp-qty-val');
    if (qtyValEl) qtyValEl.innerText = faNum(1);

    // ریست کردن وضعیت نمایش ویژگی‌های برجسته
    const featWrap = $('pdp-features-wrapper');
    if (featWrap) featWrap.classList.add('is-collapsed');
    const featToggleBtn = $('pdp-features-toggle-btn');
    if (featToggleBtn) featToggleBtn.classList.remove('is-expanded');
    const featToggleText = $('pdp-features-toggle-text');
    if (featToggleText) featToggleText.innerText = 'مشاهده بیشتر';

    // پیشنهاد نماینده رسمی در شهر کاربر (در صورت وجود)
    const repNotice = $('pdp-rep-notice');
    if (repNotice) {
        const userCity = (currentUser && currentUser.city) || '';
        const rep = findRepForCity(userCity);
        if (rep) {
            repNotice.innerHTML = `
                <div class="pdp-rep-notice-head">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>نماینده رسمی در ${rep.region}: ${rep.name}</span>
                </div>
                <p style="margin:0;font-size:11.5px;color:var(--c-muted)">
                    تحویل سریع‌تر با تماس مستقیم: <span class="ltr" style="font-weight:700;color:var(--c-rose-deep)">${rep.phone}</span>
                </p>
            `;
        } else {
            repNotice.innerHTML = `
                <div class="pdp-rep-notice-head">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>تحویل سریع‌تر از نماینده محلی</span>
                </div>
                <p style="margin:0;font-size:11.5px;color:var(--c-muted)">
                    در مرحله نهایی ثبت سفارش، نماینده رسمی شهر شما به صورت هوشمند شناسایی و برای تحویل فوری پیشنهاد می‌شود.
                </p>
            `;
        }
    }

    // جدول مشخصات فنی تفصیلی
    const specsTable = $('pdp-specs-table-body');
    if (specsTable) {
        const full = p.fullSpecs && p.fullSpecs.length > 0 ? p.fullSpecs : [
            ["نام و مدل کالا", p.title],
            ["دسته‌بندی", p.category],
            ["کد شناسه محصول", p.code || ('MNL-00' + p.id)],
            ["قیمت مصوب سراسری", faNum(p.price) + " تومان"],
            ["تضمین کیفیت", p.claim || "گارانتی اصالت مانلی"]
        ];
        specsTable.innerHTML = full.map(([k, v]) => `
            <tr>
                <th>${k}</th>
                <td>${v}</td>
            </tr>
        `).join('');
    }

    // نکات اساتید
    const tipsText = $('pdp-tips-text');
    if (tipsText) {
        tipsText.innerText = p.usageTips || 'جهت ماندگاری بالاتر و کسب بهترین نتیجه از کار، توصیه می‌شود کلیه مراحل زیرسازی و مصرف مطابق استانداردهای آکادمی مانلی انجام پذیرد.';
    }

    // محصولات مکمل و مرتبط
    renderPdpRelatedProducts(p);

    // پیش‌فرض تب مشخصات
    switchPdpTab('specs');

    // هدایت به تب صفحه جزئیات محصول
    switchTab('product-detail');
}

function changePdpQty(delta) {
    currentPdpQty += delta;
    if (currentPdpQty < 1) currentPdpQty = 1;
    if (currentPdpQty > 50) currentPdpQty = 50;
    const qtyEl = $('pdp-qty-val');
    if (qtyEl) qtyEl.innerText = faNum(currentPdpQty);
}

function addCurrentProductToCart() {
    if (!currentPdpProductId) return;
    addToCart(currentPdpProductId, currentPdpQty);
}

function switchPdpTab(tabName) {
    document.querySelectorAll('.pdp-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pdptab === tabName);
    });
    document.querySelectorAll('.pdp-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    const target = $('pdp-panel-' + tabName);
    if (target) target.classList.add('active');
}

function togglePdpFeatures() {
    const wrap = $('pdp-features-wrapper');
    const btn = $('pdp-features-toggle-btn');
    const text = $('pdp-features-toggle-text');
    if (!wrap) return;

    const isCollapsed = wrap.classList.contains('is-collapsed');
    if (isCollapsed) {
        wrap.classList.remove('is-collapsed');
        if (btn) btn.classList.add('is-expanded');
        if (text) text.innerText = 'بستن ویژگی‌ها';
    } else {
        wrap.classList.add('is-collapsed');
        if (btn) btn.classList.remove('is-expanded');
        if (text) text.innerText = 'مشاهده بیشتر';
    }
}

function goToPdpReviews() {
    switchPdpTab('reviews');
    const target = document.querySelector('.pdp-details-tabs-card');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function goToPdpSpecs() {
    switchPdpTab('specs');
    const target = document.querySelector('.pdp-details-tabs-card');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function submitPdpReview() {
    const nameInput = $('pdp-new-review-name');
    const textInput = $('pdp-new-review-text');
    const name = (nameInput.value || '').trim();
    const text = (textInput.value || '').trim();

    if (!name || !text) {
        showAlert('لطفاً نام و متن دیدگاه خود را وارد نمایید.', 'warning');
        return;
    }

    const reviewsList = $('pdp-reviews-list');
    if (reviewsList) {
        const newReview = document.createElement('div');
        newReview.className = 'pdp-review-card';
        newReview.innerHTML = `
            <div class="pdp-review-head">
                <span class="pdp-review-author">${name}</span>
                <span class="pdp-review-date">لحظاتی پیش</span>
            </div>
            <div class="pdp-review-body">${text}</div>
        `;
        reviewsList.prepend(newReview);
    }

    nameInput.value = '';
    textInput.value = '';
    showAlert('دیدگاه شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد.', 'success');
}

function renderPdpRelatedProducts(currentProduct) {
    const grid = $('pdp-related-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // انتخاب محصولاتی به جز محصول فعلی
    const related = products
        .filter(p => p.id !== currentProduct.id)
        .slice(0, 4);

    related.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openProductDetails(p.id);
        card.innerHTML = `
            <img class="product-img" src="${p.img}" alt="${p.title}" loading="lazy"
                 onerror="this.style.display='none'">
            <div class="product-body">
                <span class="product-cat">${p.category}</span>
                <h3 class="product-title">${p.title}</h3>
                <div class="product-specs">
                    ${p.specs.map(s => `<span><b>${s[0]}:</b> ${s[1]}</span>`).join('')}
                </div>
                <span class="product-claim">${p.claim}</span>
                <div class="product-foot">
                    <div class="product-price-row">
                        <span style="font-size:12px;color:var(--c-muted)">قیمت مصوب</span>
                        <span class="product-price">${faNum(p.price)} <small>تومان</small></span>
                    </div>
                    <button class="btn btn-primary btn-sm btn-block" onclick="event.stopPropagation(); addToCart(${p.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        افزودن به سبد
                    </button>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

// ---------- نمایندگان ----------
function repCardHTML(r, compact) {
    return `
        <div class="rep-card">
            <div>
                <span class="chip chip-rose">توزیع فعال استانی</span>
            </div>
            <div>
                <h3>${r.name}</h3>
                <p class="rep-meta">مسئول: ${r.manager}</p>
            </div>
            <div class="rep-facts">
                <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span>${r.address}</span></p>
                <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>ساعات کاری: ${r.hours}</span></p>
                <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/></svg><span class="ltr">${r.instagram}</span></p>
            </div>
            <div class="rep-actions" style="grid-template-columns:1fr">
                <button class="btn btn-primary btn-sm" onclick="callRep('${r.phone}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    تماس مستقیم: <span class="ltr">${r.phone}</span>
                </button>
            </div>`;
}
function callRep(phone) {
    window.location.href = 'tel:' + phone;
    showAlert('در حال اتصال به نماینده رسمی (' + phone + ')...', 'success');
}
function renderHomeReps() {
    const grid = $('home-reps-grid');
    grid.innerHTML = '';
    Object.values(representatives).forEach(r => {
        const wrap = document.createElement('div');
        wrap.innerHTML = repCardHTML(r);
        grid.appendChild(wrap.firstElementChild);
    });
}
let repsExpanded = false;

function repSideCardHTML(r) {
    return `
        <div class="rep-side-card" id="rep-card-${r.region}" onclick="focusRepOnMap('${r.region}')">
            <div class="rep-card-top">
                <div style="display:flex;align-items:center;gap:6px">
                    <span class="rep-rank-pill rep-province-pill">${r.province || r.region}</span>
                </div>
                <div class="rep-rating-tag">
                    <svg viewBox="0 0 24 24" fill="#f59e0b" width="13" height="13" style="color:#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>${r.rating || '۴.۸'}</span>
                    <span style="font-size:10.5px;color:var(--c-muted)">(${faNum(r.reviewsCount || 25)})</span>
                </div>
            </div>
            <div>
                <h4 class="rep-card-title">${r.name}</h4>
                <p class="rep-card-manager">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>مدیریت: ${r.manager}</span>
                </p>
            </div>
            <div class="rep-card-details">
                <div class="rep-detail-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>${r.address}</span>
                </div>
                <div class="rep-detail-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>ساعات کاری: ${r.hours}</span>
                </div>
            </div>
            <div class="rep-card-actions">
                <button class="btn btn-primary btn-sm" type="button" onclick="callRep('${r.phone}'); event.stopPropagation();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    تماس با شعبه: <span class="ltr">${r.phoneLocal || r.phone}</span>
                </button>
            </div>
        </div>
    `;
}

function toggleRepsExpand() {
    repsExpanded = !repsExpanded;
    renderRepsPage();
}

function renderRepsPage() {
    const cardsWrapper = $('reps-cards-wrapper');
    const loadMoreRow = $('reps-load-more-row');
    const loadMoreBtn = $('reps-load-more-btn');
    const loadMoreText = $('reps-load-more-text');
    const sidebarTitle = $('reps-sidebar-title');
    const sidebarSub = $('reps-sidebar-sub');
    const countBadge = $('reps-count-badge');

    if (cardsWrapper) cardsWrapper.innerHTML = '';

    const q = ($('rep-search-input') ? $('rep-search-input').value : '').trim().toLowerCase();
    const activeRegion = (document.querySelector('#reps-region-row .filter-btn.active') || {}).dataset || {};
    const region = activeRegion.region || 'all';

    // فیلتر بر اساس جستجو و منطقه
    const allKeys = Object.keys(representatives);
    let matchedKeys = allKeys.filter(k => {
        const r = representatives[k];
        const okRegion = region === 'all' || r.region === region || (r.province && r.province.includes(region));
        const okQuery = !q || [r.name, r.manager, r.address, r.region, r.province || ''].join(' ').toLowerCase().includes(q);
        return okRegion && okQuery;
    });

    // مرتب‌سازی بر اساس امتیاز (بدون اعلام نحوه مرتب‌سازی به کاربر)
    function parseRepScore(val) {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const en = String(val).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
        return parseFloat(en) || 0;
    }
    matchedKeys.sort((a, b) => {
        const scoreA = parseRepScore(representatives[a].rating);
        const scoreB = parseRepScore(representatives[b].rating);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (representatives[b].reviewsCount || 0) - (representatives[a].reviewsCount || 0);
    });

    // هماهنگ‌سازی نشانگرها و استان‌های نقشه
    syncIranMap(matchedKeys, region, q);

    if (countBadge) {
        countBadge.innerText = 'تعداد کل نمایندگان فعال: ' + faNum(matchedKeys.length) + ' نفر';
    }

    if (matchedKeys.length === 0) {
        if (sidebarTitle) sidebarTitle.innerText = 'شعبه‌ای پیدا نشد';
        if (sidebarSub) sidebarSub.innerText = 'می‌توانید نام شهر، استان یا مسئول دیگری را جستجو کنید.';
        if (cardsWrapper) {
            cardsWrapper.innerHTML = `
                <div class="card" style="text-align:center;padding:30px 16px;background:#faf8f5">
                    <p class="form-note" style="margin-bottom:12px">نمایندگی با این مشخصات در سامانه پیدا نشد. برای اخذ نمایندگی در شهر خود، فرم درخواست همکاری را تکمیل کنید.</p>
                    <button class="btn btn-outline btn-sm" onclick="switchTab('b2b')">درخواست نمایندگی در شهر شما</button>
                </div>
            `;
        }
        if (loadMoreRow) loadMoreRow.style.display = 'none';
        return;
    }

    // حالت جستجو: نمایش هم‌زمان کلیه موارد جستجوشده در کنار نقشه
    if (q) {
        if (sidebarTitle) sidebarTitle.innerText = `شعب منطبق با «${$('rep-search-input').value.trim()}»`;
        if (sidebarSub) sidebarSub.innerText = 'موقعیت این شعب هم‌زمان روی نقشه نیز با نشانگر فعال علامت‌گذاری شده است.';
        if (loadMoreRow) loadMoreRow.style.display = 'none';

        matchedKeys.forEach(k => {
            const wrap = document.createElement('div');
            wrap.innerHTML = repSideCardHTML(representatives[k]);
            cardsWrapper.appendChild(wrap.firstElementChild);
        });
        return;
    }

    // حالت فیلتر بر اساس منطقه خاص
    if (region !== 'all') {
        if (sidebarTitle) sidebarTitle.innerText = `شعبه رسمی استان ${region}`;
        if (sidebarSub) sidebarSub.innerText = 'دارای مجوز رسمی توزیع سراسری محصولات مانلی.';
        if (loadMoreRow) loadMoreRow.style.display = 'none';

        matchedKeys.forEach(k => {
            const wrap = document.createElement('div');
            wrap.innerHTML = repSideCardHTML(representatives[k]);
            cardsWrapper.appendChild(wrap.firstElementChild);
        });
        return;
    }

    // حالت پیش‌فرض (همه شعب): ۳ نماینده اول و دکمه موارد بیشتر
    if (!repsExpanded) {
        const top3Keys = matchedKeys.slice(0, 3);
        const remainingCount = matchedKeys.length - 3;

        if (sidebarTitle) sidebarTitle.innerText = 'لیست نمایندگی‌های مانلی';
        if (sidebarSub) sidebarSub.innerText = 'ارسال سریع شهری و دسترسی مستقیم به محصولات مانلی در سراسر کشور';

        top3Keys.forEach(k => {
            const wrap = document.createElement('div');
            wrap.innerHTML = repSideCardHTML(representatives[k]);
            cardsWrapper.appendChild(wrap.firstElementChild);
        });

        if (loadMoreRow) {
            if (remainingCount > 0) {
                loadMoreRow.style.display = 'block';
                if (loadMoreText) loadMoreText.innerText = `مشاهده موارد بیشتر (${faNum(remainingCount)} نماینده دیگر)`;
                if (loadMoreBtn) loadMoreBtn.classList.remove('is-expanded');
            } else {
                loadMoreRow.style.display = 'none';
            }
        }
    } else {
        // حالت بازشده (نمایش کلیه نمایندگان)
        if (sidebarTitle) sidebarTitle.innerText = 'لیست نمایندگی‌های مانلی';
        if (sidebarSub) sidebarSub.innerText = 'ارسال سریع شهری و دسترسی مستقیم به محصولات مانلی در سراسر کشور';

        matchedKeys.forEach(k => {
            const wrap = document.createElement('div');
            wrap.innerHTML = repSideCardHTML(representatives[k]);
            cardsWrapper.appendChild(wrap.firstElementChild);
        });

        if (loadMoreRow) {
            loadMoreRow.style.display = 'block';
            if (loadMoreText) loadMoreText.innerText = 'نمایش کمتر';
            if (loadMoreBtn) loadMoreBtn.classList.add('is-expanded');
        }
    }
}

function searchRepresentatives() { renderRepsPage(); }

function filterRepsByRegion(region) {
    document.querySelectorAll('#reps-region-row .filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.region === region));
    renderRepsPage();
}

// فوکوس متقابل نماینده روی نقشه و باز کردن اطلاعات
function focusRepOnMap(region) {
    const r = representatives[region];
    if (!r) return;

    // هایلایت کردن پین مربوطه روی نقشه
    document.querySelectorAll('.iran-pin').forEach(pin => {
        const isMatch = pin.dataset.region === region;
        pin.classList.toggle('highlighted', isMatch);
    });

    // هایلایت کردن کارت در سایدبار
    document.querySelectorAll('.rep-side-card').forEach(card => card.classList.remove('is-active'));
    const card = document.getElementById('rep-card-' + region);
    if (card) {
        card.classList.add('is-active');
    }

    // در موبایل اسکرول نرم به نقشه تا نشانگر دیده شود
    if (window.innerWidth <= 991) {
        const mapBox = document.querySelector('.map-box');
        if (mapBox) {
            mapBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // باز کردن مودال اطلاعات کامل نماینده
    openRepInfo(region);
}

// فوکوس از روی نقشه به کارت سایدبار
function focusRepFromMap(region) {
    // اگر لیست جمع است و این نماینده در حال حاضر داخل صفحه رندر نشده، ابتدا لیست را باز می‌کنیم
    if (!repsExpanded && !document.getElementById('rep-card-' + region)) {
        repsExpanded = true;
        renderRepsPage();
    }

    // هایلایت کردن پین
    document.querySelectorAll('.iran-pin').forEach(pin => {
        pin.classList.toggle('highlighted', pin.dataset.region === region);
    });

    // اسکرول و هایلایت کارت
    document.querySelectorAll('.rep-side-card').forEach(card => card.classList.remove('is-active'));
    const card = document.getElementById('rep-card-' + region);
    if (card) {
        card.classList.add('is-active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    openRepInfo(region);
}

// ---------- نقشه استانی ایران ----------
function buildIranMap() {
    const gProv = $('iran-provinces');
    const gPins = $('iran-pins');
    if (!gProv || !gPins) return;
    gProv.innerHTML = '';
    gPins.innerHTML = '';
    const NS = 'http://www.w3.org/2000/svg';
    (IRAN_PROVINCES || []).forEach(p => {
        const el = document.createElementNS(NS, 'path');
        el.setAttribute('d', p.d);
        el.setAttribute('class', 'iran-province');
        el.dataset.en = p.en;
        gProv.appendChild(el);
    });
    (IRAN_PINS || []).forEach(p => {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'iran-pin');
        g.dataset.region = p.region;
        g.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ')');
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', 'مشخصات نماینده ' + p.label);
        g.innerHTML =
            '<circle class="pin-halo" cx="0" cy="0" r="8"></circle>' +
            '<circle class="pin-ring" cx="0" cy="0" r="5"></circle>' +
            '<circle class="pin-dot" cx="0" cy="0" r="2.2"></circle>' +
            '<text class="pin-label" x="0" y="17">' + p.label + '</text>';
        g.addEventListener('click', () => focusRepFromMap(p.region));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusRepFromMap(p.region); } });
        gPins.appendChild(g);
    });
}
function syncIranMap(matchedKeys, region, q) {
    const gProv = $('iran-provinces');
    const gPins = $('iran-pins');
    if (!gProv || !gPins) return;
    matchedKeys = matchedKeys || [];
    const isAll = !q && (!region || region === 'all');
    // حالت «همه»: فیلتری فعال نیست، همهٔ شاخه‌ها و استان‌ها با رنگ عادی
    if (isAll) {
        gProv.querySelectorAll('.iran-province').forEach(x => x.classList.remove('active', 'dimmed'));
        gPins.querySelectorAll('.iran-pin').forEach(x => x.classList.remove('dimmed'));
        return;
    }
    const activeProv = new Set(matchedKeys.map(k => IRAN_REGION_PROVINCE[k]).filter(Boolean));
    gProv.querySelectorAll('.iran-province').forEach(x => {
        const active = !!(x.dataset.en && activeProv.has(x.dataset.en));
        x.classList.toggle('active', active);
        x.classList.toggle('dimmed', !active);
    });
    gPins.querySelectorAll('.iran-pin').forEach(x =>
        x.classList.toggle('dimmed', !matchedKeys.includes(x.dataset.region)));
}
function openRepInfo(region) {
    const r = representatives[region];
    if (!r) return;
    $('rep-info-name').innerText = r.name;
    $('rep-info-region').innerText = (r.province ? r.province : ('استان ' + r.region)) + ' • نمایندگی رسمی مانلی';
    $('rep-info-manager').innerHTML = 'مسئول: ' + r.manager;
    $('rep-info-address').innerHTML = 'آدرس: ' + r.address;
    $('rep-info-hours').innerHTML = 'ساعات کاری: ' + r.hours;
    $('rep-info-insta').innerHTML = 'اینستاگرام: <span class="ltr">' + r.instagram + '</span>';
    $('rep-info-call').dataset.phone = r.phone;
    $('rep-info-modal').classList.add('show');
}
function closeRepInfo() { $('rep-info-modal').classList.remove('show'); }
