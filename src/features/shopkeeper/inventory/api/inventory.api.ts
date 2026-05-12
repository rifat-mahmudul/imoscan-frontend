import { api } from "@/lib/api";
import type {
  CreateInventoryInput,
  UpdateInventoryInput,
  InventoryListResponse,
  CreateFromBarcodeBulkInput,
} from "../types";

const BASE = "/inventory";

export const getMyInventory = async (): Promise<InventoryListResponse> => {
  const response = await api.get(`${BASE}/my-inventory`);
  return response.data;
};

export const createInventory = async (input: CreateInventoryInput) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;

    if (key === "image" && value instanceof File) {
      formData.append(key, value);
      continue;
    }

    if (key !== "image") {
      formData.append(key, String(value));
    }
  }

  const response = await api.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateInventory = async ({
  id,
  input,
}: {
  id: string;
  input: UpdateInventoryInput;
}) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;

    if (key === "image" && value instanceof File) {
      formData.append(key, value);
      continue;
    }

    if (key !== "image") {
      formData.append(key, String(value));
    }
  }

  const response = await api.put(`${BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteInventory = async (id: string) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};
export const createFromBarcode = async (input: {
  code: string;
  userId: string;
  imeiNumber?: string;
  purchasePrice?: number;
  currentState?: string;
  image?: File;
}) => {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await api.post(`${BASE}/create-from-barcode`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const createFromBarcodeBulk = async (
  input: CreateFromBarcodeBulkInput,
) => {
  const response = await api.post(`${BASE}/create-from-barcode/bulk`, input);
  return response.data;
};
