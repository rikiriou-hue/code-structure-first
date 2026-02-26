// Shared types for the application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
