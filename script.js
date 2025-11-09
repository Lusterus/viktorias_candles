document.addEventListener('DOMContentLoaded', () => {
  // Год в футере
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- Мобильное меню -----
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileToggle && mobileMenu) {
    const OPEN = 'menu-open';
    const HIDDEN = 'hidden';
    const isOpen = () => mobileMenu.classList.contains(OPEN);

    const openMenu = () => {
      mobileMenu.classList.remove(HIDDEN);
      requestAnimationFrame(() => mobileMenu.classList.add(OPEN));
      mobileToggle.classList.remove('no-focus'); // разрешаем фокус/обводку только при открытом меню
      mobileToggle.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      if (!isOpen()) return;
      mobileMenu.classList.remove(OPEN);
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.classList.add('no-focus'); // запретить обводку
      mobileToggle.blur(); // снять фокус (iOS/Safari)
      setTimeout(() => {
        if (!mobileMenu.classList.contains(OPEN)) mobileMenu.classList.add(HIDDEN);
        mobileToggle.classList.remove('no-focus'); // вернуть норму после скрытия
      }, 200);
    };

    // Тоггл
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen()) {
        closeMenu();
        setTimeout(() => mobileToggle.blur(), 0); // доп.тик для iOS
      } else {
        openMenu();
      }
    });

    // Убираем mouse-focus (не ломая keyboard-focus)
    mobileToggle.addEventListener('mousedown', () => {
      mobileToggle.classList.add('no-focus');
    });
    mobileToggle.addEventListener('mouseup', () => {
      setTimeout(() => mobileToggle.classList.remove('no-focus'), 0);
    });

    // Клик по ссылке в меню — закрыть
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') closeMenu();
    });

    // Клик вне меню — закрыть
    document.addEventListener('click', (e) => {
      if (isOpen() && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Скролл — закрыть и снять фокус
    window.addEventListener('scroll', () => {
      if (isOpen()) closeMenu();
      mobileToggle.blur();
      mobileToggle.classList.add('no-focus');
      setTimeout(() => mobileToggle.classList.remove('no-focus'), 150);
    }, { passive: true });
  }

  // ----- HERO анимация -----
  const hero = document.querySelector('.hero-fade');
  if (hero) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        for (const en of entries) {
          if (en.isIntersecting) { hero.classList.add('visible'); obs.disconnect(); }
        }
      }, { threshold: 0.25 });
      io.observe(hero);
    } else {
      hero.classList.add('visible');
    }
  }

  // ----- Каталог (примерные данные) -----
  const allProducts = [
    { id:'classic-pillar-1', name:'Классическая свеча-столбик', img:'images/image1.jpg', price:390, category:'pillar', aroma:'без аромата', color:'тёплый бежевый', volume:'5×10 см', isNew:false, isBestseller:true, short:'Базовая свеча для интерьера и сервировки стола.' },
    { id:'twisted-pair', name:'Витые свечи (набор 2 шт.)', img:'images/image2.jpg', price:520, category:'pillar', aroma:'лёгкий ванильный', color:'молочный / пудровый', volume:'25 см', isNew:false, isBestseller:true, short:'Элегантная пара для романтического вечера или сервировки.' },
    { id:'bubble-candle', name:'Свеча Bubble', img:'images/image3.jpg', price:450, category:'figure', aroma:'хлопок', color:'кремовый', volume:'6×6 см', isNew:true, isBestseller:true, short:'Эстетичный акцент в интерьере.' },
    { id:'body-femme', name:'Фигурная свеча «Фигура»', img:'images/image4.jpg', price:480, category:'figure', aroma:'пудровый', color:'тёплый айвори', volume:'10 см', isNew:false, isBestseller:true, short:'Деликатный силуэт в мягком тоне.' },
    { id:'wedding-taper-set', name:'Свадебный набор свечей', img:'images/image5.jpg', price:1390, category:'wedding', aroma:'белый чай', color:'айвори', volume:'3 свечи', isNew:true, isBestseller:false, short:'Набор для свадебной церемонии или стола.' },
    { id:'gift-box-mini', name:'Подарочный набор «Мини»', img:'images/image6.jpg', price:890, category:'set', aroma:'ваниль / хлопок', color:'микс пастель', volume:'3–4 свечи', isNew:false, isBestseller:true, short:'Готовое решение для небольшого, но очень тёплого подарка.' },
    { id:'aroma-glass', name:'Аромасвеча в стекле', img:'images/image7.jpg', price:690, category:'aroma', aroma:'ваниль, хлопок, лаванда', color:'молочный воск', volume:'120 мл', isNew:true, isBestseller:false, short:'Уютный аромат для вечеров дома.' },
    { id:'big-gift-box', name:'Премиум набор «Для неё»', img:'images/image8.jpg', price:1990, category:'set', aroma:'микс нежных ароматов', color:'нюдовая палитра', volume:'5–7 свечей', isNew:true, isBestseller:true, short:'Подарочный бокс с фигурными и классическими свечами.' }
  ];

  const catalogGrid = document.getElementById('catalog-grid');
  const loadMoreBtn = document.getElementById('loadMore');
  const filterTags = document.getElementById('filterTags');
  const sortSelect = document.getElementById('sortSelect');
  if (!catalogGrid || !loadMoreBtn || !filterTags || !sortSelect) return;

  let activeFilter = 'all';
  let sortMode = 'popular';
  let visible = [];
  let shown = 0;
  const STEP = 6;

  const applyFilter = (arr) => activeFilter === 'all'
    ? arr
    : activeFilter === 'aroma'
      ? arr.filter(p => p.category === 'aroma' || (p.aroma && p.aroma !== 'без аромата'))
      : arr.filter(p => p.category === activeFilter);

  const applySort = (arr) => {
    const s = arr.slice();
    if (sortMode === 'priceAsc') s.sort((a,b)=>a.price-b.price);
    else if (sortMode === 'priceDesc') s.sort((a,b)=>b.price-a.price);
    else if (sortMode === 'new') s.sort((a,b)=>Number(b.isNew)-Number(a.isNew));
    else s.sort((a,b)=>Number(b.isBestseller)-Number(a.isBestseller));
    return s;
  };

  const recompute = () => {
    visible = applySort(applyFilter(allProducts));
    shown = 0;
    catalogGrid.innerHTML = '';
    renderNext();
  };

  const createCard = (p) => {
    const orderUrl = 'https://t.me/viktoriascandles?text=' + encodeURIComponent('Здравствуйте! Хочу заказать "'+p.name+'" из каталога Viktoria’s candles.');
    const hasAroma = p.aroma && p.aroma !== 'без аромата';
    const badges = (p.isNew ? '<span class="badge badge-new">новинка</span>' : '') + (p.isBestseller ? '<span class="badge badge-hit">хит</span>' : '');

    const el = document.createElement('article');
    el.className = 'product-card bg-white/90 rounded-2xl p-3 shadow flex flex-col h-full';
    el.setAttribute('itemscope',''); el.setAttribute('itemtype','https://schema.org/Product');
    el.innerHTML =
      '<div class="mb-3 relative">'+
        (badges ? '<div class="absolute top-2 left-2 space-x-1">'+badges+'</div>' : '')+
        '<img src="'+p.img+'" alt="'+p.name+'" class="rounded-xl w-full aspect-[2/3] object-cover" loading="lazy" itemprop="image" />'+
      '</div>'+
      '<h3 class="font-semibold text-rose-600 mb-1" itemprop="name">'+p.name+'</h3>'+
      '<p class="text-[11px] text-gray-500 mb-1" itemprop="description">'+p.short+'</p>'+
      '<p class="text-[11px] text-gray-500">'+(hasAroma ? ('Аромат: '+p.aroma) : 'Без навязчивого аромата')+'</p>'+
      '<p class="text-[11px] text-gray-400 mb-2">Цвет: '+p.color+' · Размер/объём: '+p.volume+'</p>'+
      '<div class="mt-auto flex items-baseline justify-between gap-2 pt-2 border-t border-rose-50" itemprop="offers" itemscope itemtype="https://schema.org/Offer">'+
        '<div class="text-rose-600 font-semibold text-base"><span itemprop="price" content="'+p.price+'">от '+p.price+' ₽</span><meta itemprop="priceCurrency" content="RUB" /></div>'+
        '<a href="'+orderUrl+'" target="_blank" rel="noopener" class="text-[11px] px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition">Обсудить заказ</a>'+
      '</div>';
    return el;
  };

  const renderNext = () => {
    const slice = visible.slice(shown, shown + STEP);
    if (!slice.length) return updateLoadMore();
    const frag = document.createDocumentFragment();
    slice.forEach((p, i) => {
      const card = createCard(p);
      frag.appendChild(card);
      requestAnimationFrame(() => setTimeout(() => card.classList.add('visible'), 60*i));
    });
    catalogGrid.appendChild(frag);
    shown += slice.length;
    updateLoadMore();
  };

  const updateLoadMore = () => {
    if (shown >= visible.length) loadMoreBtn.classList.add('hidden');
    else loadMoreBtn.classList.remove('hidden');
  };

  filterTags.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip'); if (!btn) return;
    const val = btn.getAttribute('data-filter'); if (!val || val === activeFilter) return;
    activeFilter = val;
    filterTags.querySelectorAll('.filter-chip').forEach(ch => ch.classList.toggle('active', ch === btn));
    recompute();
  });

  sortSelect.addEventListener('change', () => { sortMode = sortSelect.value; recompute(); });
  loadMoreBtn.addEventListener('click', (e) => { e.preventDefault(); renderNext(); });

  // init
  recompute();
});
