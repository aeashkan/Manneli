/* MANNELI — کاتالوگ: محصولات و نمایندگان */
// ---------- محصولات ----------
function renderProducts(cat = 'all') {
    const grid = $('products-grid');
    grid.innerHTML = '';
    const list = cat === 'all' ? products : products.filter(p => p.category === cat);
    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
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
                    <button class="btn btn-primary btn-sm btn-block" onclick="addToCart(${p.id})">
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
function renderRepsPage() {
    const list = $('reps-list-container');
    if (list) list.innerHTML = '';
    const q = ($('rep-search-input').value || '').trim().toLowerCase();
    const activeRegion = (document.querySelector('#reps-region-row .filter-btn.active') || {}).dataset || {};
    const region = activeRegion.region || 'all';
    const keys = Object.keys(representatives).filter(k => {
        const r = representatives[k];
        const okRegion = region === 'all' || r.region === region;
        const okQuery = !q || [r.name, r.manager, r.address, r.region].join(' ').toLowerCase().includes(q);
        return okRegion && okQuery;
    });
    syncIranMap(keys, region, q);

    const countBadge = $('reps-count-badge');
    if (countBadge) {
        countBadge.innerText = 'تعداد نمایندگان: ' + faNum(keys.length) + ' نفر';
    }

    if (keys.length === 0 && list) {
        list.innerHTML = `<div class="card" style="text-align:center;padding:40px;margin-top:20px"><p class="form-note">نمایندگی با این مشخصات پیدا نشد. برای اخذ نمایندگی در شهر خود، فرم همکاری عمده را تکمیل کنید.</p><button class="btn btn-outline btn-sm" style="margin-top:14px" onclick="switchTab('b2b')">درخواست نمایندگی</button></div>`;
        return;
    }
}
function searchRepresentatives() { renderRepsPage(); }
function filterRepsByRegion(region) {
    document.querySelectorAll('#reps-region-row .filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.region === region));
    renderRepsPage();
}

// ---------- نقشه استانی ایران ----------
function buildIranMap() {
    const gProv = $('iran-provinces');
    const gPins = $('iran-pins');
    gProv.innerHTML = '';
    gPins.innerHTML = '';
    const NS = 'http://www.w3.org/2000/svg';
    (IRAN_PROVINCES || []).forEach(p => {
        const el = document.createElementNS(NS, 'path');
        el.setAttribute('d', p.d);
        el.setAttribute('class', 'iran-province');
        if (p.pin) { el.dataset.region = p.pin; el.dataset.en = p.en; }
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
            '<circle class="pin-halo" cx="0" cy="0" r="7"></circle>' +
            '<circle class="pin-ring" cx="0" cy="0" r="5"></circle>' +
            '<circle class="pin-dot" cx="0" cy="0" r="2"></circle>' +
            '<text class="pin-label" x="0" y="18">' + p.label + '</text>';
        g.addEventListener('click', () => openRepInfo(p.region));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRepInfo(p.region); } });
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
    $('rep-info-region').innerText = 'استان ' + r.region + ' • نمایندگی رسمی مانلی';
    $('rep-info-manager').innerHTML = 'مسئول: ' + r.manager;
    $('rep-info-address').innerHTML = 'آدرس: ' + r.address;
    $('rep-info-hours').innerHTML = 'ساعات کاری: ' + r.hours;
    $('rep-info-insta').innerHTML = 'اینستاگرام: <span class="ltr">' + r.instagram + '</span>';
    $('rep-info-call').dataset.phone = r.phone;
    $('rep-info-modal').classList.add('show');
}
function closeRepInfo() { $('rep-info-modal').classList.remove('show'); }
