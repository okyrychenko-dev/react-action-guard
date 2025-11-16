# Инструкция по публикации пакета

## Подготовка к публикации

### 1. Проверка перед публикацией

```bash
# Проверка типов
npm run typecheck

# Сборка пакета
npm run build

# Проверка содержимого пакета
npm pack --dry-run
```

### 2. Настройка npm (первый раз)

```bash
# Войдите в npm (если еще не вошли)
npm login

# Проверьте, что вы вошли
npm whoami
```

### 3. Обновление версии

Обновите версию в [package.json](package.json) перед публикацией:

```json
{
  "version": "0.1.0"  // измените на нужную версию
}
```

Или используйте команду:

```bash
# Патч версия (0.1.0 -> 0.1.1)
npm version patch

# Минорная версия (0.1.0 -> 0.2.0)
npm version minor

# Мажорная версия (0.1.0 -> 1.0.0)
npm version major
```

### 4. Публикация

```bash
# Публикация пакета (автоматически запустит prepublishOnly скрипт)
npm publish

# Для scoped пакетов (@okyrychenko-dev/...) убедитесь, что в package.json есть:
# "publishConfig": { "access": "public" }
```

## После публикации

### Создание Git тега

```bash
# Создайте тег для версии
git tag v0.1.0

# Отправьте тег на GitHub
git push origin v0.1.0
```

### Проверка публикации

```bash
# Проверьте пакет на npm
npm view @okyrychenko-dev/react-action-guard

# Или откройте в браузере
# https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard
```

## Важные замечания

1. **Email в package.json**: Обновите email автора в [package.json:37](package.json#L37)
   ```json
   "author": "Oleksandr Kyrychenko <your@email.com>"
   ```

2. **GitHub репозиторий**: Убедитесь, что URL репозитория правильный

3. **Версионирование**: Следуйте [Semantic Versioning](https://semver.org/)
   - MAJOR: несовместимые изменения API
   - MINOR: новая функциональность (обратно совместимая)
   - PATCH: исправления ошибок

4. **Перед каждой публикацией**:
   - Обновите README.md с описанием изменений
   - Проверьте, что все тесты проходят
   - Убедитесь, что сборка успешна
   - Обновите версию

## Проблемы и решения

### Ошибка "You must be logged in to publish packages"

```bash
npm login
```

### Ошибка "You do not have permission to publish"

Проверьте, что вы владелец пакета или имеете права на публикацию scoped пакета.

### Пакет уже существует

Если пакет с таким именем уже существует:
1. Измените имя в package.json
2. Или используйте scoped пакет (например, @ваш-username/package-name)
