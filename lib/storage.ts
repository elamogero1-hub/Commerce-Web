import { db } from "./db";
import { 
  products, categories, subcategories, clients, cartItems, orders, orderItems, deliveryTracking,
  type Product, type Category, type Subcategory, type Client, type CartItem, type Order, 
  type OrderItem, type OrderState, type PaymentMethod, type OrderItem as OrderDetail,
  orderStates, paymentMethods, suppliers
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export interface IStorage {
  // Products
  getProducts(subcategoryId?: number, search?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: any): Promise<Product>;
  
  // Categories
  getCategories(): Promise<(Category & { subcategories: Subcategory[] })[]>;
  
  // Cart
  getCart(clientId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: any): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  
  // Orders
  createOrder(orderData: any): Promise<Order>;
  getOrders(clientId: number): Promise<(Order & { status: OrderState })[]>;
  getOrderDetails(orderId: number): Promise<Order & { items: (OrderItem & { product: Product })[], tracking: any[] } | undefined>;
  
  // Clients
  getClientByEmail(email: string): Promise<Client | undefined>;
  createClient(client: any): Promise<Client>;
  
  // Tracking
  getTracking(orderId: number): Promise<any[]>;
  addTracking(tracking: any): Promise<any>;

  // Metadata
  getOrderStates(): Promise<OrderState[]>;
  getPaymentMethods(): Promise<PaymentMethod[]>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(subcategoryId?: number, search?: string): Promise<Product[]> {
    let query = db.select().from(products);
    if (subcategoryId) {
      query = query.where(eq(products.subcategoryId, subcategoryId));
    }
    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: any): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getCategories(): Promise<(Category & { subcategories: Subcategory[] })[]> {
    const cats = await db.select().from(categories);
    const result = [];
    for (const cat of cats) {
      const subs = await db.select().from(subcategories).where(eq(subcategories.categoryId, cat.id));
      result.push({ ...cat, subcategories: subs });
    }
    return result;
  }

  async getCart(clientId: number): Promise<(CartItem & { product: Product })[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.clientId, clientId));
    const result = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      result.push({ ...item, product });
    }
    return result;
  }

  async addToCart(item: any): Promise<CartItem> {
    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async createOrder(orderData: any): Promise<Order> {
    return await db.transaction(async (tx: any) => {
      const [newOrder] = await tx.insert(orders).values({
        clientId: orderData.clientId,
        paymentMethodId: orderData.paymentMethodId,
        statusId: 1,
        total: orderData.items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0),
      }).returning();

      for (const item of orderData.items) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          historicalPrice: item.price,
        });
      }
      
      await tx.insert(deliveryTracking).values({
        orderId: newOrder.id,
        statusId: 1,
        comment: "Pedido creado",
      });

      return newOrder;
    });
  }

  async getOrders(clientId: number): Promise<(Order & { status: OrderState })[]> {
    const userOrders = await db.select().from(orders).where(eq(orders.clientId, clientId)).orderBy(desc(orders.orderDate));
    const result = [];
    for (const order of userOrders) {
      const [status] = await db.select().from(orderStates).where(eq(orderStates.id, order.statusId));
      result.push({ ...order, status });
    }
    return result;
  }

  async getOrderDetails(orderId: number): Promise<Order & { items: (OrderItem & { product: Product })[], tracking: any[] } | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return undefined;
    
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const itemsWithProduct = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      itemsWithProduct.push({ ...item, product });
    }
    
    const tracking = await db.select().from(deliveryTracking).where(eq(deliveryTracking.orderId, orderId));
    
    return { ...order, items: itemsWithProduct, tracking };
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client;
  }

  async createClient(client: any): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async getTracking(orderId: number): Promise<any[]> {
    const tracks = await db.select().from(deliveryTracking).where(eq(deliveryTracking.orderId, orderId));
    const result = [];
    for (const track of tracks) {
       const [status] = await db.select().from(orderStates).where(eq(orderStates.id, track.statusId));
       result.push({ ...track, status });
    }
    return result;
  }

  async addTracking(tracking: any): Promise<any> {
    const [newTrack] = await db.insert(deliveryTracking).values(tracking).returning();
    await db.update(orders).set({ statusId: tracking.statusId }).where(eq(orders.id, tracking.orderId));
    return newTrack;
  }

  async getOrderStates(): Promise<OrderState[]> {
    return await db.select().from(orderStates);
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods);
  }
}

export const storage = new DatabaseStorage();
