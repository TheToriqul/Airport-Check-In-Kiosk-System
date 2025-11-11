export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
