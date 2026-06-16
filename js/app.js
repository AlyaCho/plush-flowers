/**
 * Plush Flowers - Основная логика интернет-магазина
 */

// Глобальное состояние
window.storeData = null;
window.cart = [];
window.favorites = [];

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
  initStore();
  initUIEvents();
  renderAll();
  lucide.createIcons();
});

// Загрузка данных магазина и инициализация состояния
function initStore() {
  // Загружаем данные магазина из localStorage или берем дефолтные
  const localStore = localStorage.getItem("FLEUR_STORE_DATA");
  if (localStore) {
    try {
      window.storeData = JSON.parse(localStore);
      // Убедимся, что новые поля смержились, если они добавлены в data.js
      if (window.DEFAULT_STORE_DATA) {
        window.storeData.settings = { ...window.DEFAULT_STORE_DATA.settings, ...window.storeData.settings };
      }
    } catch (e) {
      console.error("Ошибка парсинга локальных данных, загружаем дефолт", e);
      window.storeData = JSON.parse(JSON.stringify(window.DEFAULT_STORE_DATA));
    }
  } else if (window.DEFAULT_STORE_DATA) {
    window.storeData = JSON.parse(JSON.stringify(window.DEFAULT_STORE_DATA));
    localStorage.setItem("FLEUR_STORE_DATA", JSON.stringify(window.storeData));
  } else {
    console.error("Дефолтные данные не найдены!");
  }

  // Загружаем корзину
  const localCart = localStorage.getItem("FLEUR_CART");
  if (localCart) {
    try {
      window.cart = JSON.parse(localCart);
    } catch (e) {
      window.cart = [];
    }
  }

  // Загружаем избранное
  const localFavorites = localStorage.getItem("FLEUR_FAVORITES");
  if (localFavorites) {
    try {
      window.favorites = JSON.parse(localFavorites);
    } catch (e) {
      window.favorites = [];
    }
  }
}

// Рендеринг всех динамических блоков
function renderAll() {
  renderBanner();
  renderPageTexts();
  renderCategories();
  renderCatalog();
  renderGallery();
  renderReviews();
  updateCartUI();
  updateFavoritesBadge();
}

// Рендеринг главного баннера
function renderBanner() {
  if (!window.storeData || !window.storeData.banner) return;
  const banner = window.storeData.banner;
  
  const titleEl = document.getElementById("banner-title");
  const subtitleEl = document.getElementById("banner-subtitle");
  const btnEl = document.getElementById("banner-btn-text");
  const imgEl = document.getElementById("banner-image");

  if (titleEl) titleEl.innerText = banner.title;
  if (subtitleEl) subtitleEl.innerText = banner.subtitle;
  if (btnEl) btnEl.innerText = banner.buttonText || "Смотреть каталог";
  if (imgEl && banner.image) {
    imgEl.src = banner.image;
    imgEl.alt = banner.title;
  }
}

// Рендеринг статических текстов на страницах
function renderPageTexts() {
  if (!window.storeData || !window.storeData.texts) return;
  const txt = window.storeData.texts;
  const contacts = window.storeData.contacts;

  // О нас
  const abTitle = document.getElementById("about-title");
  const abT1 = document.getElementById("about-text-1");
  const abT2 = document.getElementById("about-text-2");
  
  if (abTitle) abTitle.innerText = txt.aboutTitle || "";
  if (abT1) abT1.innerText = txt.aboutText1 || "";
  if (abT2) abT2.innerText = txt.aboutText2 || "";

  // Преимущества
  const f1t = document.getElementById("feature-title-1");
  const f1d = document.getElementById("feature-desc-1");
  const f2t = document.getElementById("feature-title-2");
  const f2d = document.getElementById("feature-desc-2");
  const f3t = document.getElementById("feature-title-3");
  const f3d = document.getElementById("feature-desc-3");

  if (f1t) f1t.innerText = txt.aboutFeature1 || "";
  if (f1d) f1d.innerText = txt.aboutFeature1Desc || "";
  if (f2t) f2t.innerText = txt.aboutFeature2 || "";
  if (f2d) f2d.innerText = txt.aboutFeature2Desc || "";
  if (f3t) f3t.innerText = txt.aboutFeature3 || "";
  if (f3d) f3d.innerText = txt.aboutFeature3Desc || "";

  // Доставка и оплата
  const shTime = document.getElementById("shipping-time");
  const shMethods = document.getElementById("shipping-methods");
  const pyMethods = document.getElementById("payment-methods");

  if (shTime) shTime.innerText = txt.shippingTime || "";
  if (shMethods) shMethods.innerText = txt.shippingMethods || "";
  if (pyMethods) pyMethods.innerText = txt.paymentMethods || "";

  // Контакты
  if (contacts) {
    const phoneEl = document.getElementById("contact-phone");
    const emailEl = document.getElementById("contact-email");
    const addrEl = document.getElementById("contact-address");
    const tgBtn = document.getElementById("contact-tg-btn");
    const tgChannelBtn = document.getElementById("contact-channel-btn");
    const vkBtn = document.getElementById("contact-vk-btn");

    if (phoneEl) phoneEl.innerText = contacts.phone || "";
    if (emailEl) emailEl.innerText = contacts.email || "";
    if (addrEl) addrEl.innerText = contacts.address || "";
    
    if (tgBtn) {
      tgBtn.href = `https://t.me/${contacts.telegram || "Plush_flowers_bot"}`;
      tgBtn.innerHTML = `<i data-lucide="send"></i> Telegram бот`;
    }
    if (tgChannelBtn) {
      tgChannelBtn.href = `https://t.me/${contacts.telegramChannel || "plu_flo"}`;
      tgChannelBtn.innerHTML = `<i data-lucide="bell"></i> Telegram канал`;
    }
    if (vkBtn) {
      vkBtn.href = contacts.vk || "https://vk.ru/ty_ch0";
    }
  }
}

// Рендеринг вкладок категорий в каталоге
let activeCategory = "all";
function renderCategories() {
  const tabsContainer = document.getElementById("category-tabs");
  if (!tabsContainer || !window.storeData || !window.storeData.categories) return;

  const categories = window.storeData.categories;
  tabsContainer.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `category-tab ${activeCategory === cat.id ? "active" : ""}`;
    btn.dataset.category = cat.id;
    btn.innerText = cat.name;
    
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = cat.id;
      renderCatalog();
    });

    tabsContainer.appendChild(btn);
  });
}

// Рендеринг сетки товаров каталога
function renderCatalog() {
  const grid = document.getElementById("products-grid");
  if (!grid || !window.storeData || !window.storeData.products) return;

  const products = window.storeData.products;
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");

  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const sortBy = sortSelect ? sortSelect.value : "default";

  grid.innerHTML = "";

  // 1. Фильтрация по категории
  let filtered = products;
  if (activeCategory !== "all") {
    filtered = products.filter(p => Array.isArray(p.category) ? p.category.includes(activeCategory) : p.category === activeCategory);
  }

  // 2. Фильтрация по поиску
  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery) || 
      (p.shortDescription && p.shortDescription.toLowerCase().includes(searchQuery)) ||
      (p.description && p.description.toLowerCase().includes(searchQuery))
    );
  }

  // 3. Сортировка
  if (sortBy === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">
        <i data-lucide="info" style="margin: 0 auto 12px; width: 48px; height: 48px; display: block; color: var(--color-pink-accent);"></i>
        Товары не найдены. Попробуйте изменить параметры поиска или фильтра.
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Рендер карточек
  filtered.forEach(prod => {
    const isFav = window.favorites.includes(prod.id);
    const card = document.createElement("div");
    card.className = "product-card";
    
    // Категории на русском языке
    const cats = Array.isArray(prod.category) ? prod.category : [prod.category];
    const catNames = cats.map(cId => {
      const cObj = window.storeData.categories.find(c => c.id === cId);
      return cObj ? cObj.name : "";
    }).filter(Boolean).join(", ");
    const catName = catNames || "Букет";

    card.innerHTML = `
      <div class="card-img-wrapper">
        ${prod.popular ? `<span class="card-badge">Хит</span>` : ""}
        <img src="${prod.image || 'img/bouquet_pink_lilies.png'}" alt="${prod.name}" class="card-image">
        <div class="card-actions">
          <button class="card-btn favorite ${isFav ? 'active' : ''}" data-id="${prod.id}" title="В избранное">
            <i data-lucide="heart" ${isFav ? 'fill="#ff4d6d" stroke="#ff4d6d"' : ''}></i>
          </button>
          <button class="card-btn quick-view" data-id="${prod.id}" title="Быстрый просмотр">
            <i data-lucide="eye"></i>
          </button>
        </div>
      </div>
      <div class="card-info">
        <span class="card-category">${catName}</span>
        <h3 class="card-title">${prod.name}</h3>
        <div class="card-price">${prod.price.toLocaleString()} ₽</div>
        <p class="card-desc">${prod.shortDescription || ""}</p>
        <button class="card-footer-btn buy-btn" data-id="${prod.id}">В корзину</button>
      </div>
    `;

    // Событие: Быстрый просмотр
    card.querySelector(".quick-view").addEventListener("click", (e) => {
      e.stopPropagation();
      openProductModal(prod.id);
    });

    // Событие: В избранное
    card.querySelector(".favorite").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(prod.id);
      renderCatalog();
    });

    // Событие: В корзину
    card.querySelector(".buy-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(prod.id, 1);
      openCartDrawer();
    });

    grid.appendChild(card);
  });

  lucide.createIcons();
}

// Рендеринг галереи
function renderGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid || !window.storeData || !window.storeData.gallery) return;

  grid.innerHTML = "";
  const gallery = window.storeData.gallery;

  gallery.forEach(imgUrl => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <img src="${imgUrl}" alt="Фото букета">
      <div class="gallery-overlay">
        <i data-lucide="zoom-in"></i>
      </div>
    `;

    item.addEventListener("click", () => {
      // Открытие картинки в новой вкладке или модалке (для красоты сделаем в новой вкладке)
      window.open(imgUrl, "_blank");
    });

    grid.appendChild(item);
  });
}

// Рендеринг отзывов клиентов
function renderReviews() {
  const grid = document.getElementById("reviews-grid");
  if (!grid || !window.storeData || !window.storeData.reviews) return;

  grid.innerHTML = "";
  const reviews = window.storeData.reviews;

  reviews.forEach(rev => {
    // Генерация звезд
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= rev.rating) {
        starsHtml += `<i data-lucide="star" fill="#ffb703" stroke="#ffb703" style="width:16px;height:16px;"></i>`;
      } else {
        starsHtml += `<i data-lucide="star" style="width:16px;height:16px;color:#ccc;"></i>`;
      }
    }

    // Буква для аватарки по умолчанию
    const letter = rev.name.charAt(0).toUpperCase();

    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-stars">${starsHtml}</div>
      <p class="review-text">${rev.text}</p>
      <div class="review-author">
        <div class="author-avatar">
          ${rev.avatar ? `<img src="${rev.avatar}" alt="${rev.name}">` : letter}
        </div>
        <div class="author-name">${rev.name}</div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Логика работы с Корзиной
function updateCartUI() {
  const cartBadge = document.getElementById("cart-badge");
  const itemsContainer = document.getElementById("cart-items-container");
  const totalPriceEl = document.getElementById("cart-total-price");
  const startCheckoutBtn = document.getElementById("start-checkout-btn");

  if (!itemsContainer) return;

  // Общее кол-во товаров в корзине
  const totalCount = window.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) {
    cartBadge.innerText = totalCount;
    cartBadge.style.display = totalCount > 0 ? "flex" : "none";
  }

  itemsContainer.innerHTML = "";

  if (window.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        <i data-lucide="shopping-cart" class="cart-empty-icon"></i>
        <p>Ваша корзина пока пуста</p>
        <a href="#catalog" class="btn btn-secondary" style="font-size:0.75rem;" id="go-to-cat-btn">Перейти в каталог</a>
      </div>
    `;
    
    const goBtn = document.getElementById("go-to-cat-btn");
    if (goBtn) {
      goBtn.addEventListener("click", () => {
        closeCartDrawer();
      });
    }

    if (totalPriceEl) totalPriceEl.innerText = "0 ₽";
    if (startCheckoutBtn) startCheckoutBtn.style.display = "none";
    
    // Скрываем форму заказа, если корзина опустела
    document.getElementById("checkout-box").classList.remove("active");
    document.getElementById("cart-initial-actions").style.display = "block";
    
    lucide.createIcons();
    return;
  }

  // Расчет общей суммы
  let totalPrice = 0;

  window.cart.forEach(cartItem => {
    const prod = window.storeData.products.find(p => p.id === cartItem.productId);
    if (!prod) return;

    totalPrice += prod.price * cartItem.quantity;
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <img src="${prod.image || 'img/bouquet_pink_lilies.png'}" alt="${prod.name}" class="cart-item-img">
      <div class="cart-item-details">
        <div class="cart-item-title">${prod.name}</div>
        <div class="cart-item-price">${(prod.price * cartItem.quantity).toLocaleString()} ₽</div>
        <div class="cart-item-footer">
          <div class="quantity-selector" style="padding: 2px;">
            <button class="qty-btn" style="width:24px;height:24px;font-size:0.8rem;" data-action="minus" data-id="${prod.id}">-</button>
            <div class="qty-val" style="width:24px;font-size:0.8rem;">${cartItem.quantity}</div>
            <button class="qty-btn" style="width:24px;height:24px;font-size:0.8rem;" data-action="plus" data-id="${prod.id}">+</button>
          </div>
          <button class="cart-item-remove" data-id="${prod.id}">Удалить</button>
        </div>
      </div>
    `;

    // Кнопки количества
    itemEl.querySelector('[data-action="minus"]').addEventListener("click", () => {
      changeCartQty(prod.id, -1);
    });
    itemEl.querySelector('[data-action="plus"]').addEventListener("click", () => {
      changeCartQty(prod.id, 1);
    });

    // Кнопка удаления
    itemEl.querySelector(".cart-item-remove").addEventListener("click", () => {
      removeFromCart(prod.id);
    });

    itemsContainer.appendChild(itemEl);
  });

  if (totalPriceEl) totalPriceEl.innerText = totalPrice.toLocaleString() + " ₽";
  if (startCheckoutBtn) startCheckoutBtn.style.display = "block";

  lucide.createIcons();
}

function addToCart(productId, quantity = 1) {
  const existing = window.cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    window.cart.push({ productId, quantity });
  }
  saveCart();
  updateCartUI();
  showToast("Товар добавлен в корзину");
}

function removeFromCart(productId) {
  window.cart = window.cart.filter(item => item.productId !== productId);
  saveCart();
  updateCartUI();
  showToast("Товар удален из корзины");
}

function changeCartQty(productId, delta) {
  const item = window.cart.find(i => i.productId === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      updateCartUI();
    }
  }
}

function saveCart() {
  localStorage.setItem("FLEUR_CART", JSON.stringify(window.cart));
}

// Логика Избранного
function toggleFavorite(productId) {
  const index = window.favorites.indexOf(productId);
  if (index > -1) {
    window.favorites.splice(index, 1);
    showToast("Удалено из избранного");
  } else {
    window.favorites.push(productId);
    showToast("Добавлено в избранное ❤️");
  }
  localStorage.setItem("FLEUR_FAVORITES", JSON.stringify(window.favorites));
  updateFavoritesBadge();
}

function updateFavoritesBadge() {
  const badge = document.getElementById("favorites-badge");
  if (badge) {
    badge.innerText = window.favorites.length;
    badge.style.display = window.favorites.length > 0 ? "flex" : "none";
  }
}

// Всплывающие уведомления (Toast)
function showToast(message) {
  const toast = document.getElementById("admin-toast");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add("active");
  setTimeout(() => {
    toast.classList.remove("active");
  }, 2500);
}

// Быстрый просмотр товара в модальном окне
let activeModalProductId = null;
let activeModalQty = 1;

function openProductModal(productId) {
  const prod = window.storeData.products.find(p => p.id === productId);
  if (!prod) return;

  activeModalProductId = productId;
  activeModalQty = 1;

  document.getElementById("modal-product-title").innerText = prod.name;
  document.getElementById("modal-product-price").innerText = prod.price.toLocaleString() + " ₽";
  document.getElementById("modal-product-desc").innerText = prod.description || prod.shortDescription || "";
  document.getElementById("modal-product-image").src = prod.image || "img/bouquet_pink_lilies.png";
  document.getElementById("modal-qty-value").innerText = activeModalQty;

  const cats = Array.isArray(prod.category) ? prod.category : [prod.category];
  const catNames = cats.map(cId => {
    const cObj = window.storeData.categories.find(c => c.id === cId);
    return cObj ? cObj.name : "";
  }).filter(Boolean).join(", ");
  document.getElementById("modal-product-category").innerText = catNames || "Цветы";

  // Избранное кнопка в модалке
  const favBtn = document.getElementById("modal-fav-btn");
  const isFav = window.favorites.includes(productId);
  favBtn.innerHTML = isFav ? `<i data-lucide="heart" fill="#ff4d6d" stroke="#ff4d6d"></i>` : `<i data-lucide="heart"></i>`;
  
  // Добавление в корзину кнопка
  const addBtn = document.getElementById("modal-add-to-cart-btn");
  addBtn.onclick = () => {
    addToCart(productId, activeModalQty);
    closeProductModal();
    openCartDrawer();
  };

  document.getElementById("product-modal").classList.add("active");
  lucide.createIcons();
}

function closeProductModal() {
  document.getElementById("product-modal").classList.remove("active");
  activeModalProductId = null;
}

// Открытие / Закрытие корзины
function openCartDrawer() {
  document.getElementById("cart-drawer").classList.add("active");
  document.getElementById("cart-backdrop").classList.add("active");
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("active");
  document.getElementById("cart-backdrop").classList.remove("active");
}

// Telegram Отправка Заявок и Заказов
// Принимает текст сообщения и, опционально, Base64 картинку
function sendTelegramNotification(messageText, photoBase64 = null) {
  const settings = window.storeData.settings;
  
  // 1. Проверяем, настроен ли Telegram Bot API
  if (settings.telegramBotToken && settings.telegramChatId) {
    const token = settings.telegramBotToken;
    const chatId = settings.telegramChatId;
    
    // Если прикреплено фото
    if (photoBase64) {
      // Преобразуем base64 в blob для отправки
      fetch(photoBase64)
        .then(res => res.blob())
        .then(blob => {
          const formData = new FormData();
          formData.append("chat_id", chatId);
          formData.append("caption", messageText);
          formData.append("photo", blob, "photo.jpg");

          return fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: "POST",
            body: formData
          });
        })
        .then(response => {
          if (response.ok) {
            showToast("Заявка успешно отправлена!");
          } else {
            console.error("Ошибка Telegram API при отправке фото");
            fallbackTelegramRedirect(messageText);
          }
        })
        .catch(err => {
          console.error(err);
          fallbackTelegramRedirect(messageText);
        });
    } else {
      // Обычное текстовое сообщение
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "Markdown"
        })
      })
      .then(response => {
        if (response.ok) {
          showToast("Заказ успешно отправлен!");
        } else {
          console.error("Ошибка Telegram API при отправке текста");
          fallbackTelegramRedirect(messageText);
        }
      })
      .catch(err => {
        console.error(err);
        fallbackTelegramRedirect(messageText);
      });
    }
  } else {
    // 2. Альтернатива: открываем прямую ссылку на @Plush_flowers_bot
    fallbackTelegramRedirect(messageText);
  }
}

// Редирект в бота с пре-заполненным текстом
function fallbackTelegramRedirect(text) {
  const username = window.storeData.settings.telegramUsername || "Plush_flowers_bot";
  // Форматируем текст для URL. Telegram поддерживает параметры, но для ботов лучше передавать красивый pre-filled текст.
  // Так как это бот, прямая отправка не всегда возможна без диалога. Мы просто копируем текст в буфер обмена
  // и открываем бота, чтобы пользователь мог сразу отправить или начать диалог.
  
  navigator.clipboard.writeText(text).then(() => {
    showToast("Текст заказа скопирован в буфер обмена!");
    setTimeout(() => {
      const url = `https://t.me/${username}`;
      window.open(url, "_blank");
    }, 1200);
  }).catch(() => {
    // Если буфер обмена не сработал (например, на старых телефонах без HTTPS), просто открываем ссылку
    const cleanText = encodeURIComponent(text);
    const url = `https://t.me/${username}?text=${cleanText}`;
    window.open(url, "_blank");
  });
}

// Навешивание событий интерфейса
function initUIEvents() {
  // Переключатель мобильного меню
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Сворачивать меню при клике на ссылки
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  // Фильтрация и поиск
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", renderCatalog);
  }

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", renderCatalog);
  }

  // Смена шапки при прокрутке
  window.addEventListener("scroll", () => {
    const header = document.getElementById("header");
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Подсветка активных пунктов меню
    const sections = ["hero", "catalog", "about", "custom-order", "shipping", "contacts"];
    let scrollPos = window.scrollY + 100;

    sections.forEach(secId => {
      const el = document.getElementById(secId);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          document.querySelectorAll(".nav-menu a").forEach(a => {
            a.classList.remove("active");
            if (a.getAttribute("href") === `#${secId}` || (secId === "hero" && a.getAttribute("href") === "#")) {
              a.classList.add("active");
            }
          });
        }
      }
    });
  });

  // События корзины
  document.getElementById("cart-toggle-btn").addEventListener("click", openCartDrawer);
  document.getElementById("cart-close-btn").addEventListener("click", closeCartDrawer);
  document.getElementById("cart-backdrop").addEventListener("click", closeCartDrawer);

  // Клик по Избранному (открывает каталог с отфильтрованными избранными товарами)
  document.getElementById("favorites-toggle-btn").addEventListener("click", () => {
    if (window.favorites.length === 0) {
      showToast("Список избранного пуст 🌸");
      return;
    }
    // Временный фильтр: показываем только избранные
    const grid = document.getElementById("products-grid");
    const products = window.storeData.products.filter(p => window.favorites.includes(p.id));
    
    grid.innerHTML = "";
    document.querySelectorAll(".category-tab").forEach(b => b.classList.remove("active"));
    
    products.forEach(prod => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${prod.image || 'img/bouquet_pink_lilies.png'}" alt="${prod.name}" class="card-image">
          <div class="card-actions">
            <button class="card-btn favorite active" data-id="${prod.id}"><i data-lucide="heart" fill="#ff4d6d" stroke="#ff4d6d"></i></button>
          </div>
        </div>
        <div class="card-info">
          <h3 class="card-title">${prod.name}</h3>
          <div class="card-price">${prod.price} ₽</div>
          <button class="card-footer-btn buy-btn" data-id="${prod.id}">В корзину</button>
        </div>
      `;
      card.querySelector(".favorite").addEventListener("click", () => {
        toggleFavorite(prod.id);
        // Реактивное обновление
        document.getElementById("favorites-toggle-btn").click();
      });
      card.querySelector(".buy-btn").addEventListener("click", () => {
        addToCart(prod.id, 1);
        openCartDrawer();
      });
      grid.appendChild(card);
    });
    lucide.createIcons();
    // Скролл к каталогу
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
    showToast("Показаны избранные товары");
  });

  // Модалка товара: закрытие
  document.getElementById("product-modal-close-btn").addEventListener("click", closeProductModal);
  document.getElementById("product-modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("product-modal")) {
      closeProductModal();
    }
  });

  // Количество в модалке
  document.getElementById("modal-qty-minus").addEventListener("click", () => {
    if (activeModalQty > 1) {
      activeModalQty--;
      document.getElementById("modal-qty-value").innerText = activeModalQty;
    }
  });
  document.getElementById("modal-qty-plus").addEventListener("click", () => {
    activeModalQty++;
    document.getElementById("modal-qty-value").innerText = activeModalQty;
  });

  // Избранное из модалки
  document.getElementById("modal-fav-btn").addEventListener("click", () => {
    if (activeModalProductId) {
      toggleFavorite(activeModalProductId);
      const isFav = window.favorites.includes(activeModalProductId);
      document.getElementById("modal-fav-btn").innerHTML = isFav 
        ? `<i data-lucide="heart" fill="#ff4d6d" stroke="#ff4d6d"></i>` 
        : `<i data-lucide="heart"></i>`;
      lucide.createIcons();
      renderCatalog();
    }
  });

  // Оформление заказа в корзине
  const startCheckoutBtn = document.getElementById("start-checkout-btn");
  const checkoutBox = document.getElementById("checkout-box");
  const initialActions = document.getElementById("cart-initial-actions");
  const cancelCheckoutBtn = document.getElementById("cancel-checkout-btn");

  if (startCheckoutBtn && checkoutBox && initialActions && cancelCheckoutBtn) {
    startCheckoutBtn.addEventListener("click", () => {
      initialActions.style.display = "none";
      checkoutBox.classList.add("active");
    });
    cancelCheckoutBtn.addEventListener("click", () => {
      checkoutBox.classList.remove("active");
      initialActions.style.display = "block";
    });
  }

  // Отправка формы корзины (Оформление заказа)
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("order-name").value;
      const phone = document.getElementById("order-phone").value;
      const telegram = document.getElementById("order-telegram").value;
      const address = document.getElementById("order-address").value;

      // Формируем состав заказа
      let itemsListText = "";
      let totalSum = 0;

      window.cart.forEach((cartItem, idx) => {
        const prod = window.storeData.products.find(p => p.id === cartItem.productId);
        if (prod) {
          const cost = prod.price * cartItem.quantity;
          totalSum += cost;
          itemsListText += `${idx + 1}. ${prod.name} x${cartItem.quantity} (${cost} ₽)\n`;
        }
      });

      const orderMessage = `🌸 *Новый заказ с сайта Fleur de Chenille!*\n\n` +
        `👤 *Покупатель:* ${name}\n` +
        `📞 *Телефон:* ${phone}\n` +
        `✈️ *Telegram:* ${telegram}\n` +
        `📍 *Доставка:* ${address}\n\n` +
        `🛍️ *Состав заказа:*\n${itemsListText}\n` +
        `💰 *Итоговая сумма:* ${totalSum.toLocaleString()} ₽\n\n` +
        `📲 _Заказ оформлен через сайт_`;

      sendTelegramNotification(orderMessage);

      // Очищаем корзину
      window.cart = [];
      saveCart();
      updateCartUI();
      closeCartDrawer();
      checkoutForm.reset();
      
      // Сбрасываем виджет чекаута
      checkoutBox.classList.remove("active");
      initialActions.style.display = "block";
    });
  }

  // Индивидуальный заказ: обработка фото-превью
  const customPhotoInput = document.getElementById("custom-photo");
  const customFileLabel = document.getElementById("custom-file-label");
  const customPhotoPreview = document.getElementById("custom-photo-preview");
  let customPhotoBase64 = null;

  if (customPhotoInput) {
    customPhotoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        customFileLabel.innerText = file.name;
        
        const reader = new FileReader();
        reader.onload = function(evt) {
          customPhotoPreview.src = evt.target.result;
          customPhotoPreview.style.display = "block";
          customPhotoBase64 = evt.target.result; // Храним base64
        };
        reader.readAsDataURL(file);
      } else {
        customFileLabel.innerText = "Выбрать файл (.jpg, .png)";
        customPhotoPreview.style.display = "none";
        customPhotoBase64 = null;
      }
    });
  }

  // Отправка формы индивидуального заказа
  const customOrderForm = document.getElementById("custom-order-form");
  if (customOrderForm) {
    customOrderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("custom-name").value;
      const phone = document.getElementById("custom-phone").value;
      const telegram = document.getElementById("custom-telegram").value;
      const wishes = document.getElementById("custom-wishes").value;

      const message = `✨ *Заявка на индивидуальный заказ!*\n\n` +
        `👤 *Имя:* ${name}\n` +
        `📞 *Телефон:* ${phone}\n` +
        `✈️ *Telegram:* ${telegram}\n` +
        `📝 *Пожелания к букету:* ${wishes}\n\n` +
        `${customPhotoBase64 ? "📸 _Фото-пример прикреплено к сообщению_" : "❌ _Без фото-примера_"}`;

      sendTelegramNotification(message, customPhotoBase64);

      customOrderForm.reset();
      if (customPhotoPreview) customPhotoPreview.style.display = "none";
      if (customFileLabel) customFileLabel.innerText = "Выбрать файл (.jpg, .png)";
      customPhotoBase64 = null;
    });
  }

  // Отправка формы обратной связи (Задать вопрос)
  const feedbackForm = document.getElementById("feedback-form");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("feed-name").value;
      const contact = document.getElementById("feed-contact").value;
      const messageText = document.getElementById("feed-message").value;

      const message = `💬 *Вопрос от посетителя сайта!*\n\n` +
        `👤 *Имя:* ${name}\n` +
        `📞 *Контакты:* ${contact}\n` +
        `✉️ *Сообщение:* ${messageText}`;

      sendTelegramNotification(message);

      feedbackForm.reset();
    });
  }
}
