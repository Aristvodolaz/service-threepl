# X_Three_PL Service API

Backend-сервис на Node.js с Express для работы с таблицей X_Three_PL в SQL Server.

## Функциональность

- POST endpoint `/x3pl/add` для добавления записей в таблицу X_Three_PL
- Автоматический поиск названия склада по штрих-коду в таблице x_Storage_Scklads
- Swagger UI документация на `/api-docs`
- Слоистая архитектура: Controller → Service → Repository → Database

## Установка

1. Клонируйте репозиторий

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` в корне проекта со следующими параметрами:
```env
# SQL Server configuration
DB_SERVER=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_database_name
DB_PORT=1433

# Server configuration
PORT=3000
NODE_ENV=development
```

## Запуск

### Production режим:
```bash
npm start
```

### Development режим (с автоперезагрузкой):
```bash
npm run dev
```

## API Endpoints

### POST /x3pl/add
Добавляет новую запись в таблицу X_Three_PL.

**Request Body:**
```json
{
  "shk": "string",
  "name": "string",
  "wr_shk": "string",
  "kolvo": 1,
  "condition": "string",
  "reason": "string (optional)",
  "ispolnitel": "string"
}
```

**Success Response:**
```json
{
  "success": true,
  "errorCode": 0,
  "value": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "errorCode": 400,
  "value": {
    "error": "описание ошибки"
  }
}
```

### GET /x3pl/razmeshennye
Возвращает все размещенные товары из таблицы X_Three_PL.

**Условия выборки:**
- `kolvo > 0`
- `wr_shk IS NOT NULL AND wr_shk != ''`
- `wr_name IS NOT NULL AND wr_name != ''`

**Success Response:**
```json
{
  "success": true,
  "errorCode": 0,
  "value": {
    "items": [
      {
        "shk": "string",
        "name": "string",
        "wr_shk": "string",
        "wr_name": "string",
        "kolvo": 1,
        "condition": "string",
        "reason": "string (optional)"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "errorCode": 500,
  "value": {
    "error": "описание ошибки"
  }
}
```

### GET /x3pl/nerazmeshennye
Возвращает все неразмещенные товары из таблицы X_Three_PL.

**Условия выборки:**
- `kolvo = 0`
- `wr_shk IS NULL OR wr_shk = ''`
- `wr_name IS NULL OR wr_name = ''`

**Success Response:**
```json
{
  "success": true,
  "errorCode": 0,
  "value": {
    "items": [
      {
        "shk": "string",
        "name": "string",
        "wr_shk": "string",
        "wr_name": "string",
        "kolvo": 0,
        "condition": "string",
        "reason": "string (optional)"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "errorCode": 500,
  "value": {
    "error": "описание ошибки"
  }
}
```

### POST /x3pl/snyatie
Снимает товар из ячейки, изменяя или удаляя запись в таблице X_Three_PL.

**Request Body:**
```json
{
  "shk": "string",
  "wr_shk": "string",
  "condition": "string",
  "kolvo": 1
}
```

**Логика работы:**
- Ищет запись по условиям: `shk`, `wr_shk`, `condition`, `kolvo >= :kolvo`
- Если `kolvo == запись.kolvo` - удаляет запись полностью
- Если `kolvo < запись.kolvo` - уменьшает количество и обновляет `date_upd`

**Success Response:**
```json
{
  "success": true,
  "errorCode": 0,
  "value": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "errorCode": 400,
  "value": {
    "error": "Недостаточное количество или запись не найдена"
  }
}
```

### GET /x3pl/search
Ищет записи по штрих-коду склада (wr_shk).

**Query Parameters:**
- `wr_shk` (обязательный) - штрих-код склада для поиска

**Пример запроса:**
```
GET /x3pl/search?wr_shk=CELL001
```

**Success Response:**
```json
{
  "success": true,
  "errorCode": 0,
  "value": {
    "items": [
      {
        "shk": "string",
        "name": "string",
        "wr_shk": "string",
        "wr_name": "string",
        "kolvo": 1,
        "condition": "string",
        "reason": "string (optional)"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "errorCode": 400,
  "value": {
    "error": "Параметр wr_shk обязателен"
  }
}
```

## Структура проекта

```
project-root/
├── controllers/      # HTTP контроллеры
├── services/         # Бизнес-логика
├── repositories/     # Работа с БД
├── routes/          # Express роуты
├── models/          # Модели данных
├── config/          # Конфигурационные файлы
├── app.js           # Главный файл приложения
└── package.json     # Зависимости проекта
```

## Swagger UI

API документация доступна по адресу: `http://localhost:3000/api-docs`

## База данных

Сервис работает с двумя таблицами:

1. **dbo.X_Three_PL** - основная таблица для хранения данных
2. **SPOe_rc.dbo.x_Storage_Scklads** - справочник складов

При первом запуске сервис автоматически создаст таблицу X_Three_PL, если она не существует.

## Обработка ошибок

Все ошибки обрабатываются на каждом уровне архитектуры и возвращаются в едином формате:
```json
{
  "success": false,
  "error": "текст ошибки"
}
``` 