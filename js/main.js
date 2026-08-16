document.addEventListener("DOMContentLoaded", function () {
    // 1. โหลด Navbar และ Footer เข้ามาอัตโนมัติ
    loadComponent("navbar-placeholder", "components/navbar.html");
    loadComponent("footer-placeholder", "components/footer.html");

    // 2. ดึงข้อมูลจาก posts.json มาแสดงผลงานซ่อมและบทความ
    loadPostsData();
});

// ฟังก์ชันโหลด HTML Components
function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => {
            console.error("Error loading component:", error);
        });
}

// ฟังก์ชันดึงข้อมูลเคสซ่อมและบทความจาก JSON
function loadPostsData() {
    fetch("data/posts.json")
        .then(response => response.json())
        .then(data => {
            renderRepairs(data.repairs);
            renderArticles(data.articles);
        })
        .catch(error => console.error("Error loading posts data:", error));
}

// ช่วยแปลงวันที่ภาษาไทย เช่น "15 ก.ค. 2026" เป็น timestamp
function parseThaiDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const months = {
        'ม.ค.':1,'ก.พ.':2,'มี.ค.':3,'เม.ย.':4,'พ.ค.':5,'มิ.ย.':6,'ก.ค.':7,'ส.ค.':8,'ก.ย.':9,'ต.ค.':10,'พ.ย.':11,'ธ.ค.':12,
        'มกราคม':1,'กุมภาพันธ์':2,'มีนาคม':3,'เมษายน':4,'พฤษภาคม':5,'มิถุนายน':6,'กรกฎาคม':7,'สิงหาคม':8,'กันยายน':9,'ตุลาคม':10,'พฤศจิกายน':11,'ธันวาคม':12
    };
    const m = dateStr.match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/);
    if (!m) return null;
    const day = parseInt(m[1],10);
    const monStr = m[2];
    const year = parseInt(m[3],10);
    let mon = months[monStr];
    if (!mon) {
        mon = months[monStr.replace(/\./g,'')];
    }
    if (!mon) return null;
    return new Date(year, mon-1, day).getTime();
}

// คืนค่า timestamp สำหรับไอเท็ม โดยพยายามอ่านจาก date, createdAt หรือ id (ตัวเลข)
function getItemTimestamp(item) {
    if (!item) return null;
    if (item.date) {
        const t = parseThaiDate(item.date);
        if (t) return t;
        const p = Date.parse(item.date);
        if (!isNaN(p)) return p;
    }
    if (item.createdAt) {
        const p = Date.parse(item.createdAt);
        if (!isNaN(p)) return p;
    }
    if (item.id) {
        const m = item.id.match(/(\d+)/);
        if (m) return parseInt(m[1],10);
    }
    return null;
}

// เรียงรายการจากใหม่ไปเก่า (newest -> oldest). ถ้าไม่มีวันที่ จะกลับลำดับ
function newestFirst(arr) {
    if (!Array.isArray(arr)) return [];
    const list = arr.map((item, idx) => ({item, idx, ts: getItemTimestamp(item)}));
    const anyTs = list.some(x => typeof x.ts === 'number');
    if (anyTs) {
        list.sort((a,b) => {
            const ta = (typeof a.ts === 'number') ? a.ts : -a.idx;
            const tb = (typeof b.ts === 'number') ? b.ts : -b.idx;
            return tb - ta; // desc
        });
        return list.map(x => x.item);
    }
    // ถ้าไม่มี timestamp ให้กลับลำดับ (สมมติว่า array เดิมเป็น oldest->newest)
    return arr.slice().reverse();
}

// ฟังก์ชันแสดงผลงานซ่อม (ฝั่งซ้าย)
// ฟังก์ชันแสดงผลงานซ่อม (Phase 4: Magazine Style Card)
function renderRepairs(repairs) {
    const container = document.getElementById("repairs-container");
    if (!container) return;

    // เรียงจากใหม่ไปเก่า แล้วจำกัดแสดงเฉพาะ 6 รายการล่าสุด
    const items = newestFirst(repairs).slice(0, 6);

    let html = "";
    items.forEach(item => {
        html += `
            <div class="col-md-4">
                <div class="portfolio-card shadow-sm d-flex flex-column">
                    <div class="portfolio-img-container">
                        <img src="${item.image}" class="portfolio-img" alt="${item.title}" onerror="this.src='https://placehold.co/400x300/1c2541/ffffff?text=${item.brand}+Repair'">
                        <span class="portfolio-brand-badge"><i class="fa-solid fa-laptop me-1"></i>${item.brand}</span>
                        <span class="portfolio-status-badge"><i class="fa-solid fa-check me-1"></i>ซ่อมสำเร็จ</span>
                    </div>
                    <div class="portfolio-body d-flex flex-column flex-grow-1">
                        <h6 class="portfolio-title">${item.title}</h6>
                        <p class="portfolio-symptom flex-grow-1">${item.symptom}</p>
                        <a href="${item.link}" class="btn btn-outline-secondary btn-sm w-100 portfolio-btn d-flex align-items-center justify-content-center gap-1">
                            <span>อ่านเคสซ่อมนี้</span>
                            <i class="fa-solid fa-arrow-right fs-xs"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ฟังก์ชันแสดงบทความล่าสุด (ฝั่งขวา)
// ฟังก์ชันแสดงบทความ (Phase 5: Sidebar Style)
function renderArticles(articles) {
    const container = document.getElementById("articles-container");
    if (!container) return;

    // เรียงจากใหม่ไปเก่า แล้วแสดงสูงสุด 6 รายการ
    const items = newestFirst(articles).slice(0, 6);

    let html = "";
    items.forEach(item => {
        html += `
            <a href="${item.link}" class="text-decoration-none text-dark d-block">
                <div class="article-item">
                    <div class="article-thumb-wrapper">
                        <img src="${item.image}" class="article-thumb" alt="${item.title}" onerror="this.src='https://placehold.co/200x150/1c2541/ffffff?text=Article'">
                        <span class="article-category-badge">${item.category || 'เกร็ดความรู้'}</span>
                    </div>
                    <div class="article-content">
                        <h6 class="article-title">${item.title}</h6>
                        <div class="article-meta">
                            <span><i class="fa-regular fa-clock me-1"></i>${item.date || 'อ่าน 3 นาที'}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
    });
    container.innerHTML = html;
}