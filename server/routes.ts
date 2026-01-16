import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { 
  orderStates, paymentMethods, suppliers, categories, subcategories, products, clients 
} from "@shared/schema";
import { db } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const subcategoryId = req.query.subcategoryId ? Number(req.query.subcategoryId) : undefined;
    const search = req.query.search as string;
    const products = await storage.getProducts(subcategoryId, search);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  // Categories
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Cart
  app.get(api.cart.get.path, async (req, res) => {
    const cart = await storage.getCart(Number(req.params.clientId));
    res.json(cart);
  });

  app.post(api.cart.add.path, async (req, res) => {
    const item = await storage.addToCart(req.body);
    res.status(201).json(item);
  });

  app.delete(api.cart.remove.path, async (req, res) => {
    await storage.removeFromCart(Number(req.params.id));
    res.status(204).send();
  });

  // Orders
  app.post(api.orders.create.path, async (req, res) => {
    const order = await storage.createOrder(req.body);
    res.status(201).json(order);
  });

  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders(Number(req.params.clientId));
    res.json(orders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    const order = await storage.getOrderDetails(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  // Clients
  app.post(api.clients.create.path, async (req, res) => {
    const client = await storage.createClient(req.body);
    res.status(201).json(client);
  });

  app.get(api.clients.get.path, async (req, res) => {
    const client = await storage.getClientByEmail(req.params.email);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  });

  // Tracking
  app.get(api.tracking.get.path, async (req, res) => {
    const tracks = await storage.getTracking(Number(req.params.orderId));
    res.json(tracks);
  });

  app.post(api.tracking.add.path, async (req, res) => {
    const track = await storage.addTracking(req.body);
    res.status(201).json(track);
  });

  // Seeding endpoint (for dev)
  app.post('/api/seed', async (req, res) => {
    await seedDatabase();
    res.json({ message: "Seeded" });
  });

  return httpServer;
}

async function seedDatabase() {
  // Check if seeded
  const existingCats = await storage.getCategories();
  if (existingCats.length > 0) return;

  // Static Data
  await db.insert(orderStates).values([
    { name: "Pendiente" },
    { name: "Pagado" },
    { name: "Enviado" },
    { name: "Entregado" },
    { name: "Cancelado" },
  ]);

  await db.insert(paymentMethods).values([
    { name: "Tarjeta de Crédito/Débito" },
    { name: "Yape" },
    { name: "Plin" },
    { name: "Transferencia Bancaria" },
  ]);

  const [supp] = await db.insert(suppliers).values({
    companyName: "Tech Distributors S.A.C.",
    contactName: "Carlos Mendoza",
    email: "cmendoza@techdist.com",
    country: "Perú"
  }).returning();

  const [catElec] = await db.insert(categories).values({ name: "Electrónica", description: "Gadgets y dispositivos" }).returning();
  const [catRopa] = await db.insert(categories).values({ name: "Ropa", description: "Moda para todos" }).returning();

  const [subSmart] = await db.insert(subcategories).values({ categoryId: catElec.id, name: "Smartphones" }).returning();
  const [subLap] = await db.insert(subcategories).values({ categoryId: catElec.id, name: "Laptops" }).returning();
  const [subCam] = await db.insert(subcategories).values({ categoryId: catRopa.id, name: "Camisas" }).returning();

  await db.insert(products).values([
    { subcategoryId: subSmart.id, supplierId: supp.id, name: "Samsung Galaxy S24 Ultra", price: "4299.00", stock: 15, description: "El mejor smartphone de Samsung." },
    { subcategoryId: subLap.id, supplierId: supp.id, name: "MacBook Pro M3", price: "7500.00", stock: 10, description: "Potencia para profesionales." },
    { subcategoryId: subCam.id, supplierId: supp.id, name: "Camisa Oxford", price: "89.90", stock: 50, description: "Elegancia casual." },
  ]);
  
  // Create a default client for testing
  await db.insert(clients).values({
    fullName: "Cliente Demo",
    email: "demo@smartcommerce.com",
    address: "Av. Principal 123",
    city: "Lima"
  });
}
