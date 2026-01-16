import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type CartItemInput = z.infer<typeof api.cart.add.input>;

export function useCart(clientId: number) {
  return useQuery({
    queryKey: [api.cart.get.path, clientId],
    queryFn: async () => {
      const url = buildUrl(api.cart.get.path, { clientId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cart");
      return api.cart.get.responses[200].parse(await res.json());
    },
    enabled: !!clientId,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CartItemInput) => {
      const res = await fetch(api.cart.add.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      return api.cart.add.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path, variables.clientId] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clientId }: { id: number; clientId: number }) => {
      const url = buildUrl(api.cart.remove.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove from cart");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path, variables.clientId] });
    },
  });
}
