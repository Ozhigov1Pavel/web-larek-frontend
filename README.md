# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

# Ларёк

**Одностраничное приложение** для просмотра каталога товаров, добавления в корзину и оформления заказа.

---

## Установка и запуск

1. Клонировать репозиторий и перейти в папку проекта:

   ```bash
   git clone <repo-url>
   cd web-larek-frontend
   ```
2. Создать файл `.env` в корне проекта и добавить:

   ```env
   API_ORIGIN=https://larek-api.nomoreparties.co
   ```
3. Установить зависимости и запустить dev-сервер:

   ```bash
   yarn install
   yarn start
   ```
4. Собрать production-бандл:

   ```bash
   yarn build
   ```

---

## Архитектура (MVP)

* **Model** (`src/models`): слой управления данными, хранит состояние и не выполняет рендер.
* **View** (`src/views`): слой отображения, привязывает браузерные события через `addEventListener`, не содержит бизнес-логику.
* **Presenter** (`src/index.ts`): единственная точка подписки на события `emitter.on`, координирует вызовы моделей и обновление представлений.

> Все классы получают в конструкторе экземпляр `EventEmitter` для генерации и подписки, но **подписка** (`on`) выполняется исключительно в `index.ts`.

---

## Слои и классы

### Утилиты (`src/utils`)

* **EventEmitter** — базовый брокер событий:

  * `on(event, handler)`, `off(event, handler)`, `emit(event, payload)`
* **ApiClient** — HTTP-клиент, используется только в `index.ts`

### Контейнер модального окна (`src/views/Modal.ts`)

* **Modal**:

  * **Поля:** контейнер `#modal-container`, кнопка «закрыть»
  * **Методы:**

    * `render(content: HTMLElement): void` — отображает переданный контент
    * `close(): void` — скрывает окно

### Карточка товара (`src/views/CardView.ts`)

* **CardView** — универсальный класс для всех шаблонов карточки:

  * **Конструктор:**

    ```ts
    new CardView(
      template: HTMLTemplateElement,
      data: ProductDto,
      onAction: (action: 'select' | 'add' | 'remove', dto: ProductDto) => void
    )
    ```
  * **Метод:** `create(): HTMLElement` —

    1. Клонирует `template.content`.
    2. Заполняет поля из `data`.
    3. Привязывает `addEventListener` к кнопкам «Подробнее» (`onAction('select', data)`), «Добавить» (`onAction('add', data)`), «Удалить» (`onAction('remove', data)`).
    4. Возвращает готовый элемент карточки.

### Представления (View)

#### MainPageView (`src/views/MainPageView.ts`)

> Ранее именовался `GalleryView`.

* **Поля:**

  * `root` — контейнер `.gallery`
  * `basketButton` — `.header__basket`
  * `basketCounter` — `.header__basket-counter`
* **Методы:**

  * `render(cards: HTMLElement[]): void` — `replaceChildren(cards)`
  * `bindBasketOpen(fn: () => void): void` — `addEventListener('click')` на `basketButton`
  * `updateCounter(count: number): void` — обновляет `basketCounter`

#### ProductDetailView (`src/views/ProductDetailView.ts`)

> **Не наследует** `Modal`, а **использует** его экземпляр.

* **Поля:**

  * `template`: HTMLTemplateElement `#card-detail`
  * `modal`: `Modal`
* **Метод:**

  * `show(data: ProductDto): void` —

    1. Клонирует шаблон, заполняет поля из `data`.
    2. Привязывает `click` на кнопку «Добавить» для `emit('detail:add', { productId: data.id })`.
    3. Передаёт контент в `modal.render(content)`.

#### CartView (`src/views/CartView.ts`)

* **Поля:**

  * `container`: элемент списка `.basket__list`
  * `totalDisplay`: `.basket__total`
* **Методы:**

  * `render(cards: HTMLElement[]): void` — `replaceChildren(cards)`
  * `showTotal(total: number): void` — обновляет `totalDisplay`
  * `bindCheckout(fn: () => void): void` — `addEventListener('click')` на кнопку «Оформить заказ»

#### OrderFormView (`src/views/OrderFormView.ts`)

* **Поля:** ссылки на input-элементы формы, radio-оплаты, кнопку submit.
* **Методы:**

  * `show(): void` — `modal.render(formElement)`
  * `bindValidation(fn: (field: keyof OrderRequestDto, value: string) => void): void` — `input`/`change`
  * `bindSubmit(fn: (data: OrderRequestDto) => void): void` — `submit` формы
  * `displayValidation(result: ValidationResult): void` — отображение ошибок, блокировка кнопки

> **Валидация**: модель `OrderModel.validateField` возвращает `ValidationResult`, через `emit('form:validated')` приходит обратно сюда.

#### SuccessView (`src/views/SuccessView.ts`)

* **Методы:**

  * `show(total: number): void` — `modal.render(successContent)`
  * `bindClose(fn: () => void): void` — `click` на крестик

---

### Модели (Model)

#### ProductModel (`src/models/ProductModel.ts`)

* **Поля:** internal `ProductDto[]`
* **Методы:**

  * `setProducts(items: ProductDto[]): void` — сохраняет и `emit('catalog:loaded', { products: items })`
  * `getProducts(): ProductDto[]`
  * `getById(id: string): ProductDto | undefined`

#### BasketModel (`src/models/BasketModel.ts`)

* **Поля:** internal `string[]` (ID товаров)
* **Методы:**

  * `add(id: string): void` — `emit('cart:updated', { items })`
  * `remove(id: string): void` — `emit('cart:updated', { items })`
  * `getItems(): string[]`
  * `clear(): void`

#### OrderModel (`src/models/OrderModel.ts`)

* **Поля:** хранит `OrderRequestDto`
* **Методы:**

  * `setPayment/Address/Email/Phone/Items/Total(...)`
  * `getOrderData(): OrderRequestDto`
  * `validateField(field, value): ValidationResult` — `emit('form:validated', { result })`

---

## События (Presenter в `src/index.ts`)

| Событие          | Генерируется                  | Payload                          | Действие в Presenter                            |
| ---------------- | ----------------------------- | -------------------------------- | ----------------------------------------------- |
| `catalog:loaded` | `ProductModel.setProducts`    | `{ products: ProductDto[] }`     | `MainPageView.render`                           |
| `card:select`    | `CardView`                    | `{ productId: string }`          | эмит `preview:change`                           |
| `preview:change` | Presenter                     | `{ product: ProductDto }`        | `ProductDetailView.show`                        |
| `detail:add`     | `ProductDetailView`           | `{ productId: string }`          | `BasketModel.add`                               |
| `cart:updated`   | `BasketModel`                 | `{ items: string[] }`            | `CartView.render`, `MainPageView.updateCounter` |
| `basket:open`    | `MainPageView.bindBasketOpen` | `undefined`                      | `CartView.render`                               |
| `checkout:init`  | `CartView.bindCheckout`       | `undefined`                      | `OrderFormView.show`                            |
| `form:validated` | `OrderModel.validateField`    | `{ result: ValidationResult }`   | `OrderFormView.displayValidation`               |
| `order:submit`   | `OrderFormView.bindSubmit`    | `{ data: OrderRequestDto }`      | API-запрос → `emit('order:success')`            |
| `order:success`  | APIClient callback            | `{ response: OrderResponseDto }` | `SuccessView.show`                              |
| `modal:close`    | `SuccessView.bindClose`       | `undefined`                      | `Modal.close`                                   |

---


