/* MANNELI — نقطه شروع و init */
// ---------- شروع ----------
document.addEventListener('DOMContentLoaded', () => {
    renderProducts('all');
    renderHomeReps();
    buildIranMap();
    renderRepsPage();
    updateCartUI();
    renderCustomerDashboard();
    renderEducatorDashboard();
});
