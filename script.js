// Основные переменные
let productsData = [];

// DOM элементы
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// Загрузка данных
async function loadProductsData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        productsData = data.products;
        renderProducts(productsData);
        setupEventListeners();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Рендер карточек товаров
function renderProducts(products) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'Ничего не найдено';
        productsGrid.appendChild(noResults);
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
        productsGrid.appendChild(productCard);
    });
}

// Рендер модального окна товара
function renderProductModal(product) {
    const modalId = `modal${product.id}`;

    // Проверяем, существует ли уже модальное окно
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

// Настройка обработчиков событий
function setupEventListeners() {
    document.addEventListener('click', function(e) {
        // Открытие модального окна товара
        const btn = e.target.closest('.product-btn');
        if (btn) {
            const productId = btn.getAttribute('data-product-id');
            const product = productsData.find(p => p.id == productId);
            if (product) {
                const modalId = renderProductModal(product);
                openModal(modalId);
            }
        }

        // Закрытие модального окна по клику вне контента
        if (e.target.classList.contains('modal')) {
            closeModal();
        }

        // Закрытие по крестику
        if (e.target.classList.contains('modal-close')) {
            closeModal();
        }

        // Открытие формы бронирования
        const modalBtn = e.target.closest('.modal-btn');
        if (modalBtn && !modalBtn.id) {
            const currentModal = modalBtn.closest('.modal');
            if (currentModal && currentModal.id !== 'successBookingModal' && currentModal.id !== 'bookingFormModal') {
                closeModal();
                openModal('bookingFormModal');
            }
        }
    });
    // Закрытие по Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Поиск и сортировка
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', performSort);
    }
}

// Функции для работы с модальными окнами
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

// Функции поиска и сортировки
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    const filteredProducts = productsData.filter(product => 
        product.title.toLowerCase().includes(query)
    );
    renderProducts(filteredProducts);
}

function performSort() {
    const sortBy = sortSelect.value;
    const sortedProducts = [...productsData];
    
    sortedProducts.sort((a, b) => {
        const aPrice = parseFloat(a.price.replace(/\s+/g, '').replace('₽', ''));
        const bPrice = parseFloat(b.price.replace(/\s+/g, '').replace('₽', ''));
        
        switch (sortBy) {
            case 'asc': return aPrice - bPrice;
            case 'desc': return bPrice - aPrice;
            case 'name': return a.title.localeCompare(b.title);
            default: return 0;
        }
    });
    
    renderProducts(sortedProducts);
}

function initBurgerMenu() {
    const burgerMenu = document.getElementById('burgerMenu');
    const mainNav = document.getElementById('mainNav');
    
    if (burgerMenu && mainNav) {
        burgerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            // Блокировка прокрутки при открытом меню
            if (mainNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Закрытие меню при клике на ссылку
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

// Инициализация
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
    
    // Закрытие модальных окон
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Обработка формы бронирования
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
    
    initBurgerMenu();
    loadProductsData();
});

