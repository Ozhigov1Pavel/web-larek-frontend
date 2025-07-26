/**
 * Типы данных, приходящие с API
 */
export namespace ApiTypes {
    export interface Movie {
      id: string;
      title: string;
      description: string;
      posterUrl: string;
      releaseDate: string;
      rating: number;
    }
  
    export interface User {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    }
  }
  
  /**
   * Внутренние модели приложения
   */
  export namespace ModelTypes {
    export interface MovieModel {
      id: string;
      title: string;
      overview: string;
      poster: string;
      released: Date;
      score: number;
    }
  
    export interface UserModel {
      id: string;
      fullName: string;
      email: string;
      avatar?: string;
    }
  }
  
  /**
   * Интерфейс API-клиента
   */
  export interface ApiClient {
    get<T>(path: string): Promise<T>;
    post<T, U>(path: string, payload: U): Promise<T>;
    put<T, U>(path: string, payload: U): Promise<T>;
    delete<T>(path: string): Promise<T>;
  }
  
  /**
   * Интерфейсы пропсов и состояний компонентов
   */
  export namespace ViewTypes {
    export interface FilmProps {
      movie: ModelTypes.MovieModel;
      onFavorite?: (movieId: string) => void;
      onDetails?: (movieId: string) => void;
    }
  
    export interface ButtonProps {
      label: string;
      disabled?: boolean;
      loading?: boolean;
      onClick: () => void;
    }
  }
  
  /**
   * Перечисление событий и их интерфейсы
   */
  export enum EventTypes {
    DataLoaded = 'data:loaded',
    MovieSelected = 'movie:selected',
    FavoriteToggled = 'favorite:toggled',
  }
  
  export namespace EventPayloads {
    export interface DataLoadedPayload<T> {
      items: T[];
    }
  
    export interface MovieSelectedPayload {
      movieId: string;
    }
  
    export interface FavoriteToggledPayload {
      movieId: string;
      isFavorite: boolean;
    }
  }
  