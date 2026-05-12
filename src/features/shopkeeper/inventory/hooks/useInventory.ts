import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  createFromBarcode,
  createFromBarcodeBulk,
} from "../api/inventory.api";
import type {
  CreateInventoryInput,
  UpdateInventoryInput,
  CreateFromBarcodeBulkInput,
} from "../types";

export const INVENTORY_KEYS = {
  all: ["inventory"] as const,
  myInventory: () => [...INVENTORY_KEYS.all, "my-inventory"] as const,
};

export function useMyInventory() {
  return useQuery({
    queryKey: INVENTORY_KEYS.myInventory(),
    queryFn: getMyInventory,
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInventoryInput) => createInventory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInventoryInput }) =>
      updateInventory({ id, input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useCreateFromBarcode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      code: string;
      userId: string;
      imeiNumber?: string;
      purchasePrice?: number;
      currentState?: string;
      image?: File;
    }) => createFromBarcode(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}
export const useCreateFromBarcodeBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFromBarcodeBulkInput) =>
      createFromBarcodeBulk(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
};
