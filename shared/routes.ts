import { z } from 'zod';
import { 
  insertClientSchema, 
  insertProductSchema, 
  insertCartItemSchema, 
  insertOrderSchema,
  insertTrackingSchema,
  clients,
  products,
  categories,
  orders,
  cartItems,
  deliveryTracking,
  subcategories,
  suppliers,
  orderStates,
  paymentMethods,
  orderItems
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      input: z.object({
        subcategoryId: z.coerce.number().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect & { subcategories: typeof subcategories.$inferSelect[] }>()),
      },
    },
  },
  cart: {
    get: {
      method: 'GET' as const,
      path: '/api/cart/:clientId',
      responses: {
        200: z.array(z.custom<typeof cartItems.$inferSelect & { product: typeof products.$inferSelect }>()),
      },
    },
    add: {
      method: 'POST' as const,
      path: '/api/cart',
      input: insertCartItemSchema,
      responses: {
        201: z.custom<typeof cartItems.$inferSelect>(),
      },
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/cart/item/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: z.object({
        clientId: z.number(),
        paymentMethodId: z.number(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.number(), // Historical price
        })),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders/:clientId',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect & { status: typeof orderStates.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id/details',
      responses: {
        200: z.custom<typeof orders.$inferSelect & { items: (typeof orderItems.$inferSelect & { product: typeof products.$inferSelect })[], tracking: typeof deliveryTracking.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  clients: {
    create: {
      method: 'POST' as const,
      path: '/api/clients',
      input: insertClientSchema,
      responses: {
        201: z.custom<typeof clients.$inferSelect>(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/clients/:email',
      responses: {
        200: z.custom<typeof clients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  tracking: {
    get: {
      method: 'GET' as const,
      path: '/api/tracking/:orderId',
      responses: {
        200: z.array(z.custom<typeof deliveryTracking.$inferSelect & { status: typeof orderStates.$inferSelect }>()),
      },
    },
    add: {
      method: 'POST' as const,
      path: '/api/tracking',
      input: insertTrackingSchema,
      responses: {
        201: z.custom<typeof deliveryTracking.$inferSelect>(),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
