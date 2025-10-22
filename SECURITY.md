# 🔒 Руководство по безопасности

## ⚠️ Важные замечания по безопасности

### 1. Конфигурационные файлы

**НЕ КОММИТЬТЕ** следующие файлы в репозиторий:
- `config/app-config.js` - содержит секретные API ключи
- `firebase-config.js` - устаревший файл с ключами
- `.firebaserc` - конфигурация Firebase

### 2. Настройка для разработки

1. **Скопируйте пример конфигурации**:
   ```bash
   cp config/app-config.example.js config/app-config.js
   ```

2. **Заполните ваши API ключи** в `config/app-config.js`:
   ```javascript
   const AppConfig = {
     firebase: {
       apiKey: "ваш-firebase-api-ключ",
       authDomain: "ваш-проект.firebaseapp.com",
       projectId: "ваш-проект-id",
       // ... остальные настройки
     },
     emailjs: {
       serviceId: "ваш-service-id",
       templateId: "ваш-template-id",
       publicKey: "ваш-public-key"
     }
   };
   ```

### 3. Firebase Security Rules

Убедитесь, что ваши Firebase Security Rules настроены правильно:

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Публичный доступ для чтения новостей и сотрудников
    match /news/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /employees/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Аутентификация

- Создайте пользователей в Firebase Authentication Console
- Используйте надежные пароли
- Регулярно обновляйте пароли администраторов

### 5. Мониторинг

- Включите Firebase Analytics для мониторинга
- Регулярно проверяйте логи в Firebase Console
- Настройте уведомления о подозрительной активности

### 6. Резервное копирование

- Регулярно экспортируйте данные из Firestore
- Сохраняйте резервные копии изображений
- Документируйте изменения в конфигурации

## 🚨 В случае компрометации

1. **Немедленно смените все API ключи**
2. **Проверьте Firebase Console на подозрительную активность**
3. **Обновите пароли всех администраторов**
4. **Проверьте Security Rules**

## 📞 Контакты для поддержки

При возникновении проблем с безопасностью обращайтесь к администратору системы.
