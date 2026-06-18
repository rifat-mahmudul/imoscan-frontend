import { api } from "@/lib/api";
import {
  SearchHistoryParams,
  SearchHistoryResponse,
} from "../types/search-history.types";

export const getSearchHistory = async (
  params?: SearchHistoryParams,
): Promise<SearchHistoryResponse> => {
  const response = await api.get("/imei/history", { params });
  return response.data;
};
