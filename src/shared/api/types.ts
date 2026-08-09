/** Typed backend DTOs — field names match ASP.NET camelCase JSON from API.md */

export type ApiErrorBody = {
  code: string;
  message: string;
};

export type AuthTelegramResponse = {
  accessToken: string;
  userId: string;
};

export type MeBinollaStatus = {
  connected: boolean;
  accountType: string;
  status: string;
  lastConnectedAt: string | null;
  balance: number | null;
};

export type MeResponse = {
  userId: string;
  telegramUserId: number;
  username: string | null;
  fullName: string | null;
  country: string | null;
  role: string;
  isAdmin: boolean;
  binolla: MeBinollaStatus | null;
};

export type AccountStatusResponse = {
  binollaConnected: boolean;
  accountType: string;
  adminApproved: boolean;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected' | string;
  botAccess:
    | 'Allowed'
    | 'BinollaNotConnected'
    | 'AdminApprovalRequired'
    | 'NotEligible'
    | 'SessionExpired'
    | string;
};

export type BinollaConnectRequest = {
  ssid: string;
  accountType?: string;
};

export type BinollaCredentialRequest = {
  email: string;
  password: string;
  accountType?: string;
};

export type BinollaConnectResponse = {
  connected: boolean;
  accountType: string;
  access: string;
  adminApproved: boolean;
  approvalStatus: string;
  lastConnectedAt: string | null;
  balance: number | null;
};

export type BinollaStatusDto = {
  connected: boolean;
  accountType: string;
  status: string;
  lastConnectedAt: string | null;
  balance: number | null;
};

export type BinollaBalanceDto = {
  connected: boolean;
  accountType: string;
  demoBalance: number;
  realBalance: number;
  currentBalance: number;
};

export type StrategyDto = {
  id: string;
  name: string;
  status: string;
  enabled: boolean;
};

export type StrategiesResponse = {
  strategies: StrategyDto[];
};

export type StrategySignalResponse = {
  strategyId: string;
  asset: string;
  signal: 'Call' | 'Put' | 'None' | string;
  rsi: number;
  candleTime: string;
  timeframe: string;
};

export type MarketAssetDto = {
  symbol: string;
  name: string;
  available: boolean;
  payout: number | null;
};

export type MarketAssetsResponse = {
  assets: MarketAssetDto[];
};

export type MarketPriceResponse = {
  asset: string;
  price: number;
  timestamp: string;
};

export type MarketCandleDto = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type MarketCandlesResponse = {
  asset: string;
  period: number;
  candles: MarketCandleDto[];
};

export type PlaceTradeRequest = {
  asset: string;
  direction: string;
  amount: number;
  durationSeconds: number;
  strategyId: string;
};

export type TradeDto = {
  id: string;
  binollaOrderId: string | null;
  asset: string;
  direction: string;
  amount: number;
  durationSeconds: number;
  status: string;
  pnl: number | null;
  errorCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TradeListResponse = {
  items: TradeDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminBinollaAccountDto = {
  id: string;
  userId: string;
  telegramUserId: number;
  username: string | null;
  fullName: string | null;
  binollaAccountIdentifier: string | null;
  connectionStatus: string;
  approvalStatus: string;
  adminApproved: boolean;
  lastConnectedAt: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
};

export type AdminBinollaAccountListResponse = {
  items: AdminBinollaAccountDto[];
  total: number;
};
