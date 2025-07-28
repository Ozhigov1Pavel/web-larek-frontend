// src/types/index.ts

/** API DTO */

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
  items: string[];           // массив id товаров (каждый добавляется по одной штуке)
  address: string;
  payment: 'online' | 'cash';
  email: string;
  phone: string;
}

/** Ответ API при успешном оформлении заказа */
export interface OrderResponseDto {
  id: string;
  total: number;
}

/** Результат валидации поля */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/** Данные формы заказа во фронтенде */
export type OrderData = OrderRequestDto;

/** Интерфейсы моделей (Model) */

/** Работа с данными товаров */
export interface IProductModel {
  setProducts(items: ProductDto[]): void;
  getProducts(): ProductDto[];
  getById(id: string): ProductDto | undefined;
}

/** Работа с корзиной */
export interface IBasketModel {
  add(productId: string): void;
  remove(productId: string): void;
  clear(): void;
  getItems(): string[];
}

/** Работа с заказом */
export interface IOrderModel {
  setItems(items: string[]): void;
  setTotal(total: number): void;
  setPayment(method: 'online' | 'cash'): void;
  setAddress(address: string): void;
  setContacts(email: string, phone: string): void;
  validateField(field: keyof OrderRequestDto): ValidationResult;
  getOrderRequest(): OrderRequestDto;
}

/** HTTP-клиент для API (используется в Presenter) */
export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T, U>(path: string, data: U): Promise<T>;
}

/** Интерфейс брокера событий */
export interface IEventEmitter {
  on(event: EventName, handler: (payload: any) => void): void;
  off(event: EventName, handler: (payload: any) => void): void;
  emit(event: EventName, payload?: any): void;
}

/** Имена событий приложения */
export enum EventName {
  AppInit          = 'app:init',
  CatalogLoaded    = 'catalog:loaded',
  CardSelect       = 'card:select',
  PreviewChange    = 'preview:change',
  DetailAdd        = 'detail:add',
  BasketUpdated    = 'basket:updated',
  BasketOpen       = 'basket:open',
  CheckoutInit     = 'checkout:init',
  OrderValidated   = 'order:validated',
  OrderSubmit      = 'order:submit',
  OrderSuccess     = 'order:success',
  ModalClose       = 'modal:close'
}

/** Интерфейсы представлений (View) */

/** Идентификаторы шаблонов карточки */
export type TemplateId = '#card-main' | '#card-detail' | '#card-cart';

/** Конфигурация CardView */
export interface CardConfig {
  templateId: TemplateId;
  data: ProductDto;
  callbacks: {
    onSelect: (id: string) => void;
    onAdd?: (id: string) => void;
    onRemove?: (id: string) => void;
  };
}

/** Галерея товаров */
export interface IGalleryView {
  render(cards: HTMLElement[]): void;
  bindBasketOpen(handler: () => void): void;
  updateCounter(count: number): void;
}

/** Детали товара в модальном окне */
export interface IProductDetailView {
  show(product: ProductDto): void;
  bindAdd(handler: (productId: string) => void): void;
}

/** Корзина в модальном окне */
export interface ICartView {
  render(cards: HTMLElement[], total: number): void;
  bindCheckout(handler: () => void): void;
}

/** Форма оформления заказа */
export interface IOrderFormView {
  showStep1(): void;
  showStep2(): void;
  bindPaymentSelection(handler: (method: 'online' | 'cash') => void): void;
  bindAddressInput(handler: (address: string) => void): void;
  bindContactInput(handler: (field: 'email' | 'phone', value: string) => void): void;
  bindSubmit(handler: () => void): void;
  displayValidation(errors: Record<string, string>): void;
}

/** Окно успеха заказа */
export interface ISuccessView {
  show(total: number): void;
  bindClose(handler: () => void): void;
}
