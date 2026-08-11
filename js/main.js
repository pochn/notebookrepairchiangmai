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

// ฟังก์ชันแสดงผลงานซ่อม (ฝั่งซ้าย)
// ฟังก์ชันแสดงผลงานซ่อม (Phase 4: Magazine Style Card)
function renderRepairs(repairs) {
    const container = document.getElementById("repairs-container");
    if (!container) return;

    let html = "";
    repairs.forEach(item => {
        html += `
            <div class="col-md-6">
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

    let html = "";
    articles.forEach(item => {
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