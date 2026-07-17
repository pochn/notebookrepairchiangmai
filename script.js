// Script.js - จัดการการทำงานของ Navbar อัตโนมัติเมื่อกดคลิกลิงก์เมนูบนมือถือ
document.addEventListener("DOMContentLoaded", function () {
    // ปิดเมนูแฮมเบอร์เกอร์อัตโนมัติเมื่อกดลิงก์ข้ามไปส่วนต่างๆ (สำหรับหน้าจอ Mobile)
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link:not(.dropdown-toggle)");
    const menuToggle = document.getElementById("navbarNav");
    
    if (menuToggle) {
        const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
        navLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                // เช็คว่าเมนูกำลังเปิดอยู่หรือไม่ก่อนสั่งปิด
                if (menuToggle.classList.contains("show")) {
                    bsCollapse.hide();
                }
            });
        });
    }

    // เพิ่ม Smooth Scroll สำหรับเมนูต่างๆ ทั่วทั้งเว็บ
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
