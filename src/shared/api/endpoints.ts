import { apiRequest } from './apiClient';
import type {
  AccountStatusResponse,
  AuthTelegramResponse,
  BinollaBalanceDto,
  BinollaConnectRequest,
  BinollaConnectResponse,
  BinollaCredentialRequest,
  BinollaStatusDto,
  MarketAssetsResponse,
  MarketCandlesResponse,
  MarketPriceResponse,
  MeResponse,
  PlaceTradeRequest,
  StrategiesResponse,
  StrategySignalResponse,
  TradeDto,
  TradeListResponse,
  AdminBinollaAccountDto,
  AdminBinollaAccountListResponse,
} from './types';

export const authApi = {
  telegram(initData: string): Promise<AuthTelegramResponse> {
    return apiRequest<AuthTelegramResponse>('/api/auth/telegram', {
      method: 'POST',
      body: { initData },
      auth: false,
    });
  },
};

export const meApi = {
  get(): Promise<MeResponse> {
    return apiRequest<MeResponse>('/api/me');
  },
};

export const accountApi = {
  status(): Promise<AccountStatusResponse> {
    return apiRequest<AccountStatusResponse>('/api/account/status');
  },
};

export const binollaApi = {
  connect(body: BinollaConnectRequest): Promise<BinollaConnectResponse> {
    return apiRequest<BinollaConnectResponse>('/api/binolla/connect', {
      method: 'POST',
      body: { ssid: body.ssid, accountType: body.accountType ?? 'Demo' },
    });
  },
  login(body: BinollaCredentialRequest): Promise<BinollaConnectResponse> {
    return apiRequest<BinollaConnectResponse>('/api/binolla/login', {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
        accountType: body.accountType ?? 'Demo',
      },
    });
  },
  signup(body: BinollaCredentialRequest): Promise<BinollaConnectResponse> {
    return apiRequest<BinollaConnectResponse>('/api/binolla/signup', {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
        accountType: body.accountType ?? 'Demo',
      },
    });
  },
  status(): Promise<BinollaStatusDto> {
    return apiRequest<BinollaStatusDto>('/api/binolla/status');
  },
  balance(signal?: AbortSignal): Promise<BinollaBalanceDto> {
    return apiRequest<BinollaBalanceDto>('/api/binolla/balance', { signal });
  },
  disconnect(): Promise<{ disconnected: boolean }> {
    return apiRequest<{ disconnected: boolean }>('/api/binolla/disconnect', { method: 'POST' });
  },
};

export const strategiesApi = {
  list(): Promise<StrategiesResponse> {
    return apiRequest<StrategiesResponse>('/api/strategies');
  },
  rsiSignal(asset: string, period = 60, signal?: AbortSignal): Promise<StrategySignalResponse> {
    const encoded = encodeURIComponent(asset);
    return apiRequest<StrategySignalResponse>(
      `/api/strategies/rsi/signal/${encoded}?period=${period}`,
      { signal },
    );
  },
};

export const marketApi = {
  assets(signal?: AbortSignal): Promise<MarketAssetsResponse> {
    return apiRequest<MarketAssetsResponse>('/api/market/assets', { signal });
  },
  price(asset: string, signal?: AbortSignal): Promise<MarketPriceResponse> {
    return apiRequest<MarketPriceResponse>(`/api/market/price/${encodeURIComponent(asset)}`, {
      signal,
    });
  },
  candles(asset: string, period = 60, signal?: AbortSignal): Promise<MarketCandlesResponse> {
    return apiRequest<MarketCandlesResponse>(
      `/api/market/candles/${encodeURIComponent(asset)}?period=${period}`,
      { signal },
    );
  },
};

export const tradesApi = {
  place(body: PlaceTradeRequest, idempotencyKey: string): Promise<TradeDto> {
    return apiRequest<TradeDto>('/api/trades', {
      method: 'POST',
      body,
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },
  list(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    asset?: string;
  } = {}): Promise<TradeListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.status) query.set('status', params.status);
    if (params.asset) query.set('asset', params.asset);
    const qs = query.toString();
    return apiRequest<TradeListResponse>(`/api/trades${qs ? `?${qs}` : ''}`);
  },
  get(id: string): Promise<TradeDto> {
    return apiRequest<TradeDto>(`/api/trades/${encodeURIComponent(id)}`);
  },
};

export const adminApi = {
  listAccounts(status?: string): Promise<AdminBinollaAccountListResponse> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<AdminBinollaAccountListResponse>(`/api/admin/binolla/accounts${qs}`);
  },
  getAccount(id: string): Promise<AdminBinollaAccountDto> {
    return apiRequest<AdminBinollaAccountDto>(`/api/admin/binolla/accounts/${encodeURIComponent(id)}`);
  },
  approve(id: string): Promise<AdminBinollaAccountDto> {
    return apiRequest<AdminBinollaAccountDto>(
      `/api/admin/binolla/accounts/${encodeURIComponent(id)}/approve`,
      { method: 'POST' },
    );
  },
  reject(id: string): Promise<AdminBinollaAccountDto> {
    return apiRequest<AdminBinollaAccountDto>(
      `/api/admin/binolla/accounts/${encodeURIComponent(id)}/reject`,
      { method: 'POST' },
    );
  },
};
