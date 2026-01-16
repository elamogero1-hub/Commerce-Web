import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type Product = z.infer<typeof api.products.list.responses[200]>[number];
type CreateProductInput = z.infer<typeof api.products.create.input>;

export function useProducts(subcategoryId?: number, search?: string) {
  return useQuery({
    queryKey: [api.products.list.path, subcategoryId, search],
    queryFn: async () => {
      const queryParams: Record<string, string | number> = {};
      if (subcategoryId) queryParams.subcategoryId = subcategoryId;
      if (search) queryParams.search = search;
      
      const url = `${api.products.list.path}?${new URLSearchParams(queryParams as any).toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return api.products.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const res = await fetch(api.products.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return api.products.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    },
  });
}
