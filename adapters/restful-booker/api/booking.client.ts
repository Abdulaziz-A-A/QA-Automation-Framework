import type { ApiClient, ApiResponse } from '@core';
import type { Booking } from './schemas';

export interface BookingFilters {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

/**
 * Typed client for the booking API: one method per endpoint, named after what it does.
 * Methods return the raw ApiResponse so each test decides which status and shape to expect,
 * which is what lets the same client drive both happy-path and negative tests.
 */
export class BookingClient {
  constructor(private readonly api: ApiClient) {}

  /** A copy of this client that sends the admin token with every call. */
  authorizedWith(token: string): BookingClient {
    return new BookingClient(this.api.withHeaders({ Cookie: `token=${token}` }));
  }

  ping = (): Promise<ApiResponse> => this.api.get('/ping');

  createToken = (username: string, password: string): Promise<ApiResponse> =>
    this.api.post('/auth', { data: { username, password } });

  list = (filters: BookingFilters = {}): Promise<ApiResponse> => this.api.get('/booking', { params: { ...filters } });

  get = (id: number): Promise<ApiResponse> => this.api.get(`/booking/${id}`);

  create = (booking: unknown): Promise<ApiResponse> => this.api.post('/booking', { data: booking });

  update = (id: number, booking: Booking): Promise<ApiResponse> => this.api.put(`/booking/${id}`, { data: booking });

  patch = (id: number, changes: Partial<Booking>): Promise<ApiResponse> => this.api.patch(`/booking/${id}`, { data: changes });

  delete = (id: number): Promise<ApiResponse> => this.api.delete(`/booking/${id}`);
}
