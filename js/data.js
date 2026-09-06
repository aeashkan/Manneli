/* MANNELI — data (فهرست محصولات، نمایندگان و state اولیه) */
/* ============================================================
   MANNELI — logic
   سبد خرید با «نماینده‌اول» / ورود استاد با کد / B2B دو مرحله‌ای
   ============================================================ */

// ---------- پایگاه داده ----------
const products = [
    { id: 1, title: "دستگاه سوهان برقی استرانگ ۲۰۷ اصلی", category: "تجهیزات برقی", price: 4900000,
      img: "https://images.unsplash.com/photo-1632345031435-8727f6897353?q=80&w=800&auto=format&fit=crop",
      specs: [["دور موتور", "۳۵,۰۰۰ دور/دقیقه"], ["کاربرد", "سالن‌های حرفه‌ای"]], claim: "گارانتی ۱۲ ماهه" },
    { id: 2, title: "دستگاه یووی الایدی سان ۵ مکس", category: "تجهیزات برقی", price: 1250000,
      img: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=800&auto=format&fit=crop",
      specs: [["تعداد LED", "۵ مخفف + سنسور خودکار"], ["کاربرد", "خشک‌کردن ژل و لاک‌ژل"]], claim: "بدون گرمای اضافی" },
    { id: 3, title: "لاک‌ژل دیسکو مانلی (کد ۱۲)", category: "مواد کاشت", price: 180000,
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop",
      specs: [["حجم", "۱۰ میلی‌لیتر"], ["مصرف", "۲ لایه نازک"]], claim: "فرمولاسیون بدون HEMA و TPO" },
    { id: 4, title: "پودر کاشت ناخن کلیر (۱۵۰ گرم)", category: "مواد کاشت", price: 850000,
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop",
      specs: [["وزن", "۱۵۰ گرم"], ["مصرف", "کاشت ژورنالی"]], claim: "ثبات بالا و بدون زردی صدف" },
    { id: 5, title: "رابربیس کات ژل مانلی", category: "پیشنیازها", price: 290000,
      img: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=800&auto=format&fit=crop",
      specs: [["حجم", "۱۵ میلی‌لیتر"], ["مصرف", "۱ لایه نازک"]], claim: "چسبندگی قوی و ماندگاری بیشتر" },
    { id: 6, title: "تاپ‌شین کریستالی سوپربراق", category: "پیشنیازها", price: 240000,
      img: "https://images.unsplash.com/photo-1580655700880-91e73ee3cecb?q=80&w=800&auto=format&fit=crop",
      specs: [["حجم", "۱۵ میلی‌لیتر"], ["مصرف", "لایه نهایی"]], claim: "درخشش شیشه‌ای و ضد خش" },
    { id: 7, title: "قلم کاشت پودر سمور طبیعی #۱۰", category: "ابزار کار", price: 720000,
      img: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=800&auto=format&fit=crop",
      specs: [["جنس", "۱۰۰٪ سمور طبیعی"], ["سایز", "شماره ۱۰"]], claim: "روان‌کاری دقیق مواد" },
    { id: 8, title: "عقبزن استیل تخصصی ناخن دبل", category: "ابزار کار", price: 195000,
      img: "https://images.unsplash.com/photo-1632345031435-8727f6897353?q=80&w=800&auto=format&fit=crop",
      specs: [["جنس", "استیل ضد زنگ"], ["استریل", "قابل اتوکلاو"]], claim: "استریل‌شدنی و بادوام" }
];

const representatives = {
    "تهران": {
        name: "مجموعه تخصصی نیلآرت تهران (غرب)",
        address: "تهران، میدان کاج، پاساژ سرو، واحد ۲۴",
        phone: "021-88776655", phoneLocal: "۰۲۱-۸۸۷۷۶۶۵۵",
        manager: "سرکار خانم مهسا رضایی",
        region: "تهران", hours: "۱۰:۰۰ تا ۲۰:۰۰",
        instagram: "@manneli_tehran_west"
    },
    "اصفهان": {
        name: "بازرگانی لوازم ناخن اصفهان (پارک)",
        address: "اصفهان، چهارباغ بالا، مجتمع تجاری پارک",
        phone: "031-36282930", phoneLocal: "۰۳۱-۳۶۲۸۲۹۳۰",
        manager: "جناب آقای حسینی",
        region: "اصفهان", hours: "۰۹:۳۰ تا ۲۱:۳۰",
        instagram: "@manneli_isfahan_park"
    },
    "شیراز": {
        name: "گالری لوازم ناخن مانلی شیراز",
        address: "شیراز، معالی‌آباد، مجتمع تجاری آرین",
        phone: "071-36342526", phoneLocal: "۰۷۱-۳۶۳۴۲۵۲۶",
        manager: "سرکار خانم عباسی",
        region: "شیراز", hours: "۱۰:00 تا ۲۱:۰۰",
        instagram: "@manneli_shiraz_gallery"
    }
};

let ordersState = [
    {
        id: 10432,
        desc: "دستگاه یووی سان ۵ مکس + لاک‌ژل دیسکو",
        price: 1430000,
        date: "۰۴ تیر ۱۴۰۵",
        status: "در حال پردازش و بسته‌بندی",
        statusCode: "processing", // pending, processing, shipped, delivered, canceled
        type: "ارسال پستی پیشتاز",
        trackingCode: "TRK-98421043",
        shippingAddress: "تهران، زعفرانیه، خیابان اعجازی، پلاک ۱۲",
        recipientName: "نازنین احمدی",
        recipientPhone: "09123456789",
        items: [
            { title: "دستگاه یووی الایدی سان ۵ مکس", qty: 1, price: 1250000, img: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=800&auto=format&fit=crop" },
            { title: "لاک‌ژل دیسکو مانلی (کد ۱۲)", qty: 1, price: 180000, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop" }
        ],
        timeline: [
            { title: "ثبت سفارش", time: "۰۴ تیر ۱۴۰۵ - ساعت ۱۰:۲۲", done: true },
            { title: "تأیید مالی و صدور فاکتور", time: "۰۴ تیر ۱۴۰۵ - ساعت ۱۰:۳۵", done: true },
            { title: "پردازش و کنترل کیفی در انبار مرکزی", time: "۰۴ تیر ۱۴۰۵ - ساعت ۱۴:۱۰", done: true },
            { title: "تحویل به شرکت پست جهت ارسال", time: "پیش‌بینی: فردا", done: false },
            { title: "تحویل نهایی به گیرنده", time: "پیش‌بینی: پس‌فردا", done: false }
        ]
    },
    {
        id: 10211,
        desc: "دستگاه سوهان برقی استرانگ ۲۰۷",
        price: 4900000,
        date: "۲۸ خرداد ۱۴۰۵",
        status: "تحویل داده شده",
        statusCode: "delivered",
        type: "تحویل نماینده رسمی (غرب تهران)",
        trackingCode: "REP-TH-20701",
        shippingAddress: "تهران، سعادت‌آباد، سرو غربی، پلاک ۲۴",
        recipientName: "نازنین احمدی",
        recipientPhone: "09123456789",
        items: [
            { title: "دستگاه سوهان برقی استرانگ ۲۰۷ اصلی", qty: 1, price: 4900000, img: "https://images.unsplash.com/photo-1632345031435-8727f6897353?q=80&w=800&auto=format&fit=crop" }
        ],
        timeline: [
            { title: "ثبت و ارجاع به نماینده", time: "۲۸ خرداد ۱۴۰۵ - ساعت ۱۱:۰۰", done: true },
            { title: "آماده‌سازی در انبار نماینده", time: "۲۸ خرداد ۱۴۰۵ - ساعت ۱۲:۱۵", done: true },
            { title: "تحویل داده شده به مشتری", time: "۲۸ خرداد ۱۴۰۵ - ساعت ۱۷:۴۰", done: true }
        ]
    }
];
let ticketsState = [
    { id: 5012, subject: "درخواست کاتالوگ چاپی", date: "۰۳ تیر ۱۴۰۵", status: "پاسخ داده شده", reply: "با سلام، مرسوله ارسال شد." }
];
let eventsState = [
    { id: 101, title: "مسترکلاس صدفسازی روسی", date: "۲۸ تیر ۱۴۰۵", city: "کرج", capacity: 20 },
    { id: 102, title: "کارگاه غلظت‌شناسی و سافت‌ژل", date: "۱۲ مرداد ۱۴۰۵", city: "تهران", capacity: 15 }
];

let registeredUsers = [
    {
        name: "نازنین احمدی",
        firstName: "نازنین",
        lastName: "احمدی",
        nationalCode: "۰۰۲۳۴۵۶۷۸۹",
        birthDate: "۱۳۷۵/۰۶/۱۵",
        email: "nazanin.ahmadi@gmail.com",
        phone: "09123456789",
        password: "123",
        city: "تهران",
        zip: "1987654321",
        address: "تهران، زعفرانیه، خیابان اعجازی، پلاک ۱۲"
    },
    {
        name: "سارا محمدی",
        firstName: "سارا",
        lastName: "محمدی",
        nationalCode: "۱۲۸۷۶۵۴۳۲۱",
        birthDate: "۱۳۷۸/۰۲/۲۴",
        email: "sara.mohammadi@yahoo.com",
        phone: "09121112233",
        password: "123",
        city: "اصفهان",
        zip: "8134567890",
        address: "اصفهان، چهارباغ بالا، کوچه بهار، پلاک ۴"
    }
];

let cart = [];
let currentUser = null;
let redirectAfterAuth = null;
let matchedRep = null;
let pendingOrder = null;
let toastTimer = null;
let currentAuthStep = 'phone'; // 'phone', 'otp', 'password', 'register'
let tempAuthPhone = '';

// ---------- ابزار ----------
function faNum(n) { return Number(n).toLocaleString('fa-IR'); }
function $(id) { return document.getElementById(id); }
