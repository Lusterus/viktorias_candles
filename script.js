document.addEventListener('DOMContentLoaded', () => {
  // --- Год в футере ---
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Мобильное меню ---
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileMenu.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        mobileMenu.classList.add('hidden');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- HERO анимация через IntersectionObserver ---
  const hero = document.querySelector('.hero-fade');
  if (hero) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            hero.classList.add('visible');
            obs.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(hero);
  }

  // --- ДАННЫЕ КАТАЛОГА ---
  const allProducts = [
    {
      id: 'classic-pillar-1',
      name: 'Классическая свеча-столбик',
      img: 'images/image1.jpg',
      price: 390,
      category: 'pillar',
      aroma: 'без аромата',
      color: 'тёплый бежевый',
      volume: '5×10 см',
      isNew: false,
      isBestseller: true,
      short: 'Базовая свеча для интерьера и сервировки стола.'
    },
    {
      id: 'twisted-pair',
      name: 'Витые свечи (набор 2 шт.)',
      img: 'images/image2.jpg',
      price: 520,
      category: 'pillar',
      aroma: 'лёгкий ванильный',
      color: 'молочный / пудровый',
      volume: '25 см',
      isNew: false,
      isBestseller: true,
      short: 'Элегантная пара для романтического вечера или сервировки.'
    },
    {
      id: 'bubble-candle',
      name: 'Свеча Bubble',
      img: 'images/image3.jpg',
      price: 450,
      category: 'figure',
      aroma: 'хлопок',
      color: 'кремовый',
      volume: '6×6 см',
      isNew: true,
      isBestseller: true,
      short: 'Эстетичный акцент в интерьере.'
    },
    {
      id: 'body-femme',
      name: 'Фигурная свеча «Фигура»',
      img: 'images/image4.jpg',
      price: 480,
      category: 'figure',
      aroma: 'пудровый',
      color: 'тёплый айвори',
      volume: '10 см',
      isNew: false,
      isBestseller: true,
      short: 'Деликатный силуэт в мягком тоне.'
    },
    {
      id: 'wedding-taper-set',
      name: 'Свадебный набор свечей',
      img: 'images/image5.jpg',
      price: 1390,
      category: 'wedding',
      aroma: 'белый чай',
      color: 'айвори',
      volume: '3 свечи',
      isNew: true,
      isBestseller: false,
      short: 'Набор для свадебной церемонии или стола.'
    },
    {
      id: 'gift-box-mini',
      name: 'Подарочный набор «Мини»',
      img: 'images/image6.jpg',
      price: 890,
      category: 'set',
      aroma: 'ваниль / хлопок',
      color: 'микс пастель',
      volume: '3–4 свечи',
      isNew: false,
      isBestseller: true,
      short: 'Готовое решение для небольшого, но очень тёплого подарка.'
    },
    {
      id: 'aroma-glass',
      name: 'Аромасвеча в стекле',
      img: 'images/image7.jpg',
      price: 690,
      category: 'aroma',
      aroma: 'ваниль, хлопок, лаванда',
      color: 'молочный воск',
      volume: '120 мл',
      isNew: true,
      isBestseller: false,
      short: 'Уютный аромат для вечеров дома.'
    },
    {
      id: 'big-gift-box',
      name: 'Премиум набор «Для неё»',
      img: 'images/image8.jpg',
      price: 1990,
      category: 'set',
      aroma: 'микс нежных ароматов',
      color: 'нюдовая палитра',
      volume: '5–7 свечей',
      isNew: true,
      isBestseller: true,
      short: 'Подарочный бокс с фигурными и классическими свечами.'
    }
  ];

  // --- Элементы каталога ---
  const catalogGrid = document.getElementById('catalog-grid');
  const loadMoreBtn = document.getElementById('loadMore');
  const filterTags = document.getElementById('filterTags');
  const sortSelect = document.getElementById('sortSelect');

  if (!catalogGrid || !loadMoreBtn || !filterTags || !sortSelect) {
    return;
  }

  let activeFilter = 'all';
  let sortMode = 'popular';
  let visibleProducts = [];
  let shownCount = 0;
  const STEP = 6;

  function applyFilter(products) {
    if (activeFilter === 'all') return products;
    if (activeFilter === 'aroma') {
      return products.filter(
        p => p.category === 'aroma' || (p.aroma && p.aroma !== 'без аромата')
      );
    }
    return products.filter(p => p.category === activeFilter);
  }

  function applySort(products) {
    const sorted = [...products];
    switch (sortMode) {
      case 'priceAsc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'new':
        sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
        break;
    }
    return sorted;
  }

  function recomputeVisible() {
    const filtered = applyFilter(allProducts);
    visibleProducts = applySort(filtered);
    shownCount = 0;
    catalogGrid.innerHTML = '';
    renderNextBatch();
  }

  function createProductCard(product) {
    const card = document.createElement('article');
    card.className =
      'product-card bg-white/90 rounded-2xl p-3 shadow flex flex-col h-full';
    card.setAttribute('itemscope', '');
    card.setAttribute('itemtype', 'https://schema.org/Product');

    const hasAroma = product.aroma && product.aroma !== 'без аромата';
    const aromaText = hasAroma
      ? `Аромат: ${product.aroma}`
      : 'Без навязчивого аромата';

    const badges = [];
    if (product.isNew) badges.push('<span class="badge badge-new">новинка</span>');
    if (product.isBestseller) badges.push('<span class="badge badge-hit">хит</span>');

    const orderText = encodeURIComponent(
      `Здравствуйте! Хочу заказать "${product.name}" из каталога Viktoria’s candles.`
    );

    card.innerHTML = `
      <div class="mb-3 relative">
        ${badges.length ? `<div class="absolute top-2 left-2 space-x-1">${badges.join('')}</div>` : ''}
        <img src="${product.img}"
             alt="${product.name}"
             class="rounded-xl w-full aspect-[2/3] object-cover"
             loading="lazy"
             itemprop="image" />
      </div>
      <h3 class="font-semibold text-rose-600 mb-1" itemprop="name">${product.name}</h3>
      <p class="text-[11px] text-gray-500 mb-1" itemprop="description">${product.short}</p>
      <p class="text-[11px] text-gray-500">${aromaText}</p>
      <p class="text-[11px] text-gray-400 mb-2">
        Цвет: ${product.color} · Размер/объём: ${product.volume}
      </p>
      <div class="mt-auto flex items-baseline justify-between gap-2 pt-2 border-t border-rose-50"
           itemprop="offers"
           itemscope
           itemtype="https://schema.org/Offer">
        <div class="text-rose-600 font-semibold text-base">
          <span itemprop="price" content="${product.price}">от ${product.price} ₽</span>
          <meta itemprop="priceCurrency" content="RUB" />
        </div>
        <a href="https://t.me/viktoriascandles?text=${orderText}"
           target="_blank"
           rel="noopener"
           class="text-[11px] px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition">
          Обсудить заказ
        </a>
      </div>
    `;

    return card;
  }

  function renderNextBatch() {
    const slice = visibleProducts.slice(shownCount, shownCount + STEP);
    if (!slice.length) {
      updateLoadMoreVisibility();
      return;
    }

    const fragment = document.createDocumentFragment();

    slice.forEach((product, index) => {
      const card = createProductCard(product);
      fragment.appendChild(card);
      requestAnimationFrame(() => {
        setTimeout(() => {
          card.classList.add('visible');
        }, 60 * index);
      });
    });

    catalogGrid.appendChild(fragment);
    shownCount += slice.length;
    updateLoadMoreVisibility();
  }

  function updateLoadMoreVisibility() {
    if (shownCount >= visibleProducts.length) {
      loadMoreBtn.classList.add('hidden');
    } else {
      loadMoreBtn.classList.remove('hidden');
    }
  }

  // --- Фильтры ---
  filterTags.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-chip');
    if (!btn) return;

    const value = btn.getAttribute('data-filter');
    if (!value || value === activeFilter) return;

    activeFilter = value;

    [...filterTags.querySelectorAll('.filter-chip')].forEach(b => {
      b.classList.toggle('active', b === btn);
    });

    recomputeVisible();
  });

  // --- Сортировка ---
  sortSelect.addEventListener('change', () => {
    sortMode = sortSelect.value;
    recomputeVisible();
  });

  // --- Кнопка "Показать ещё" ---
  loadMoreBtn.addEventListener('click', (event) => {
    event.preventDefault();
    renderNextBatch();
  });

  // --- Старт каталога ---
  recomputeVisible();
});
