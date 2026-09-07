/* MANNELI — نقطه شروع و init */
// ---------- شروع ----------
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initTheme === 'function') initTheme();
    renderProducts('all');
    renderHomeReps();
    buildIranMap();
    renderRepsPage();
    updateCartUI();
    renderCustomerDashboard();
    renderEducatorDashboard();
});
