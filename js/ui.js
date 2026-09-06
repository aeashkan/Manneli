/* MANNELI — ناوبری و ویجت‌های عمومی (تب‌ها، پلیرها، FAQ، اعلان) */
// ---------- ناوبری ----------
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = $('page-' + tabId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- آکادمی ----------
function switchAcademyTab(tab) {
    document.querySelectorAll('#page-academy .tab-panel').forEach(p => p.classList.remove('active'));
    $('academy-sec-' + tab).classList.add('active');
    document.querySelectorAll('#academy-filter-row .filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.acat === tab));
}
let videoPlaying = false;
function toggleVideo() {
    videoPlaying = !videoPlaying;
    const icon = videoPlaying
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M2 9h4"/><path d="M2 15h4"/><path d="M18 9h4"/><path d="M18 15h4"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
    const pauseBig = videoPlaying
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect width="4" height="18" x="5" y="3" rx="1"/><rect width="4" height="18" x="15" y="3" rx="1"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
    $('video-play').innerHTML = pauseBig;
    $('video-mini').innerHTML = icon;
    $('video-progress').style.width = videoPlaying ? '45%' : '18%';
    $('video-time').innerText = videoPlaying ? '۰۵:۳۰ / ۱۲:۳۰' : '۰۱:۴۵ / ۱۲:۳۰';
}
function seekVideo(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const pct = Math.round((e.clientX - r.left) / r.width * 100);
    $('video-progress').style.width = pct + '%';
}
let videoMuted = false;
function toggleVideoMute() {
    videoMuted = !videoMuted;
    $('video-mute').innerHTML = videoMuted
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M19.364 18.364a9.003 9.003 0 0 0 0-12.728"/><path d="M12.215 12.215 3 21"/><path d="M8.639 15.364A9.003 9.003 0 0 1 2.637 8.637"/><path d="M21 12h-3"/><path d="M14.343 14.343 9.657 9.657"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/></svg>';
}
let audioPlaying = false;
function toggleAudio() {
    audioPlaying = !audioPlaying;
    const icon = audioPlaying
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect width="4" height="18" x="5" y="3" rx="1"/><rect width="4" height="18" x="15" y="3" rx="1"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
    $('audio-play').innerHTML = icon;
    $('podcast-wave').classList.toggle('playing', audioPlaying);
    $('audio-progress').style.width = audioPlaying ? '72%' : '35%';
    $('audio-current').innerText = audioPlaying ? '۰۹:۱۵' : '۰۴:۱۲';
}
function seekAudio(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const pct = Math.round((e.clientX - r.left) / r.width * 100);
    $('audio-progress').style.width = pct + '%';
}

// ---------- FAQ ----------
function switchFaq(cat) {
    document.querySelectorAll('#page-faq .tab-panel').forEach(p => p.classList.remove('active'));
    $('faq-sec-' + cat).classList.add('active');
    document.querySelectorAll('#faq-tabs .tab-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.faq === cat));
}
function toggleFaq(btn) {
    const a = btn.nextElementSibling;
    const open = !a.classList.contains('open');
    btn.parentElement.querySelectorAll('.faq-a').forEach(x => x.classList.remove('open'));
    btn.parentElement.querySelectorAll('.faq-q').forEach(x => x.classList.remove('open'));
    if (open) { a.classList.add('open'); btn.classList.add('open'); }
}

// ---------- اعلان ----------
function showAlert(msg, type = 'success') {
    const ico = $('alert-ico');
    ico.className = 'alert-ico ' + type;
    ico.innerText = type === 'success' ? '✓' : type === 'warning' ? '!' : 'i';
    $('alert-text').innerText = msg;
    $('alert-modal').classList.add('show');
}
function closeAlert() { $('alert-modal').classList.remove('show'); }
