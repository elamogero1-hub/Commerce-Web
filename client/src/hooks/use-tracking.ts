import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type CreateTrackingInput = z.infer<typeof api.tracking.add.input>;

export function useTracking(orderId: number) {
  return useQuery({
    queryKey: [api.tracking.get.path, orderId],
    queryFn: async () => {
      const url = buildUrl(api.tracking.get.path, { orderId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tracking info");
      return api.tracking.get.responses[200].parse(await res.json());
    },
    enabled: !!orderId,
  });
}

export function useAddTracking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTrackingInput) => {
      const res = await fetch(api.tracking.add.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add tracking update");
      return api.tracking.add.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.tracking.get.path, variables.orderId] });
      queryClient.invalidateQueries({ queryKey: [api.orders.get.path, variables.orderId] });
    },
  });
}
