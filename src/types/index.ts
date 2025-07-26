// src/types/index.ts

/**
 * API DTO-объекты
 */

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

/**
 * Внутренние модели данных (доменная область)
 */

/** Товар в приложении (после трансформации из DTO) */
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
}

/** Элемент корзины */
export interface BasketItem {
  productId: string;
  quantity: number;
}

/** Данные заказа в приложении */
export interface OrderData {
  items: BasketItem[];
  address: string;
  payment: 'online' | 'cash';
  email: string;
  phone: string;
}

/** Результат создания заказа */
export interface OrderResult {
  orderId: string;
  total: number;
}

/**
 * Интерфейсы основных слоёв
 */

/** HTTP-клиент для взаимодействия с API */
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

/** Интерфейс модели товаров */
export interface IProductModel {
  fetchAll(): Promise<void>;
  getById(id: string): Product | undefined;
}

/** Интерфейс модели корзины */
export interface IBasketModel {
  add(item: BasketItem): void;
  remove(productId: string): void;
  getItems(): BasketItem[];
  clear(): void;
}

/** Интерфейс модели заказа */
export interface IOrderModel {
  setPayment(method: 'online' | 'cash'): void;
  setAddress(address: string): void;
  setContacts(email: string, phone: string): void;
  submit(): Promise<OrderResult>;
}

/**
 * Интерфейсы слоёв View
 */

/** Представление галереи товаров */
export interface IGalleryView {
  render(items: Product[]): void;
  bindItemClick(handler: (id: string) => void): void;
}

/** Представление деталей товара */
export interface IProductDetailView {
  show(product: Product): void;
  bindAdd(handler: (productId: string) => void): void;
}

/** Представление корзины */
export interface IBasketView {
  render(items: BasketItem[]): void;
  bindRemove(handler: (productId: string) => void): void;
  bindCheckout(handler: () => void): void;
}

/** Представление оформления заказа */
export interface IOrderView {
  showStep1(): void;
  showStep2(): void;
  showStep3(): void;
  bindSubmit(handler: (data: Partial<OrderData>) => void): void;
}

/** Представление успешного заказа */
export interface ISuccessView {
  show(total: number): void;
  bindClose(handler: () => void): void;
}

/**
 * События приложения и их payload
 */
export type EventType =
  | 'catalog:loaded'
  | 'product:selected'
  | 'detail:added'
  | 'basket:updated'
  | 'basket:opened'
  | 'checkout:init'
  | 'order:updated'
  | 'order:submitted'
  | 'order:success'
  | 'modal:close';

export interface EventPayloads {
  'catalog:loaded': { products: Product[] };
  'product:selected': { productId: string };
  'detail:added': { product: Product };
  'basket:updated': { items: BasketItem[] };
  'basket:opened': undefined;
  'checkout:init': undefined;
  'order:updated': { data: Partial<OrderData> };
  'order:submitted': { data: OrderData };
  'order:success': { response: OrderResult };
  'modal:close': undefined;
}
