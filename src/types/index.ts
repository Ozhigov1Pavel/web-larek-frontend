// src/types/index.ts

/** API-DTO объекты */

/** Ответ API при получении списка товаров */
export interface ProductListResponse {
  total: number;
  items: ProductDto[];
}

/** Единичный товар из API */
export interface ProductDto {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number | null;
}

/** Ответ API при получении деталей товара */
export type ProductDetailResponse = ProductDto;

/** Параметры запроса при оформлении заказа */
export interface OrderRequestDto {
  payment: 'online' | 'cash';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[]; // массив id товаров
}

/** Ответ API при успешном оформлении заказа */
export interface OrderResponseDto {
  id: string;
  total: number;
}

/** Результат валидации формы заказа */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/** Модель данных заказа (расширяет запрос) */
export type OrderData = OrderRequestDto;

/** Интерфейсы моделей (Model) */

/** Работа с данными товаров */
export interface IProductModel {
  setProducts(items: ProductDto[]): void;
  getProducts(): ProductDto[];
  getById(id: string): ProductDto | undefined;
}

/** Работа с корзиной (хранит массив id товаров) */
export interface IBasketModel {
  add(productId: string): void;
  remove(productId: string): void;
  getItems(): string[];
  clear(): void;
}

/** Работа с заказом */
export interface IOrderModel {
  setPayment(method: 'online' | 'cash'): void;
  setAddress(address: string): void;
  setEmail(email: string): void;
  setPhone(phone: string): void;
  setItems(items: string[]): void;
  setTotal(total: number): void;
  getOrderData(): OrderRequestDto;
  validateField(field: keyof OrderRequestDto, value: string): ValidationResult;
}

/** HTTP-клиент для API (используется только в index.ts) */
export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T, U>(path: string, data: U): Promise<T>;
  put<T, U>(path: string, data: U): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

/** Интерфейс брокера событий */
export interface IEventEmitter {
  on<E extends EventType>(event: E, handler: (payload: EventPayloads[E]) => void): void;
  off<E extends EventType>(event: E, handler: (payload: EventPayloads[E]) => void): void;
  emit<E extends EventType>(event: E, payload: EventPayloads[E]): void;
}

/** Интерфейсы представлений (View) */

/** Идентификаторы шаблонов карточки */
export type TemplateId = '#card-main' | '#card-detail' | '#card-cart';

/** Конфигурация карточки товара */
export interface CardConfig {
  templateId: TemplateId;
  data: ProductDto;
  onClick: (data: ProductDto) => void;
}

/** Представление главной страницы: галерея и корзина */
export interface IMainPageView {
  render(cards: HTMLElement[]): void;
  bindBasketOpen(handler: () => void): void;
  updateCounter(count: number): void;
}

/** Представление деталей товара в модальном окне */
export interface IProductDetailView {
  show(data: ProductDto): void;
  bindAdd(handler: (productId: string) => void): void;
}

/** Представление корзины */
export interface ICartView {
  render(cards: HTMLElement[]): void;
  bindCheckout(handler: () => void): void;
}

/** Представление формы оформления заказа */
export interface IOrderFormView {
  show(): void;
  bindSubmit(handler: (data: OrderRequestDto) => void): void;
  bindValidation(handler: (field: keyof OrderRequestDto, value: string) => void): void;
  displayValidation(result: ValidationResult): void;
}

/** Представление окна успеха после заказа */
export interface ISuccessView {
  show(total: number): void;
  bindClose(handler: () => void): void;
}

/** События приложения и их payload */
export type EventType =
  | 'catalog:loaded'
  | 'card:select'
  | 'preview:change'
  | 'detail:add'
  | 'cart:updated'
  | 'basket:open'
  | 'checkout:init'
  | 'form:validated'
  | 'order:submit'
  | 'order:success'
  | 'modal:close';

export interface EventPayloads {
  'catalog:loaded': { products: ProductDto[] };
  'card:select': { productId: string };
  'preview:change': { product: ProductDto };
  'detail:add': { productId: string };
  'cart:updated': { items: string[] };
  'basket:open': undefined;
  'checkout:init': undefined;
  'form:validated': { result: ValidationResult };
  'order:submit': { data: OrderRequestDto };
  'order:success': { response: OrderResponseDto };
  'modal:close': undefined;
}
