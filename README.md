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

Одностраничное приложение (SPA) для просмотра каталога товаров, управления корзиной и оформления заказа.


## Установка и запуск

```bash
# Клонирование и переход в директорию
git clone <repo-url>
cd web-larek-frontend

# Установка зависимостей и запуск дев-сервера
yarn install
yarn start

# Сборка продакшн-версии
yarn build
```

## Общая архитектура (MVP)

**Model–View–Presenter**:

* **Model** — хранит состояние и бизнес‑логику, выполненная работа по валидации и изменениям данных; не обращается напрямую к DOM и не вызывает HTTP-запросы.
* **View** — отвечает только за работу с DOM: отрисовку, получение данных из полей и добавление слушателей встроенных браузерных событий (`addEventListener`). Не содержит бизнес‑логики.
* **Presenter** — единственное место, где происходит:

  * вызов методов API;
  * создание всех экземпляров моделей, представлений и `EventEmitter`;
  * подписка на сгенерированные события (`emitter.on(...)`);
  * вызов методов моделей и представлений в ответ на события.

Связь между Model и View осуществляется строго через `EventEmitter`:

1. В конструкторе каждого класса (Model или View) сохраняется ссылка на один и тот же экземпляр `emitter`.
2. View добавляет слушатели встроенных событий на элементы (`click`, `input` и т.д.) и в них генерирует собственные события через `emitter.emit(...)`.
3. Presenter (`index.ts`) подписывается (`emitter.on`) на все события и вызывает нужные методы моделей или представлений.
4. Модель после изменения состояния **только** генерирует события через `emitter.emit`, а не вызывает View напрямую.

> 🔔 **Важно**: подписка на события (`emitter.on`) должна происходить только в `src/index.ts`. Во View и Model — только вызовы `emitter.emit(...)`.

## Структура проекта

```
src/
├── index.ts           # точка входа (Presenter)
├── api.ts             # обёртка над Fetch; используется лишь в index.ts
├── events.ts          # перечисление констант имен событий
├── types/             # объявления DTO и интерфейсов
│   └── index.ts       # ProductDto, OrderRequestDto, EventNames и т. д.
├── models/            # Model: состояние и бизнес‑логика
│   ├── ProductModel.ts
│   ├── BasketModel.ts
│   └── OrderModel.ts
├── views/             # View: работа с DOM
│   ├── Modal.ts
│   ├── CardView.ts
│   ├── GalleryView.ts
│   ├── ProductDetailView.ts
│   ├── CartView.ts
│   ├── OrderFormView.ts
│   └── SuccessView.ts
└── utils/
    └── EventEmitter.ts
```

---

## Model

### ProductModel

```ts
constructor(emitter: EventEmitter)
private products: ProductDto[] = []

setProducts(data: ProductDto[]): void
  // сохраняет в this.products и emit('catalog:loaded', { products: this.products })

getAll(): ProductDto[]
  // возвращает this.products
```

### BasketModel

```ts
constructor(emitter: EventEmitter)
private items: string[] = []

add(productId: string): void
  // добавляет, если ещё нет, и emit('basket:updated', { items: this.items })

remove(productId: string): void
  // удаляет, если есть, и emit('basket:updated', { items: this.items })

clear(): void
  // очищает корзину и emit('basket:updated', { items: [] })

getItems(): string[]
```

### OrderModel

```ts
constructor(emitter: EventEmitter)
private payment: 'online' | 'cash' | null = null
private address = ''
private contacts = { email: '', phone: '' }
private items: string[] = []
private total = 0

setPayment(method: 'online' | 'cash'): void
  // валидация, this.payment = method и emit('order:validated', { field: 'payment', valid })

setAddress(address: string): void
  // валидация, this.address = address и emit('order:validated', { field: 'address', valid })

setContacts(email: string, phone: string): void
  // валидация, this.contacts = {...} и emit('order:validated', { field: 'contacts', valid })

setItems(items: string[]): void
setTotal(amount: number): void

submit(): Promise<void>
  // вызывает API (через Presenter), затем emit('order:submitted', { request }), и при успехе emit('order:success', { response })
```

> ❗️ Методы запроса к серверу **не** реализуются внутри моделей — их должен вызвать Presenter.

---

## View

### Modal

Универсальный контейнер для отображения любого контента из шаблонов `index.html`.

```ts
constructor(emitter: EventEmitter)
private container = document.getElementById('modal-container')!

render(content: HTMLElement): void
  // вставить content, добавить класс открытого модального

close(): void
  // убрать контент и закрыть модальное окно
```

### CardView

Одна реализация для любых трёх шаблонов карточки (галерея, детальный просмотр, корзина).

```ts
constructor(
  emitter: EventEmitter,
  templateSelector: string,     // CSS-селектор нужного template
  data: ProductDto | BasketItemDto,
  callbacks: Record<string, (id: string) => void>
)
create(): HTMLElement
  // клонирует template, заполняет поля, добавляет обработчики click на кнопки через callbacks
```

### GalleryView

Главная страница с галереей товаров и иконкой корзины.

```ts
constructor(emitter: EventEmitter)
private basketBtn = document.querySelector('.header__basket')!
private counterEl = document.querySelector('.header__basket-counter')!

render(cards: HTMLElement[]): void
  // this.root.replaceChildren(...cards)

bindBasketOpen(handler: () => void): void
  // this.basketBtn.addEventListener('click', handler)

updateCounter(count: number): void
  // this.counterEl.textContent = String(count)
```

### ProductDetailView

Показывает карточку товара внутри Modal (композиция).

```ts
constructor(emitter: EventEmitter, modal: Modal)
show(product: ProductDto): void
  // создает CardView с детальным шаблоном и вставляет в modal.render

bindAdd(handler: (id: string) => void): void
  // внутри CardView
```

### CartView

Список товаров в корзине и кнопка «Оформить».

```ts
constructor(emitter: EventEmitter, modal: Modal)
render(cards: HTMLElement[], total: number): void
  // this.list.replaceChildren(...cards); this.totalEl.textContent = total

bindCheckout(handler: () => void): void
  // this.checkoutBtn.addEventListener('click', handler)
```

### OrderFormView

Форма оформления заказа (шаги 1 и 2).

```ts
constructor(emitter: EventEmitter, modal: Modal)
showStep1(): void
showStep2(): void
showSuccess(): void

bindPaymentSelection(handler: (method: string) => void): void
bindAddressInput(handler: (value: string) => void): void
bindContactInput(handler: (field: 'email'|'phone', value: string) => void): void
bindSubmit(handler: () => void): void

displayValidation(errors: Record<string,string>): void
  // показывает текст ошибок и блокирует/разблокирует кнопку Next/Submit
```

### SuccessView

Отображает сообщение об успехе и сумму заказа.

```ts
constructor(emitter: EventEmitter, modal: Modal)
bindClose(handler: () => void): void
show(total: number): void
```

---

## События и Presenter (`src/index.ts`)

Единая точка входа:

1. Создает `emitter = new EventEmitter()`, `api = new ApiClient()`, модели, views и `modal`.
2. Подписывается на события через `emitter.on(eventName, handler)`:

   * `app:init` → вызвать `api.get('/products')`, затем `model.setProducts(data)`
   * `catalog:loaded` → в handler вызвать GalleryView\.render(\[...cards])
   * `card:select` → ProductDetailView\.show(productDto)
   * `detail:add` → BasketModel.add(id)
   * `basket:updated` → обновить GalleryView\.updateCounter и при открытии CartView\.render
   * `checkout:init` → OrderFormView\.showStep1()
   * `order:validated` → OrderFormView\.displayValidation(errors)
   * `order:submit` → OrderModel.submit()
   * `order:success` → SuccessView\.show(response.total)
   * `modal:close` → Modal.close()
3. Инициирует `emitter.emit('app:init')` при загрузке страницы.

> 🎯 В `index.ts` — инициализация, API-вызовы и все `on`–обработчики. Модели и Views **только** `emit`.

---



