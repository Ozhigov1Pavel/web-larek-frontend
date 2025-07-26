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


## Установка и запуск

1. Клонировать репозиторий и перейти в папку проекта:

   ```bash
   git clone <repo-url>
   cd web-larek-frontend
   ```

2. Установить зависимости и запустить сервер разработки:

   ```bash
   yarn install
   yarn start
   ```
3. Собрать продакшн-версию:

   ```bash
   yarn build
   ```

## Архитектура приложения

Приложение построено по паттерну **MVP (Model-View-Presenter)**:

* **Model** — бизнес-логика и состояние.
* **View** — работа с DOM и отображение.
* **Presenter** — связывает Model и View через события.

Все классы получают в конструктором экземпляр `EventEmitter` для генерации и подписки на события.

## Структура классов

### Утилиты (`src/utils`)

#### `EventEmitter`

* **Конструктор**: `new EventEmitter()`
* **Поля:**

  * `private listeners: Record<string, Set<(...args: any[]) => void>>`
* **Методы:**

  * `on(event: string, handler: (...args: any[]) => void): void`
  * `off(event: string, handler: (...args: any[]) => void): void`
  * `emit(event: string, payload?: any): void`

#### `ApiClient`

* **Конструктор**: `new ApiClient(baseUrl: string, emitter: EventEmitter)`
* **Поля:**

  * `private baseUrl: string`
  * `private emitter: EventEmitter`
* **Методы:**

  * `get<T>(path: string): Promise<T>`
  * `post<T, U>(path: string, data: U): Promise<T>`
  * `put<T, U>(path: string, data: U): Promise<T>`
  * `delete<T>(path: string): Promise<T>`

### Модели (`src/models`)

#### `ProductModel`

* **Конструктор**: `new ProductModel(api: ApiClient, emitter: EventEmitter)`
* **Поля:**

  * `private api: ApiClient`
  * `private emitter: EventEmitter`
  * `private products: Product[]`
* **Методы:**

  * `fetchAll(): Promise<void>` — загрузить список, затем `emit('catalog:loaded', { products })`
  * `getById(id: string): Product | undefined`

#### `BasketModel`

* **Конструктор**: `new BasketModel(emitter: EventEmitter)`
* **Поля:**

  * `private emitter: EventEmitter`
  * `private items: BasketItem[]`
* **Методы:**

  * `add(item: BasketItem): void` — добавить, затем `emit('basket:updated', { items })`
  * `remove(productId: string): void` — удалить, затем `emit('basket:updated', { items })`
  * `getItems(): BasketItem[]`
  * `clear(): void`

#### `OrderModel`

* **Конструктор**: `new OrderModel(api: ApiClient, emitter: EventEmitter)`
* **Поля:**

  * `private api: ApiClient`
  * `private emitter: EventEmitter`
  * `private data: OrderData`
* **Методы:**

  * `setPayment(method: 'online' | 'cash'): void`
  * `setAddress(address: string): void`
  * `setContacts(email: string, phone: string): void`
  * `submit(): Promise<OrderResult>` — отправить, затем `emit('order:submitted', { data })` и `emit('order:success', { response })`

### Представления (`src/views`)

Все классы View получают конструктором:

* `root: HTMLElement` — контейнер в DOM
* `template: HTMLTemplateElement` — шаблон из `index.html`
* `emitter: EventEmitter`

Состояние в View не хранится, только ссылки на элементы.

#### `GalleryView`

* **Конструктор**: `new GalleryView(root, template, emitter)`
* **Поля:**

  * `private root: HTMLElement`
  * `private template: HTMLTemplateElement`
* **Методы:**

  * `render(items: Product[]): void`
  * `bindItemClick(handler: (id: string) => void): void`

#### `ProductDetailView extends ModalView`

* **Методы:**

  * `show(product: Product): void`
  * `bindAdd(handler: (productId: string) => void): void`

#### `BasketView extends ModalView`

* **Методы:**

  * `render(items: BasketItem[]): void`
  * `bindRemove(handler: (productId: string) => void): void`
  * `bindCheckout(handler: () => void): void`

#### `OrderView extends ModalView`

* **Методы:**

  * `showStep1/2/3(): void`
  * `bindSubmit(handler: (data: Partial<OrderData>) => void): void`

#### `SuccessView extends ModalView`

* **Методы:**

  * `show(total: number): void`
  * `bindClose(handler: () => void): void`

### Презентеры (`src/presenters`)

#### `GalleryPresenter`

* **Конструктор**: `new GalleryPresenter(model, view, emitter)`
* **Методы:**

  * `init(): void` — `model.fetchAll()`, слушает `catalog:loaded` → `view.render`

#### `ProductDetailPresenter`

* **Конструктор**: `new ProductDetailPresenter(model, basket, view, emitter)`
* **Методы:**

  * `init(): void` — слушает `product:selected`, `view.bindAdd` → `basket.add`

#### `BasketPresenter`

* **Конструктор**: `new BasketPresenter(model, view, emitter)`
* **Методы:**

  * `init(): void` — слушает `basket:updated` → `view.render`, `view.bindRemove`, `view.bindCheckout`

#### `OrderPresenter`

* **Конструктор**: `new OrderPresenter(model, view, emitter)`
* **Методы:**

  * `init(): void` — слушает `checkout:init`, `order:updated`, `view.bindSubmit` → `model.submit`

## События

| Событие            | Генератор           | Payload                        | Описание                                  |
| ------------------ | ------------------- | ------------------------------ | ----------------------------------------- |
| `catalog:loaded`   | `ProductModel`      | `{ products: Product[] }`      | После загрузки каталога                   |
| `product:selected` | `GalleryView`       | `{ productId: string }`        | При клике на карточку                     |
| `detail:added`     | `ProductDetailView` | `{ product: Product }`         | При добавлении в корзину из окна деталей  |
| `basket:updated`   | `BasketModel`       | `{ items: BasketItem[] }`      | После изменения корзины                   |
| `basket:opened`    | `BasketView`        | `undefined`                    | При открытии корзины                      |
| `checkout:init`    | любой Presenter     | `undefined`                    | Начало оформления заказа                  |
| `order:updated`    | `OrderView`         | `{ data: Partial<OrderData> }` | При изменении данных заказа               |
| `order:submitted`  | `OrderModel`        | `{ data: OrderData }`          | При отправке заказа                       |
| `order:success`    | `OrderModel`        | `{ response: OrderResult }`    | При успешном ответе API о создании заказа |
| `modal:close`      | `ModalView`         | `undefined`                    | При закрытии любого модального окна       |

---

*Документация отражает архитектуру и основные классы приложения «Ларёк».*
