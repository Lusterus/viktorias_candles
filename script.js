// --- Предотвращаем автопрокрутку при загрузке страницы ---
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
window.addEventListener('DOMContentLoaded', () => window.scrollTo(0, 0));
window.addEventListener('load', () => {
  setTimeout(() => window.scrollTo(0, 0), 150);
  const hero = document.querySelector('.hero-fade');
  if (hero) hero.classList.add('visible');
});

// --- Обновление года ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Мобильное меню ---
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// --- КАТАЛОГ ---
const catalog = document.getElementById('catalog-grid');
const loadMore = document.getElementById('loadMore');

let products = [];
let shown = 0;
let step = 6;

// --- Проверка наличия изображения (универсально, работает даже офлайн) ---
function checkImageExists(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url + '?v=' + Date.now(); // предотвращает кеш
  });
}

// --- Определяем количество доступных файлов ---
async function detectAvailableImages() {
  const found = [];
  for (let i = 1; i <= 100; i++) {
    const path = `images/image${i}.jpg`;
    const exists = await checkImageExists(path);
    if (exists) found.push(path);
    else break;
  }
  return found;
}

// --- Генерация массива продуктов ---
async function initCatalog() {
  const availableImages = await detectAvailableImages();

  products = availableImages.map((img, i) => ({
    img,
    name: `Свеча ${i + 1}`,
    desc: 'Натуральный воск · аромат ванили',
    text: 'Мягкий аромат и уютное пламя для вашего дома.'
  }));

  if (products.length === 0) {
    catalog.innerHTML = '<p class="text-center text-gray-500">Изображения не найдены в папке <code>/images</code>.</p>';
    if (loadMore) loadMore.style.display = 'none';
    return;
  }

  step = products.length > 6 ? 6 : Math.ceil(products.length / 2);
  renderCards();
}

// --- Рендер карточек ---
function renderCards() {
  const slice = products.slice(shown, shown + step);
  slice.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="rounded-xl w-full aspect-[2/3] object-cover mb-3" />
      <h3 class="font-semibold text-rose-600">${item.name}</h3>
      <p class="text-sm text-gray-500">${item.desc}</p>
      <p class="mt-2 text-gray-600 text-sm">${item.text}</p>
    `;
    catalog.appendChild(card);
    setTimeout(() => card.classList.add('visible'), 80 * index);
  });

  shown += slice.length;
  if (shown >= products.length && loadMore) loadMore.style.display = 'none';
}

// --- Обработчик кнопки ---
if (loadMore) {
  loadMore.addEventListener('click', e => {
    e.preventDefault();
    const currentScroll = window.scrollY;
    renderCards();
    // сохраняем позицию (без прокрутки вверх)
    window.scrollTo({ top: currentScroll });
  });
}

// --- Запуск ---
initCatalog();