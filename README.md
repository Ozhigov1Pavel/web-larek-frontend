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

## Архитектура приложения

* **Паттерн:** MVP (Model-View-Presenter)
* **Слои:**

  * **Model:** бизнес-логика и состояние (`src/models`)
  * **View:** отображение и взаимодействие с DOM (`src/views`)
  * **Presenter:** связь Model и View через события и обработчики (`src/presenters`)

## Стек технологий

* **HTML:** шаблоны и разметка (`index.html`)
* **SCSS:** стилизация (`src/scss`)
* **TypeScript:** логика и типизация (`src/index.ts`, `src/**/*`)
* **Webpack:** сборка и бандлирование (`webpack.config.js`)

## Установка и запуск

1. Создать `.env` в корне:

   ```env
   API_ORIGIN=https://larek-api.nomoreparties.co
   ```
2. Установить зависимости:

   ```bash
   ```

yarn install

````
3. Запустить dev-сервер:
```bash
yarn start
````

4. Собрать продакшн-версию:

   ```bash
   ```

yarn build

```

## Список событий

| Событие            | Источник            | Полезная нагрузка           | Описание                                           |
| ------------------ | ------------------- | --------------------------- | -------------------------------------------------- |
| `catalog:loaded`   | `ProductModel`      | `products: Product[]`       | После загрузки списка товаров                     |
| `product:selected` | `GalleryView`       | `productId: string`         | При клике на карточку товара                      |
| `detail:added`     | `ProductDetailView` | `product: Product`          | При добавлении товара в корзину из окна деталей    |
| `basket:updated`   | `BasketModel`       | `items: BasketItem[]`       | После изменения содержимого корзины               |
| `basket:opened`    | `BasketView`        | —                           | Открытие окна корзины                              |
| `checkout:init`    | Любой презентер     | —                           | Начало оформления заказа                           |
| `order:updated`    | `OrderModel`        | `partial: Partial<OrderData>` | После изменения данных заказа                   |
| `order:submitted`  | `OrderModel`        | `data: OrderData`           | После отправки заказа                              |
| `order:success`    | `OrderModel`        | `response: OrderResponse`   | При успешном оформлении заказа                     |
| `modal:close`      | `ModalView`         | —                           | При закрытии любого модального окна                |

## Классы приложения

### Утилиты (`src/utils`)

#### EventEmitter
- **Поля:**
- `private listeners: Record<string, Set<(...args: any[]) => void>>`
- **Методы:**
- `on(event: string, handler: (...args: any[]) => void): void`
- `off(event: string, handler: (...args: any[]) => void): void`
- `emit(event: string, payload?: any): void`
- **Конструктор:**
- `new EventEmitter()`

#### ApiClient
- **Поля:**
- `private baseUrl: string`
- `private emitter: EventEmitter`
- **Методы:**
- `get<T>(path: string): Promise<T>`
- `post<T, U>(path: string, data: U): Promise<T>`
- `put<T, U>(path: string, data: U): Promise<T>`
- `delete<T>(path: string): Promise<T>`
- **Конструктор:**
- `new ApiClient(baseUrl: string, emitter: EventEmitter)`

### Model (`src/models`)

#### ProductModel
- **Поля:**
- `private api: ApiClient`
- `private emitter: EventEmitter`
- `private products: Product[]`
- **Методы:**
- `async fetchAll(): Promise<void>` — загружает товары, затем `emit('catalog:loaded', products)`
- `getById(id: string): Product | undefined`
- **Конструктор:**
- `new ProductModel(apiClient: ApiClient, emitter: EventEmitter)`

#### BasketModel
- **Поля:**
- `private emitter: EventEmitter`
- `private items: BasketItem[]`
- **Методы:**
- `add(item: BasketItem): void` — добавляет и `emit('basket:updated', items)`
- `remove(productId: string): void` — удаляет и `emit('basket:updated', items)`
- `getTotal(): number`
- `clear(): void`
- **Конструктор:**
- `new BasketModel(emitter: EventEmitter)`

#### OrderModel
- **Поля:**
- `private api: ApiClient`
- `private emitter: EventEmitter`
- `private data: OrderData`
- **Методы:**
- `setPayment(method: 'online' | 'cash'): void`
- `setAddress(address: string): void`
- `setContacts(email: string, phone: string): void`
- `async submit(): Promise<OrderResponse>` — `emit('order:submitted', data)` и `emit('order:success', response)`
- **Конструктор:**
- `new OrderModel(apiClient: ApiClient, emitter: EventEmitter)`

### Presenter (`src/presenters`)

#### GalleryPresenter
- **Поля:**
- `private model: ProductModel`
- `private view: GalleryView`
- `private emitter: EventEmitter`
- **Методы:**
- `init(): void` — вызывает `model.fetchAll()`, подписывается на `catalog:loaded` и вызывает `view.render`
- **Конструктор:**
- `new GalleryPresenter(model, view, emitter)`

#### ProductDetailPresenter
- **Поля:**
- `private model: ProductModel`
- `private basket: BasketModel`
- `private view: ProductDetailView`
- `private emitter: EventEmitter`
- **Методы:**
- `init(): void` — подписывается на `product:selected` и `view.bindAdd`
- **Конструктор:**
- `new ProductDetailPresenter(model, basket, view, emitter)`

#### BasketPresenter
- **Поля:**
- `private model: BasketModel`
- `private view: BasketView`
- `private emitter: EventEmitter`
- **Методы:**
- `init(): void` — подписывается на `basket:updated` и `view.bindRemove`, открывает корзину по `basket:opened`
- **Конструктор:**
- `new BasketPresenter(model, view, emitter)`

#### OrderPresenter
- **Поля:**
- `private model: OrderModel`
- `private view: OrderView`
- `private emitter: EventEmitter`
- **Методы:**
- `init(): void` — подписывается на `checkout:init`, `order:updated`, `view.bindSubmit`
- **Конструктор:**
- `new OrderPresenter(model, view, emitter)`

### View (`src/views`)
> Все классы View получают в конструкторе:
> - `root: HTMLElement`
> - `template: HTMLTemplateElement`
> - `emitter: EventEmitter`
> Поля в них — только ссылки на DOM-элементы; состояние хранится в Model.

#### GalleryView
- **Поля:**
- `private root: HTMLElement` — `.gallery`
- `private template: HTMLTemplateElement` — `#card-catalog`
- **Методы:**
- `render(items: Product[]): void`
- `bindItemClick(handler: (id: string) => void): void`

#### ModalView
- **Поля:**
- `protected container: HTMLElement` — `.modal`
- `protected closeBtn: HTMLButtonElement`
- `protected content: HTMLElement`
- **Методы:**
- `open(): void`
- `close(): void`
- `setContent(el: HTMLElement): void`

#### ProductDetailView extends ModalView
- **Поля:**
- `private template: HTMLTemplateElement` — `#card-preview`
- **Методы:**
- `show(product: Product): void`
- `bindAdd(handler: (product: Product) => void): void`

#### BasketView extends ModalView
- **Поля:**
- `private template: HTMLTemplateElement` — `#basket`
- `private list: HTMLElement` — `.basket__list`
- `private total: HTMLElement` — `.basket__price`
- **Методы:**
- `render(items: BasketItem[]): void`
- `bindRemove(handler: (id: string) => void): void`
- `bindCheckout(handler: () => void): void`

#### OrderView extends ModalView
- **Поля:**
- `private form: HTMLFormElement`
- `private addressInput: HTMLInputElement`
- `private emailInput: HTMLInputElement`
- `private phoneInput: HTMLInputElement`
- **Методы:**
- `showStep1(): void`
- `showStep2(): void`
- `showStep3(): void`
- `bindSubmit(handler: (data: Partial<OrderData>) => void): void`

#### SuccessView extends ModalView
- **Поля:**
- `private template: HTMLTemplateElement` — `#success`
- **Методы:**
- `show(total: number): void`
- `bindClose(handler: () => void): void`

```
