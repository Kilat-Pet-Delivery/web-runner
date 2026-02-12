export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  detail?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
