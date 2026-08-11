/* ==========================================
   Phase 1: Navbar Scroll & State Logic
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {
    // รอให้ navbar.html ถูกโหลดผ่าน main.js เข้ามาก่อน
    const checkNavbarLoaded = setInterval(() => {
        const topBar = document.getElementById("topBar");
        const mainNavbar = document.getElementById("mainNavbar");

        if (topBar && mainNavbar) {
            clearInterval(checkNavbarLoaded);
            initNavbarScroll(topBar, mainNavbar);
        }
    }, 50);
});

function initNavbarScroll(topBar, mainNavbar) {
    const scrollThreshold = 40; // ระยะ Scroll ที่จะเริ่มเปลี่ยน State (px)

    function handleScroll() {
        const currentScroll = window.scrollY || document.documentElement.scrollTop;

        if (currentScroll > scrollThreshold) {
            // เมื่อเลื่อนจอลง
            topBar.classList.add("topbar-hidden");
            mainNavbar.classList.add("navbar-scrolled");
        } else {
            // เมื่ออยู่ด้านบนสุด
            topBar.classList.remove("topbar-hidden");
            mainNavbar.classList.remove("navbar-scrolled");
        }
    }

    // ฟังเหตุการณ์การ Scroll
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // เรียกทำงาน 1 ครั้งตอนโหลดหน้า
    handleScroll();
}