export interface SearchHistoryMarketValue {
  amount: number;
  currency: string;
}

export interface SearchHistoryRiskMeter {
  riskLevel: string;
  score: number;
  label: string;
}

export interface SearchHistoryRecord {
  _id: string;
  imei: string;
  createdAt: string;
  updatedAt: string;
  deviceName: string;
  deviceStatus: string;
  marketValue?: SearchHistoryMarketValue;
  riskMeter?: SearchHistoryRiskMeter;
  userId: string;
}

export interface SearchHistoryMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface SearchHistoryResponse {
  success: boolean;
  message: string;
  data: SearchHistoryRecord[];
  meta: SearchHistoryMeta;
}

export interface SearchHistoryParams {
  page?: number;
  limit?: number;
}
