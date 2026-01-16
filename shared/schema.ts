import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// 5.1 Tabla: Clientes
export const clients = pgTable("clients", {
  id: serial("client_id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5.2 Tabla: Proveedores
export const suppliers = pgTable("suppliers", {
  id: serial("supplier_id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  country: text("country").default("Perú"),
});

// 5.3 Tabla: Categorías
export const categories = pgTable("categories", {
  id: serial("category_id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

// 5.4 Tabla: Subcategorías
export const subcategories = pgTable("subcategories", {
  id: serial("subcategory_id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  name: text("name").notNull(),
});

// 5.5 Tabla: Productos
export const products = pgTable("products", {
  id: serial("product_id").primaryKey(),
  subcategoryId: integer("subcategory_id").notNull().references(() => subcategories.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0),
  description: text("description"),
  imageUrl: text("image_url"),
});

// 5.6 Tabla: CarritoCompras
export const cartItems = pgTable("cart_items", {
  id: serial("cart_id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// 5.9 Tabla: MediosPago
export const paymentMethods = pgTable("payment_methods", {
  id: serial("payment_method_id").primaryKey(),
  name: text("name").notNull(),
});

// 4.3 Tabla: EstadosPedido
export const orderStates = pgTable("order_states", {
  id: serial("state_id").primaryKey(),
  name: text("name").notNull(),
});

// 5.7 Tabla: Pedidos
export const orders = pgTable("orders", {
  id: serial("order_id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  paymentMethodId: integer("payment_method_id").notNull().references(() => paymentMethods.id),
  statusId: integer("status_id").notNull().references(() => orderStates.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  orderDate: timestamp("order_date").defaultNow(),
});

// 5.8 Tabla: DetallePedidos
export const orderItems = pgTable("order_items", {
  id: serial("detail_id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  historicalPrice: decimal("historical_price", { precision: 10, scale: 2 }).notNull(),
});

// TrackingDelivery
export const deliveryTracking = pgTable("delivery_tracking", {
  id: serial("tracking_id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  statusId: integer("status_id").notNull().references(() => orderStates.id),
  timestamp: timestamp("timestamp").defaultNow(),
  comment: text("comment"),
});

// Relations
export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, {
    fields: [orders.clientId],
    references: [clients.id],
  }),
  state: one(orderStates, {
    fields: [orders.statusId],
    references: [orderStates.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [orders.paymentMethodId],
    references: [paymentMethods.id],
  }),
  items: many(orderItems),
  tracking: many(deliveryTracking),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Schemas
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertSubcategorySchema = createInsertSchema(subcategories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, addedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderDate: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertTrackingSchema = createInsertSchema(deliveryTracking).omit({ id: true, timestamp: true });

// Types
export type Client = typeof clients.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type OrderState = typeof orderStates.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
