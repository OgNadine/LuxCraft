let productsData = [];

const newProductsGrid = document.getElementById('newProductsGrid');
const popularProductsGrid = document.getElementById('popularProductsGrid');

async function loadProductsData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        productsData = data.products;
        
        renderProducts(newProductsGrid, productsData.slice(0, 3));
        renderProducts(popularProductsGrid, productsData.slice(3, 6));
        
        setupEventListeners();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

function renderProducts(gridElement, products) {
    if (!gridElement) return;
    
    gridElement.innerHTML = '';
    
    if (products.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'Ничего не найдено';
        gridElement.appendChild(noResults);
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image ${product.image}"></div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">${product.price}</p>
                <button class="product-btn" data-modal="modal${product.id}" data-product-id="${product.id}">Подробнее</button>
            </div>
        `;
        gridElement.appendChild(productCard);
    });
}

function renderProductModal(product) {
    const modalId = `modal${product.id}`;

    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal modal-product';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div class="modal-body">
                    <div class="modal-image ${product.image}"></div>
                    <div class="modal-info">
                        <h2>${product.title}</h2>
                        <p class="modal-price">${product.price}</p>
                        <p class="modal-description">${product.description}</p>
                        <ul class="modal-features">
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                        <button class="btn modal-btn">Забронировать</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    return modalId;
}

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        const productBtn = e.target.closest('.product-btn');
        if (productBtn) {
            const productId = productBtn.getAttribute('data-product-id');
            const product = productsData.find(p => p.id == productId);
            if (product) {
                const modalId = renderProductModal(product);
                openModal(modalId);
            }
        }

        const modalBtn = e.target.closest('.modal-btn');
        if (modalBtn && !modalBtn.id) {
            const currentModal = modalBtn.closest('.modal');
            if (currentModal && currentModal.id !== 'successBookingModal' && currentModal.id !== 'bookingFormModal') {
                closeModal();
                openModal('bookingFormModal');
            }
        }

        if (e.target.classList.contains('modal-close')) {
            closeModal();
        }

        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function openModal(modalId) {
    closeModal();
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
}

function initCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    if (carouselItems.length === 0) return;
    
    let currentItem = 0;
    let carouselInterval;
    
    function showNextItem() {
        carouselItems[currentItem].classList.remove('active');
        currentItem = (currentItem + 1) % carouselItems.length;
        setTimeout(() => {
            carouselItems[currentItem].classList.add('active');
        }, 50);
    }
    
    function startCarousel() {
        carouselItems[0].classList.add('active');
        carouselInterval = setInterval(showNextItem, 5000);
    }
    
    startCarousel();
    
    const banner = document.querySelector('.banner');
    if (banner) {
        banner.addEventListener('mouseenter', () => {
            clearInterval(carouselInterval);
        });
        
        banner.addEventListener('mouseleave', () => {
            carouselInterval = setInterval(showNextItem, 5000);
        });
    }
}

function initBurgerMenu() {
    const burgerMenu = document.getElementById('burgerMenu');
    const mainNav = document.getElementById('mainNav');
    
    if (burgerMenu && mainNav) {
        burgerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            if (mainNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                burgerMenu.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme)) {
        document.body.classList.add('dark-mode');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            themeToggle.setAttribute('aria-label', isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему');
        });
    }
    
    const bookingForm = document.getElementById('bookingForm');
    const successModalBtn = document.getElementById('closeSuccessBtn');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value.trim();
            const phone = document.getElementById('phone').value.trim();
            
            if (fullName && phone) {
                closeModal();
                openModal('successBookingModal');
                bookingForm.reset();
            } else {
                alert('Пожалуйста, заполните все поля.');
            }
        });
    }
    
    if (successModalBtn) {
        successModalBtn.addEventListener('click', closeModal);
    }
    
    initCarousel();
    initBurgerMenu();
    loadProductsData();
});