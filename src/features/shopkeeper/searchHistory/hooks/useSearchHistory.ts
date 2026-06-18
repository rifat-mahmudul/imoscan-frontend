import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getSearchHistory } from "../api/search-history.api";

export function useSearchHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["imei-search-history", page, limit],
    queryFn: () => getSearchHistory({ page, limit }),
    placeholderData: keepPreviousData,
  });
}
