import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type CreateClientInput = z.infer<typeof api.clients.create.input>;

export function useClientByEmail(email: string) {
  return useQuery({
    queryKey: [api.clients.get.path, email],
    queryFn: async () => {
      const url = buildUrl(api.clients.get.path, { email });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch client");
      return api.clients.get.responses[200].parse(await res.json());
    },
    enabled: !!email,
  });
}

export function useCreateClient() {
  return useMutation({
    mutationFn: async (data: CreateClientInput) => {
      const res = await fetch(api.clients.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create client");
      return api.clients.create.responses[201].parse(await res.json());
    },
  });
}
