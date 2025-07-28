# Ларёк

**Одностраничное приложение** для просмотра каталога товаров, добавления в корзину и оформления заказа.

---

## Установка и запуск

1. Клонировать и перейти в папку:

   ```bash
   git clone <repo-url>
   cd web-larek-frontend
   ```

2. Установить зависимости и запустить dev-сервер:

   ```bash
   ```

yarn install
yarn start

````
3. Собрать production-бандл:
```bash
yarn build
````

---

## Архитектура (MVP)

* **Model**: хранит и управляет данными (в `src/models`).
* **View**: отвечает за отображение (`src/views`), не хранит состояние.
* **Presenter**: координатор в `src/index.ts`, подписка на события происходит **только** здесь.

Все классы, которым нужно генерировать или слушать события, получают в конструкторе экземпляр `EventEmitter`.

---

## Слои и классы

### Утилиты (`src/utils`)

* **EventEmitter** — базовый брокер событий:

  * `on(event, handler)` / `off(event, handler)` / `emit(event, payload)`
* **ApiClient** — HTTP-клиент (используется лишь в `index.ts`)

### Контейнер модального окна (`src/views/Modal.ts`)

* **Modal**:

  * **Поля:** корневой элемент `#modal-container`, кнопка «закрыть»
  * **Методы:**

    * `render(content: HTMLElement)`: вставляет и открывает модальное окно
    * `close()`: скрывает окно

### Карточка товара (`src/views/CardView.ts`)

* **CardView**:

  * **Конструктор:**

    ```ts
    new CardView(template: HTMLTemplateElement, data: ProductDto, onClick: (dto) => void)
    ```
  * **Метод:** `create(): HTMLElement` — возвращает готовый элемент карточки

### Представления (View)

* **MainPageView** (`src/views/MainPageView.ts`):

  * **Поля:**

    * `root` — контейнер `.gallery`
    * `basketButton` — элемент `.header__basket`
    * `basketCounter` — `.header__basket-counter`
  * **Методы:**

    * `render(cards: HTMLElement[]): void` — вставляет списком карточки
    * `bindBasketOpen(fn: () => void): void`
    * `updateCounter(count: number): void`

* **ProductDetailView** (`src/views/ProductDetailView.ts`):

  * **Методы:**

    * `show(data: ProductDto): void`
    * `bindAdd(fn: (id: string) => void): void`

* **CartView** (`src/views/CartView.ts`):

  * **Методы:**

    * `render(cards: HTMLElement[]): void`
    * `bindCheckout(fn: () => void): void`

* **OrderFormView** (`src/views/OrderFormView.ts`):

  * **Методы:**

    * `show(): void`
    * `bindValidation(fn: (field, value) => void): void`
    * `bindSubmit(fn: (data) => void): void`
    * `displayValidation(result): void`

* **SuccessView** (`src/views/SuccessView.ts`):

  * **Методы:**

    * `show(total: number): void`
    * `bindClose(fn: () => void): void`

### Модели (Model)

* **ProductModel** (`src/models/ProductModel.ts`):

  * **Поля:** массив `ProductDto[]`
  * **Методы:**

    * `setProducts(items: ProductDto[]): void`
    * `getProducts(): ProductDto[]`
    * `getById(id: string): ProductDto | undefined`

* **BasketModel** (`src/models/BasketModel.ts`):

  * **Поля:** массив `string[]` (ID товаров)
  * **Методы:**

    * `add(id: string): void`
    * `remove(id: string): void`
    * `getItems(): string[]`
    * `clear(): void`

* **OrderModel** (`src/models/OrderModel.ts`):

  * **Поля:** структура `OrderRequestDto`
  * **Методы:**

    * `setPayment(method): void`, `setAddress(addr): void`, `setEmail(e): void`, `setPhone(p): void`
    * `setItems(ids: string[]): void`, `setTotal(sum: number): void`
    * `getOrderData(): OrderRequestDto`
    * `validateField(field, value): ValidationResult`

---

## События приложения (только в `index.ts`)

| Событие          | Где эмитится            | Payload                          | Действие (Presenter)                            |
| ---------------- | ----------------------- | -------------------------------- | ----------------------------------------------- |
| `catalog:loaded` | после API-запроса       | `{ products: ProductDto[] }`     | `MainPageView.render`                           |
| `card:select`    | в карточке (onClick)    | `{ productId: string }`          | запрос деталей и `emit('preview:change')`       |
| `preview:change` | после выбора            | `{ product: ProductDto }`        | `ProductDetailView.show`                        |
| `detail:add`     | в деталях товара        | `{ productId: string }`          | `BasketModel.add` + `emit('cart:updated')`      |
| `cart:updated`   | после изменения корзины | `{ items: string[] }`            | `CartView.render`, `MainPageView.updateCounter` |
| `basket:open`    | при открытии корзины    | `undefined`                      | `CartView.render`                               |
| `checkout:init`  | при клике «Оформить»    | `undefined`                      | `OrderFormView.show`                            |
| `form:validated` | при валидации поля      | `{ result: ValidationResult }`   | `OrderFormView.displayValidation`               |
| `order:submit`   | при отправке формы      | `{ data: OrderRequestDto }`      | API-запрос и `emit('order:success')`            |
| `order:success`  | после ответа API        | `{ response: OrderResponseDto }` | `SuccessView.show`                              |
| `modal:close`    | кнопка закрытия         | `undefined`                      | `Modal.close`                                   |

---

*Документация отражает актуальную MVP-архитектуру проекта «Ларёк» и соответствует коду.*
