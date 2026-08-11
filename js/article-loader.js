/**
 * Article Loader - Load articles from JSON and render into template
 * URL format: article-template.html?id=article-id
 */

async function loadArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    // Elements
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const articleContent = document.getElementById('article-content');
    const articleHeroContent = document.getElementById('article-hero-content');
    
    try {
        // Fetch articles data
        const response = await fetch('../data/articles.json');
        if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลบทความ');
        
        const data = await response.json();
        const articles = data.articles;
        
        // Find article by ID
        const article = articles.find(a => a.id === articleId);
        
        if (!article) {
            throw new Error(`ไม่พบบทความที่มี ID: ${articleId}`);
        }
        
        // Update page title
        document.title = article.title;
        document.querySelector('meta[name="description"]').setAttribute('content', article.metaDescription);
        document.querySelector('meta[name="keywords"]').setAttribute('content', article.metaKeywords);
        
        // Populate hero section
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-subtitle').textContent = article.problem + ' | ' + article.brand + ' ' + article.model;
        
        // Populate metadata
        document.getElementById('article-date').textContent = formatDate(article.date);
        document.getElementById('article-readtime').textContent = article.readTime;
        document.getElementById('article-author').textContent = article.author;
        
        // Populate tags
        document.getElementById('article-brand').textContent = article.brand;
        document.getElementById('article-model').textContent = article.model;
        document.getElementById('article-problem').textContent = article.problem;
        
        // Populate featured image if exists
        if (article.image) {
            const img = document.getElementById('article-image');
            img.src = article.image;
            img.alt = article.title;
            img.classList.remove('d-none');
        }
        
        // Populate article body
        const bodyContainer = document.getElementById('article-body');
        bodyContainer.innerHTML = '';
        
        if (article.content && Array.isArray(article.content)) {
            article.content.forEach(block => {
                const element = createContentBlock(block);
                if (element) {
                    bodyContainer.appendChild(element);
                }
            });
        }
        
        // Populate related articles
        loadRelatedArticles(articles, articleId, article.brand);
        
        // Hide loading and show content
        loading.classList.add('d-none');
        articleContent.classList.remove('d-none');
        
    } catch (err) {
        console.error('Error loading article:', err);
        loading.classList.add('d-none');
        error.classList.remove('d-none');
        error.innerHTML = `<i class="fa-solid fa-exclamation-circle"></i> ${err.message}`;
    }
}

/**
 * Create content block element based on type
 */
function createContentBlock(block) {
    const container = document.createElement('div');
    
    switch (block.type) {
        case 'heading':
            const heading = document.createElement(`h${block.level}`);
            heading.textContent = block.text;
            return heading;
            
        case 'paragraph':
            const paragraph = document.createElement('p');
            paragraph.textContent = block.text;
            return paragraph;
            
        case 'list':
            const list = document.createElement('ul');
            if (Array.isArray(block.items)) {
                block.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    list.appendChild(li);
                });
            }
            return list;
            
        case 'image':
            const img = document.createElement('img');
            img.src = block.src;
            img.alt = block.alt || '';
            img.className = 'article-image';
            return img;
            
        case 'cta':
            const ctaBtn = document.createElement('a');
            ctaBtn.href = block.link;
            ctaBtn.className = 'btn btn-primary' + (block.style === 'secondary' ? '-outline' : '');
            ctaBtn.textContent = block.text;
            ctaBtn.style.marginTop = '20px';
            ctaBtn.style.marginRight = '10px';
            return ctaBtn;
            
        default:
            return null;
    }
}

/**
 * Load and display related articles
 */
function loadRelatedArticles(articles, currentId, currentBrand) {
    const container = document.getElementById('related-articles');
    if (!container) return;
    
    // Filter related articles (same brand, different article)
    const related = articles
        .filter(a => a.id !== currentId && a.brand === currentBrand)
        .slice(0, 3); // Show first 3
    
    // If less than 3 same brand, add other brands
    if (related.length < 3) {
        const other = articles
            .filter(a => a.id !== currentId && a.brand !== currentBrand)
            .slice(0, 3 - related.length);
        related.push(...other);
    }
    
    // If still no articles, show message
    if (related.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">ไม่มีบทความอื่นในขณะนี้</div>';
        return;
    }
    
    // Render articles
    container.innerHTML = '';
    related.forEach(article => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const card = document.createElement('a');
        card.href = `article-template.html?id=${article.id}`;
        card.style.textDecoration = 'none';
        card.style.color = 'inherit';
        
        card.innerHTML = `
            <div class="card h-100 border-0 shadow-sm" style="transition: transform 0.3s ease;">
                <div style="background: linear-gradient(135deg, #090e17 0%, #111b2e 100%); height: 200px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img src="${article.image || 'images/placeholder.jpg'}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                </div>
                <div class="card-body">
                    <h6 class="card-title fw-bold text-dark">${article.title.substring(0, 50)}...</h6>
                    <p class="card-text text-muted small">${article.metaDescription.substring(0, 60)}...</p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="badge bg-light text-dark">${article.brand}</span>
                        <span class="badge bg-light text-dark">${article.problem}</span>
                    </div>
                </div>
            </div>
        `;
        
        card.onmouseover = function() {
            this.querySelector('.card').style.transform = 'translateY(-4px)';
        };
        
        card.onmouseout = function() {
            this.querySelector('.card').style.transform = 'translateY(0)';
        };
        
        col.appendChild(card);
        container.appendChild(col);
    });
}

/**
 * Format date to Thai format
 */
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('th-TH', options);
}

// Load article when page is ready
document.addEventListener('DOMContentLoaded', loadArticle);
