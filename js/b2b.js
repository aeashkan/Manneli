/* MANNELI — فرم همکاری عمده (B2B) دو مرحلهای */
// ---------- B2B دو مرحله‌ای ----------
let b2bStep = 1;
function setB2BStep(n) {
    b2bStep = n;
    $('b2b-step-1').classList.toggle('active', n === 1);
    $('b2b-step-2').classList.toggle('active', n === 2);
    $('b2b-step-ind-1').className = 'step-pill' + (n === 1 ? ' active' : ' done');
    $('b2b-step-ind-2').className = 'step-pill' + (n === 2 ? ' active' : '');
}
function nextB2BStep() {
    const name = $('b2b-name').value.trim();
    const phone = $('b2b-phone').value.trim();
    const city = $('b2b-city').value.trim();
    if (!name || !phone || !city) { showAlert('لطفاً مشخصات مرحله اول را کامل کنید.', 'warning'); return; }
    setB2BStep(2);
}
function prevB2BStep() { setB2BStep(1); }
function submitB2B() {
    const shop = $('b2b-shopname').value.trim();
    if (!shop) { showAlert('نام فروشگاه را وارد کنید.', 'warning'); return; }
    ['b2b-name','b2b-phone','b2b-city','b2b-shopname','b2b-message'].forEach(id => $(id).value = '');
    setB2BStep(1);
    showAlert('درخواست همکاری عمده شما ثبت شد. تیم توسعه بازار مانلی حداکثر ظرف ۴۸ ساعت با شما تماس می‌گیرد.', 'success');
}
