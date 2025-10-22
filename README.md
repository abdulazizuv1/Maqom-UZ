# 🎵 Farg'ona Maqom Maktab-Internati

**Официальный веб-сайт специализированной школы-интерната макома в Фергане**

## 📋 Описание

Farg'ona Maqom Maktab-Internati - это современный веб-сайт для специализированной школы-интерната традиционной музыки маком в Фергане, Узбекистан. Сайт предоставляет информацию о школе, новости, информацию о персонале и возможности для связи.

## ✨ Основные функции

- 🏠 **Главная страница** - приветствие и основная информация
- 📰 **Новости** - динамический слайдер с последними новостями
- 👥 **Персонал** - информация о преподавателях и администрации
- 📞 **Контактная форма** - форма обратной связи с EmailJS
- 🔐 **Админ-панель** - управление контентом с аутентификацией
- 📱 **Адаптивный дизайн** - оптимизация для всех устройств

## 🛠️ Технологический стек

### Frontend
- **HTML5** - семантическая разметка
- **CSS3** - современные стили с CSS Grid и Flexbox
- **JavaScript (ES6+)** - модульная архитектура
- **Font Awesome** - иконки
- **Google Fonts** - типографика

### Backend & Database
- **Firebase Firestore** - база данных
- **Firebase Authentication** - аутентификация
- **Firebase Storage** - хранение файлов
- **EmailJS** - отправка email

### Архитектура
- **Модульная система** - разделение на логические модули
- **Responsive Design** - адаптивная верстка
- **Progressive Enhancement** - улучшенная функциональность

## 📁 Структура проекта

```
Maqom UZ/
├── admin/                    # Админ-панель
│   ├── admin.html           # HTML админ-панели
│   ├── admin-firebase.js    # JavaScript для админ-панели
│   └── admin-style.css      # Стили админ-панели
├── config/                  # Конфигурация
│   └── app-config.js       # Центральная конфигурация
├── modules/                 # JavaScript модули
│   ├── data-manager-module.js    # Управление данными
│   ├── data-sync-module.js       # Синхронизация данных
│   ├── emailjs-module.js         # Email функциональность
│   ├── firebase-module.js        # Firebase интеграция
│   └── utils-module.js           # Утилиты
├── img/                     # Изображения
├── index.html              # Главная страница
├── main.js                 # Основной JavaScript
├── style.css               # Основные стили
└── README.md               # Документация
```

## 🚀 Установка и запуск

### Предварительные требования
- Веб-сервер (Apache, Nginx, или Live Server)
- Аккаунт Firebase
- Аккаунт EmailJS

### Настройка

1. **Клонируйте репозиторий**
   ```bash
   git clone [repository-url]
   cd "Maqom UZ"
   ```

2. **Настройте Firebase**
   - Создайте проект в Firebase Console
   - Включите Firestore Database
   - Включите Authentication
   - Включите Storage

3. **Настройте EmailJS**
   - Создайте аккаунт в EmailJS
   - Настройте email сервис
   - Создайте email шаблон

4. **Настройте конфигурацию**
   - Скопируйте `config/app-config.example.js` в `config/app-config.js`
   - Заполните ваши API ключи:
     ```javascript
     const AppConfig = {
       firebase: {
         apiKey: "your-firebase-api-key",
         authDomain: "your-project.firebaseapp.com",
         projectId: "your-project-id",
         // ... другие настройки
       },
       emailjs: {
         serviceId: "your-service-id",
         templateId: "your-template-id",
         publicKey: "your-public-key"
       }
     };
     ```

5. **Запустите проект**
   ```bash
   # Используя Live Server (рекомендуется)
   npx live-server
   
   # Или используя Python
   python -m http.server 8000
   ```

## 🎨 Кастомизация

### Цветовая схема
Основные цвета определены в CSS переменных:
```css
:root {
  --primary: #0a672b;        /* Основной зеленый */
  --accent: #c7a961;         /* Золотистый акцент */
  --bg-light: #f8faf9;       /* Светлый фон */
}
```

### Шрифты
- **Основной**: Montserrat (Google Fonts)
- **Fallback**: системные шрифты

## 📊 Производительность

### Оптимизации
- Lazy loading изображений
- Кэширование данных в localStorage
- Минификация CSS и JS (рекомендуется для продакшена)
- Сжатие изображений

### Мониторинг
- Firebase Analytics интегрирован
- Консольные логи для отладки

## 🐛 Отладка

### Общие проблемы
1. **Модули не загружаются**
   - Проверьте порядок загрузки скриптов
   - Убедитесь, что `app-config.js` загружается первым

2. **Firebase ошибки**
   - Проверьте API ключи в `app-config.js`
   - Убедитесь, что Firebase проект настроен правильно

3. **EmailJS не работает**
   - Проверьте настройки в EmailJS консоли
   - Убедитесь, что шаблон настроен правильно

### Логирование
Все модули используют консольное логирование. Откройте Developer Tools для просмотра логов.

## 📄 Лицензия

Этот проект создан для Farg'ona Maqom Maktab-Internati. Все права защищены.

## 📞 Контакты

- **Email**: farmaqommaktab@umail.uz
- **Телефон**: +998 (73) 244-43-17
- **Адрес**: Охунбобоев кўчаси 33, Farg'ona

## 🔗 Ссылки

- [Instagram](https://www.instagram.com/fargona_maqom_maktabi/)
- [Telegram](https://t.me/fargonamaqom)
- [Facebook](https://www.facebook.com/groups/1024253032296860/)
- [YouTube](https://www.youtube.com/@Fargona_Maqom_Maktabi)

---

**Создано с ❤️ для сохранения и развития традиционной музыки маком**
# Maqom-UZ
