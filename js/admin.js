/**
 * Plush Flowers - Панель управления (Admin Panel)
 */

document.addEventListener("DOMContentLoaded", () => {
  initAdminEvents();
});

function initAdminEvents() {
  const adminTriggerBtn = document.getElementById("admin-trigger-btn");
  const adminModal = document.getElementById("admin-modal");
  const loginForm = document.getElementById("admin-login-form");
  const loginCancelBtn = document.getElementById("admin-login-cancel");
  const loginScreen = document.getElementById("admin-login-screen");
  const panelScreen = document.getElementById("admin-panel-screen");
  const panelCloseBtn = document.getElementById("admin-panel-close-btn");

  if (!adminTriggerBtn || !adminModal) return;

  // 1. Открытие панели (Сначала окно логина)
  adminTriggerBtn.addEventListener("click", () => {
    loginScreen.style.display = "block";
    panelScreen.style.display = "none";
    adminModal.classList.add("active");
    document.getElementById("admin-password-input").value = "";
    document.getElementById("admin-password-input").focus();
  });

  // 2. Отмена логина
  if (loginCancelBtn) {
    loginCancelBtn.addEventListener("click", () => {
      adminModal.classList.remove("active");
    });
  }

  // 3. Отправка пароля
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredPass = document.getElementById("admin-password-input").value;
      const actualPass = window.storeData.settings.adminPassword || "admin";

      if (enteredPass === actualPass) {
        loginScreen.style.display = "none";
        panelScreen.style.display = "flex";
        initDashboard();
        showToast("Успешный вход!");
      } else {
        alert("Неверный пароль!");
      }
    });
  }

  // 4. Закрытие админ-панели
  if (panelCloseBtn) {
    panelCloseBtn.addEventListener("click", () => {
      adminModal.classList.remove("active");
    });
  }

  adminModal.addEventListener("click", (e) => {
    if (e.target === adminModal) {
      adminModal.classList.remove("active");
    }
  });
}

// Загрузка данных и настройка вкладок админки
function initDashboard() {
  // Настройка табов
  const tabButtons = document.querySelectorAll(".admin-tab-btn");
  const tabPanels = document.querySelectorAll(".admin-tab-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(tabId).classList.add("active");

      // Подгружаем данные для конкретной вкладки при её открытии
      loadTabData(tabId);
    });
  });

  // Первоначальный рендер вкладки по умолчанию (Главный баннер)
  loadTabData("tab-banner");
  setupFileInputs();
  setupAdminForms();
}

// Маршрутизация загрузки данных в зависимости от вкладки
function loadTabData(tabId) {
  if (!window.storeData) return;

  switch (tabId) {
    case "tab-banner":
      loadBannerData();
      break;
    case "tab-products":
      loadProductsData();
      break;
    case "tab-categories":
      loadCategoriesData();
      break;
    case "tab-texts":
      loadTextsData();
      break;
    case "tab-reviews":
      loadReviewsData();
      break;
    case "tab-contacts":
      loadContactsData();
      break;
    case "tab-export":
      // Ничего загружать не надо
      break;
  }
}

// Конвертация картинок в Base64 для удобного превью и хранения в коде
function setupFileInputs() {
  const inputs = [
    { fileId: "adm-banner-file", boxId: "adm-banner-file-box", prevId: "adm-banner-preview", hiddenId: "adm-banner-img-url" },
    { fileId: "adm-prod-file", boxId: "adm-prod-file-box", prevId: "adm-prod-preview", hiddenId: "adm-prod-img-url" },
    { fileId: "adm-rev-file", boxId: "adm-rev-file-box", prevId: "adm-rev-preview", hiddenId: "adm-rev-img-url" }
  ];

  inputs.forEach(cfg => {
    const fileEl = document.getElementById(cfg.fileId);
    const boxEl = document.getElementById(cfg.boxId);
    const prevEl = document.getElementById(cfg.prevId);
    const hiddenEl = document.getElementById(cfg.hiddenId);

    if (boxEl && fileEl) {
      boxEl.onclick = () => fileEl.click();
      
      fileEl.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          boxEl.innerHTML = `<i data-lucide="check"></i> Выбран: ${file.name}`;
          lucide.createIcons();

          const reader = new FileReader();
          reader.onload = function(evt) {
            if (prevEl) {
              prevEl.src = evt.target.result;
              prevEl.style.display = "block";
            }
            if (hiddenEl) {
              hiddenEl.value = evt.target.result; // Храним base64
            }
          };
          reader.readAsDataURL(file);
        }
      };
    }
  });
}

// ---------------- TAB-SPECIFIC LOADS & HANDLERS ----------------

// 1. Главный баннер
function loadBannerData() {
  const banner = window.storeData.banner;
  document.getElementById("adm-banner-title").value = banner.title || "";
  document.getElementById("adm-banner-subtitle").value = banner.subtitle || "";
  document.getElementById("adm-banner-btn").value = banner.buttonText || "";
  
  const prev = document.getElementById("adm-banner-preview");
  const hidden = document.getElementById("adm-banner-img-url");
  
  if (banner.image) {
    prev.src = banner.image;
    prev.style.display = "block";
    hidden.value = banner.image;
  } else {
    prev.style.display = "none";
    hidden.value = "";
  }
}

// 2. Товары
function loadProductsData() {
  // Показываем список и скрываем форму
  document.getElementById("adm-products-list-view").style.display = "block";
  document.getElementById("adm-product-form-view").style.display = "none";

  const container = document.getElementById("adm-products-list-container");
  container.innerHTML = "";

  const products = window.storeData.products;

  products.forEach(p => {
    const item = document.createElement("div");
    item.className = "admin-list-item";
    
    // Получим русские категории
    const cats = Array.isArray(p.category) ? p.category : [p.category];
    const catNames = cats.map(cId => {
      const cObj = window.storeData.categories.find(c => c.id === cId);
      return cObj ? cObj.name : "";
    }).filter(Boolean).join(", ");
    const catName = catNames || "Без категории";

    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <img src="${p.image || 'img/bouquet_pink_lilies.png'}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #eee;">
        <div>
          <div class="admin-item-title">${p.name}</div>
          <div style="font-size:0.75rem; color:var(--color-text-muted);">${p.price} ₽ | ${catName}</div>
        </div>
      </div>
      <div class="admin-actions-row">
        <button class="admin-btn-action admin-btn-edit edit-prod" data-id="${p.id}">Редактировать</button>
        <button class="admin-btn-action admin-btn-delete delete-prod" data-id="${p.id}">Удалить</button>
      </div>
    `;

    // Редактирование
    item.querySelector(".edit-prod").addEventListener("click", () => {
      openProductForm(p.id);
    });

    // Удаление
    item.querySelector(".delete-prod").addEventListener("click", () => {
      if (confirm(`Вы уверены, что хотите удалить товар "${p.name}"?`)) {
        deleteProduct(p.id);
      }
    });

    container.appendChild(item);
  });

  // Кнопка нового товара
  document.getElementById("adm-add-product-btn").onclick = () => {
    openProductForm(null);
  };
}

function openProductForm(productId) {
  document.getElementById("adm-products-list-view").style.display = "none";
  document.getElementById("adm-product-form-view").style.display = "block";

  const formTitle = document.getElementById("adm-product-form-title");
  const form = document.getElementById("admin-form-product");
  
  // Категории в виде чекбоксов
  const checkboxContainer = document.getElementById("adm-prod-categories-checkboxes");
  checkboxContainer.innerHTML = "";
  window.storeData.categories.forEach(c => {
    if (c.id === "all") return; // Пропускаем категорию "Все"
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "6px";
    label.style.cursor = "pointer";
    label.style.fontSize = "0.85rem";
    label.style.fontWeight = "500";
    
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = c.id;
    cb.name = "adm-prod-category-cb";
    
    label.appendChild(cb);
    label.appendChild(document.createTextNode(c.name));
    checkboxContainer.appendChild(label);
  });

  const prev = document.getElementById("adm-prod-preview");
  const fileBox = document.getElementById("adm-prod-file-box");
  fileBox.innerHTML = `<i data-lucide="upload-cloud"></i> Выбрать файл на компьютере/телефоне`;
  lucide.createIcons();

  if (productId) {
    // Редактирование существующего
    formTitle.innerText = "Редактировать товар";
    const p = window.storeData.products.find(item => item.id === productId);
    
    document.getElementById("adm-prod-id").value = p.id;
    document.getElementById("adm-prod-name").value = p.name;
    document.getElementById("adm-prod-price").value = p.price;
    const pCats = Array.isArray(p.category) ? p.category : [p.category];
    document.querySelectorAll("input[name='adm-prod-category-cb']").forEach(cb => {
      cb.checked = pCats.includes(cb.value);
    });
    document.getElementById("adm-prod-short-desc").value = p.shortDescription || "";
    document.getElementById("adm-prod-desc").value = p.description || "";
    document.getElementById("adm-prod-img-url").value = p.image || "";
    document.getElementById("adm-prod-in-stock").checked = p.hasOwnProperty('inStock') ? p.inStock : true;
    
    if (p.image) {
      prev.src = p.image;
      prev.style.display = "block";
    } else {
      prev.style.display = "none";
    }
  } else {
    // Создание нового
    formTitle.innerText = "Добавить новый товар";
    form.reset();
    document.getElementById("adm-prod-id").value = "";
    document.getElementById("adm-prod-img-url").value = "";
    prev.style.display = "none";
    document.getElementById("adm-prod-in-stock").checked = true;
  }

  // Отмена
  document.getElementById("adm-prod-cancel-btn").onclick = () => {
    loadProductsData();
  };
}

function deleteProduct(productId) {
  window.storeData.products = window.storeData.products.filter(p => p.id !== productId);
  saveData();
  loadProductsData();
  // Перерендеринг витрины
  if (window.renderCatalog) window.renderCatalog();
  showToast("Товар удален!");
}

// 3. Категории
function loadCategoriesData() {
  const container = document.getElementById("adm-categories-list-container");
  container.innerHTML = "";

  const categories = window.storeData.categories;

  categories.forEach(c => {
    const item = document.createElement("div");
    item.className = "admin-list-item";
    
    const isAll = c.id === "all";
    
    item.innerHTML = `
      <div class="admin-item-title">${c.name} ${isAll ? '<span style="font-weight:400;color:var(--color-text-muted); font-size:0.8rem;">(Системная)</span>' : ""}</div>
      <div class="admin-actions-row">
        ${!isAll ? `<button class="admin-btn-action admin-btn-delete delete-cat" data-id="${c.id}">Удалить</button>` : ""}
      </div>
    `;

    if (!isAll) {
      item.querySelector(".delete-cat").addEventListener("click", () => {
        if (confirm(`При удалении категории "${c.name}", все товары в ней будут перемещены в категорию "Все". Продолжить?`)) {
          deleteCategory(c.id);
        }
      });
    }

    container.appendChild(item);
  });
}

function deleteCategory(catId) {
  // 1. Удаляем саму категорию
  window.storeData.categories = window.storeData.categories.filter(c => c.id !== catId);
  
  // 2. Переводим товары из удаленной категории в дефолтную (или сбрасываем категорию)
  window.storeData.products.forEach(p => {
    if (p.category === catId) {
      p.category = "compositions"; // Перемещаем в авторские композиции как дефолт
    }
  });

  saveData();
  loadCategoriesData();
  
  // Обновляем витрину
  if (window.renderCategories) window.renderCategories();
  if (window.renderCatalog) window.renderCatalog();
  showToast("Категория удалена");
}

// 4. Страничные тексты
function loadTextsData() {
  const txt = window.storeData.texts;
  
  document.getElementById("adm-about-title").value = txt.aboutTitle || "";
  document.getElementById("adm-about-text-1").value = txt.aboutText1 || "";
  document.getElementById("adm-about-text-2").value = txt.aboutText2 || "";
  
  document.getElementById("adm-f1-title").value = txt.aboutFeature1 || "";
  document.getElementById("adm-f1-desc").value = txt.aboutFeature1Desc || "";
  document.getElementById("adm-f2-title").value = txt.aboutFeature2 || "";
  document.getElementById("adm-f2-desc").value = txt.aboutFeature2Desc || "";
  document.getElementById("adm-f3-title").value = txt.aboutFeature3 || "";
  document.getElementById("adm-f3-desc").value = txt.aboutFeature3Desc || "";

  document.getElementById("adm-ship-time").value = txt.shippingTime || "";
  document.getElementById("adm-ship-methods").value = txt.shippingMethods || "";
  document.getElementById("adm-pay-methods").value = txt.paymentMethods || "";
}

// 5. Отзывы
function loadReviewsData() {
  document.getElementById("adm-reviews-list-view").style.display = "block";
  document.getElementById("adm-review-form-view").style.display = "none";

  const container = document.getElementById("adm-reviews-list-container");
  container.innerHTML = "";

  const reviews = window.storeData.reviews;

  reviews.forEach(r => {
    const item = document.createElement("div");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div>
        <div class="admin-item-title">${r.name}</div>
        <div style="font-size:0.75rem; color:var(--color-text-muted);">${r.rating} звезд(ы) | ${r.text.substring(0, 40)}...</div>
      </div>
      <div class="admin-actions-row">
        <button class="admin-btn-action admin-btn-edit edit-rev" data-id="${r.id}">Редактировать</button>
        <button class="admin-btn-action admin-btn-delete delete-rev" data-id="${r.id}">Удалить</button>
      </div>
    `;

    item.querySelector(".edit-rev").addEventListener("click", () => {
      openReviewForm(r.id);
    });

    item.querySelector(".delete-rev").addEventListener("click", () => {
      if (confirm(`Удалить отзыв от "${r.name}"?`)) {
        deleteReview(r.id);
      }
    });

    container.appendChild(item);
  });

  document.getElementById("adm-add-review-btn").onclick = () => {
    openReviewForm(null);
  };
}

function openReviewForm(reviewId) {
  document.getElementById("adm-reviews-list-view").style.display = "none";
  document.getElementById("adm-review-form-view").style.display = "block";

  const formTitle = document.getElementById("adm-review-form-title");
  const form = document.getElementById("admin-form-review");
  const prev = document.getElementById("adm-rev-preview");
  const fileBox = document.getElementById("adm-rev-file-box");
  
  fileBox.innerHTML = `<i data-lucide="upload-cloud"></i> Выбрать фото лица`;
  lucide.createIcons();

  if (reviewId) {
    formTitle.innerText = "Редактировать отзыв";
    const r = window.storeData.reviews.find(item => item.id === reviewId);
    
    document.getElementById("adm-rev-id").value = r.id;
    document.getElementById("adm-rev-name").value = r.name;
    document.getElementById("adm-rev-rating").value = r.rating;
    document.getElementById("adm-rev-text").value = r.text;
    document.getElementById("adm-rev-img-url").value = r.avatar || "";
    
    if (r.avatar) {
      prev.src = r.avatar;
      prev.style.display = "block";
    } else {
      prev.style.display = "none";
    }
  } else {
    formTitle.innerText = "Добавить отзыв";
    form.reset();
    document.getElementById("adm-rev-id").value = "";
    document.getElementById("adm-rev-img-url").value = "";
    prev.style.display = "none";
  }

  document.getElementById("adm-rev-cancel-btn").onclick = () => {
    loadReviewsData();
  };
}

function deleteReview(reviewId) {
  window.storeData.reviews = window.storeData.reviews.filter(r => r.id !== reviewId);
  saveData();
  loadReviewsData();
  if (window.renderReviews) window.renderReviews();
  showToast("Отзыв удален");
}

// 6. Контакты
function loadContactsData() {
  const contacts = window.storeData.contacts;
  const settings = window.storeData.settings;

  document.getElementById("adm-phone").value = contacts.phone || "";
  document.getElementById("adm-email").value = contacts.email || "";
  document.getElementById("adm-address").value = contacts.address || "";
  document.getElementById("adm-tg-user").value = settings.telegramUsername || contacts.telegram || "";
  document.getElementById("adm-tg-channel").value = settings.telegramChannel || contacts.telegramChannel || "";
  document.getElementById("adm-vk-url").value = settings.vkUrl || contacts.vk || "";
  
  document.getElementById("adm-tg-token").value = deobfuscate(settings.telegramBotToken) || "";
  document.getElementById("adm-tg-chatid").value = deobfuscate(settings.telegramChatId) || "";
  document.getElementById("adm-admin-pw").value = settings.adminPassword || "admin";
}

// ---------------- FORM SUBMIT HANDLERS ----------------

function setupAdminForms() {
  // 1. Форма баннера
  document.getElementById("admin-form-banner").onsubmit = (e) => {
    e.preventDefault();
    window.storeData.banner.title = document.getElementById("adm-banner-title").value;
    window.storeData.banner.subtitle = document.getElementById("adm-banner-subtitle").value;
    window.storeData.banner.buttonText = document.getElementById("adm-banner-btn").value;
    window.storeData.banner.image = document.getElementById("adm-banner-img-url").value;

    saveData();
    if (window.renderBanner) window.renderBanner();
    showToast("Баннер сохранен!");
  };

  // 2. Форма товара (Добавить / Сохранить существующий)
  document.getElementById("admin-form-product").onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById("adm-prod-id").value;
    
    const checkedCbs = Array.from(document.querySelectorAll("input[name='adm-prod-category-cb']:checked")).map(cb => cb.value);
    if (checkedCbs.length === 0) {
      alert("Пожалуйста, выберите хотя бы одну категорию для товара!");
      return;
    }
    
    const productObj = {
      id: id || "prod_" + Date.now(),
      name: document.getElementById("adm-prod-name").value,
      price: parseFloat(document.getElementById("adm-prod-price").value),
      category: checkedCbs,
      shortDescription: document.getElementById("adm-prod-short-desc").value,
      description: document.getElementById("adm-prod-desc").value,
      image: document.getElementById("adm-prod-img-url").value,
      popular: true, // По умолчанию новые товары активны
      inStock: document.getElementById("adm-prod-in-stock").checked
    };

    if (id) {
      // Обновление
      const idx = window.storeData.products.findIndex(p => p.id === id);
      if (idx > -1) window.storeData.products[idx] = productObj;
    } else {
      // Вставка нового
      window.storeData.products.push(productObj);
    }

    saveData();
    loadProductsData();
    if (window.renderCatalog) window.renderCatalog();
    showToast("Товар успешно сохранен!");
  };

  // 3. Форма добавления категории
  document.getElementById("admin-form-category").onsubmit = (e) => {
    e.preventDefault();
    const catName = document.getElementById("adm-cat-name").value.trim();
    if (!catName) return;

    // Генерируем транслит ID из названия категории
    const catId = "cat_" + Date.now();
    
    window.storeData.categories.push({
      id: catId,
      name: catName
    });

    saveData();
    loadCategoriesData();
    document.getElementById("adm-cat-name").value = "";
    if (window.renderCategories) window.renderCategories();
    showToast("Категория добавлена!");
  };

  // 4. Форма текстовых полей
  document.getElementById("admin-form-texts").onsubmit = (e) => {
    e.preventDefault();
    const txt = window.storeData.texts;
    
    txt.aboutTitle = document.getElementById("adm-about-title").value;
    txt.aboutText1 = document.getElementById("adm-about-text-1").value;
    txt.aboutText2 = document.getElementById("adm-about-text-2").value;
    
    txt.aboutFeature1 = document.getElementById("adm-f1-title").value;
    txt.aboutFeature1Desc = document.getElementById("adm-f1-desc").value;
    txt.aboutFeature2 = document.getElementById("adm-f2-title").value;
    txt.aboutFeature2Desc = document.getElementById("adm-f2-desc").value;
    txt.aboutFeature3 = document.getElementById("adm-f3-title").value;
    txt.aboutFeature3Desc = document.getElementById("adm-f3-desc").value;

    txt.shippingTime = document.getElementById("adm-ship-time").value;
    txt.shippingMethods = document.getElementById("adm-ship-methods").value;
    txt.paymentMethods = document.getElementById("adm-pay-methods").value;

    saveData();
    if (window.renderPageTexts) window.renderPageTexts();
    showToast("Тексты сохранены!");
  };

  // 5. Форма отзывов (Добавить / Редактировать)
  document.getElementById("admin-form-review").onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById("adm-rev-id").value;

    const reviewObj = {
      id: id || "rev_" + Date.now(),
      name: document.getElementById("adm-rev-name").value,
      rating: parseInt(document.getElementById("adm-rev-rating").value),
      text: document.getElementById("adm-rev-text").value,
      avatar: document.getElementById("adm-rev-img-url").value
    };

    if (id) {
      const idx = window.storeData.reviews.findIndex(r => r.id === id);
      if (idx > -1) window.storeData.reviews[idx] = reviewObj;
    } else {
      window.storeData.reviews.push(reviewObj);
    }

    saveData();
    loadReviewsData();
    if (window.renderReviews) window.renderReviews();
    showToast("Отзыв сохранен!");
  };

  // 6. Настройки контактов и безопасности
  document.getElementById("admin-form-contacts").onsubmit = (e) => {
    e.preventDefault();
    
    // Сохраняем в контакты
    window.storeData.contacts.phone = document.getElementById("adm-phone").value;
    window.storeData.contacts.email = document.getElementById("adm-email").value;
    window.storeData.contacts.address = document.getElementById("adm-address").value;
    
    // Сохраняем в settings
    window.storeData.settings.telegramUsername = document.getElementById("adm-tg-user").value;
    window.storeData.settings.telegramChannel = document.getElementById("adm-tg-channel").value;
    window.storeData.settings.vkUrl = document.getElementById("adm-vk-url").value;
    
    window.storeData.settings.telegramBotToken = obfuscate(document.getElementById("adm-tg-token").value);
    window.storeData.settings.telegramChatId = obfuscate(document.getElementById("adm-tg-chatid").value);
    window.storeData.settings.adminPassword = document.getElementById("adm-admin-pw").value;

    // Смержим дублирующие поля для обратной совместимости
    window.storeData.contacts.telegram = window.storeData.settings.telegramUsername;
    window.storeData.contacts.telegramChannel = window.storeData.settings.telegramChannel;
    window.storeData.contacts.vk = window.storeData.settings.vkUrl;

    saveData();
    if (window.renderPageTexts) window.renderPageTexts();
    showToast("Контакты и настройки сохранены!");
  };

  // 7. Кнопка экспорта (Загрузка файла data.js)
  document.getElementById("adm-export-file-btn").onclick = () => {
    exportDataToFile();
  };
}

// Запись в localStorage
function saveData() {
  localStorage.setItem("FLEUR_STORE_DATA", JSON.stringify(window.storeData));
}

// Функция генерации и скачивания файла data.js
function exportDataToFile() {
  if (!window.storeData) return;

  // Формируем красивый JS код для скачивания
  const jsContent = `/**
 * Базовые данные интернет-магазина Plush Flowers.
 * Этот файл можно редактировать вручную или через визуальную панель администратора на сайте.
 */
window.DEFAULT_STORE_DATA = ${JSON.stringify(window.storeData, null, 2)};
`;

  // Создаем файл в памяти
  const blob = new Blob([jsContent], { type: "application/javascript;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  
  // Создаем невидимую ссылку и кликаем на неё
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "data.js";
  document.body.appendChild(link);
  link.click();
  
  // Удаляем элементы из памяти
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);

  showToast("Файл data.js успешно скачан!");
}

// Toast уведомление для админ-панели (если в app.js не прогрузилось)
function showToast(message) {
  const toast = document.getElementById("admin-toast");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add("active");
  setTimeout(() => {
    toast.classList.remove("active");
  }, 2500);
}
