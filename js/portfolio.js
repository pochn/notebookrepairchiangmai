document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const container = document.getElementById('all-portfolio-container');
    const searchInput = document.getElementById('portfolio-search');
    const brandSelect = document.getElementById('portfolio-brand');

    if (!container) return;

    // Load posts.json
    fetch('data/posts.json')
        .then(r => r.json())
        .then(data => {
            let repairs = Array.isArray(data.repairs) ? data.repairs.slice() : [];

            // Sort newest -> oldest using helper from main.js if available, else fallback
            if (typeof newestFirst === 'function') {
                repairs = newestFirst(repairs);
            } else {
                // fallback: reverse
                repairs = repairs.slice().reverse();
            }

            // Populate brand filter
            populateBrandFilter(repairs);

            // Initial render (all)
            renderList(repairs);

            // Wire events
            searchInput && searchInput.addEventListener('input', () => renderFiltered(repairs));
            brandSelect && brandSelect.addEventListener('change', () => renderFiltered(repairs));

            function renderFiltered(list) {
                const q = (searchInput && searchInput.value || '').trim().toLowerCase();
                const brand = (brandSelect && brandSelect.value) || '';
                const filtered = list.filter(item => {
                    let ok = true;
                    if (brand) ok = (item.brand || '').toLowerCase() === brand.toLowerCase();
                    if (!ok) return false;
                    if (!q) return true;
                    const hay = ((item.title || '') + ' ' + (item.symptom || '') + ' ' + (item.brand || '')).toLowerCase();
                    return hay.indexOf(q) !== -1;
                });
                renderList(filtered);
            }

            function populateBrandFilter(list) {
                if (!brandSelect) return;
                const brands = Array.from(new Set(list.map(i => (i.brand || '').trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'th'));
                brands.forEach(b => {
                    const opt = document.createElement('option');
                    opt.value = b;
                    opt.textContent = b;
                    brandSelect.appendChild(opt);
                });
            }

            function renderList(list) {
                if (!container) return;
                if (!Array.isArray(list) || list.length === 0) {
                    container.innerHTML = '<div class="col-12"><div class="alert alert-info">ไม่พบผลงานซ่อมตามการค้นหา</div></div>';
                    return;
                }
                const html = list.map(item => renderCard(item)).join('\n');
                container.innerHTML = html;
            }

            function renderCard(item) {
                // Use item.id for linking to post.html?id=... ; fallback to item.link if id missing
                const postHref = item.id ? `post.html?id=${encodeURIComponent(item.id)}` : (item.link || '#');
                const img = item.image || 'https://placehold.co/400x300/1c2541/ffffff?text=Repair';
                // optionally show date if present
                const dateLabel = item.date ? `<small class="text-muted">${item.date}</small>` : '';

                return `
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="ratio ratio-4x3">
                                <img src="${img}" class="card-img-top object-fit-cover" alt="${escapeHtml(item.title||'') }" onerror="this.src='https://placehold.co/400x300/1c2541/ffffff?text=Repair'"/>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title mb-1">${escapeHtml(item.title || (item.brand || 'ผลงาน'))}</h5>
                                <p class="card-text text-muted small mb-2 line-clamp-2">${escapeHtml(item.symptom || '')}</p>
                                <div class="mt-auto d-flex justify-content-between align-items-center">
                                    <div>${dateLabel}</div>
                                    <a href="${postHref}" class="btn btn-primary btn-sm">อ่านรายละเอียด</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

        })
        .catch(err => {
            console.error('Error loading portfolio data:', err);
            const container = document.getElementById('all-portfolio-container');
            if (container) container.innerHTML = '<div class="col-12"><div class="alert alert-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</div></div>';
        });

    // small helper
    function escapeHtml(str){
        if (!str) return '';
        return String(str).replace(/[&<>\"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":"&#39;"})[m]; });
    }
});