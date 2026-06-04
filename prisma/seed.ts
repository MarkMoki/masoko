import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@masoko.local" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@masoko.local",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const sellerA = await prisma.user.upsert({
    where: { email: "sellerA@masoko.local" },
    update: {},
    create: {
      name: "Seller A",
      email: "sellerA@masoko.local",
      phone: "+254700000001",
      passwordHash,
      role: Role.SELLER,
    },
  });

  const sellerB = await prisma.user.upsert({
    where: { email: "sellerB@masoko.local" },
    update: {},
    create: {
      name: "Seller B",
      email: "sellerB@masoko.local",
      phone: "+254700000002",
      passwordHash,
      role: Role.SELLER,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@masoko.local" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@masoko.local",
      passwordHash,
      role: Role.CUSTOMER,
      cart: { create: {} },
    },
  });

  const storeA = await prisma.store.upsert({
    where: { sellerId: sellerA.id },
    update: {},
    create: {
      sellerId: sellerA.id,
      name: "Nairobi Fresh Mart",
      description: "Fresh produce and groceries",
      latitude: -1.2864,
      longitude: 36.8172,
      address: "CBD, Nairobi",
    },
  });

  const storeB = await prisma.store.upsert({
    where: { sellerId: sellerB.id },
    update: {},
    create: {
      sellerId: sellerB.id,
      name: "Westlands Electronics",
      description: "Phones and accessories",
      latitude: -1.2674,
      longitude: 36.812,
      address: "Westlands, Nairobi",
    },
  });

  const existingMethods = await prisma.paymentMethod.count();
  if (existingMethods === 0) {
    await prisma.paymentMethod.createMany({
      data: [
        {
          sellerId: sellerA.id,
          type: "M-Pesa Till",
          accountNumber: "111111",
          accountName: "Seller A",
          instructions: "Lipa na M-Pesa, enter code on order page",
          isDefault: true,
        },
        {
          sellerId: sellerB.id,
          type: "M-Pesa Till",
          accountNumber: "222222",
          accountName: "Seller B",
          instructions: "Lipa na M-Pesa, enter code on order page",
          isDefault: true,
        },
      ],
    });
  }

  const categories = await Promise.all(
    ["Groceries", "Electronics", "Fashion"].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log("Products already seeded, skipping product create.");
  } else await prisma.product.createMany({
    data: [
      {
        sellerId: sellerA.id,
        storeId: storeA.id,
        categoryId: categories[0].id,
        name: "Tomatoes 1kg",
        price: 120,
        stock: 50,
        active: true,
      },
      {
        sellerId: sellerA.id,
        storeId: storeA.id,
        categoryId: categories[0].id,
        name: "Maize Flour 2kg",
        price: 180,
        stock: 30,
        active: true,
      },
      {
        sellerId: sellerB.id,
        storeId: storeB.id,
        categoryId: categories[1].id,
        name: "USB-C Cable",
        price: 850,
        stock: 20,
        active: true,
      },
      {
        sellerId: sellerB.id,
        storeId: storeB.id,
        categoryId: categories[1].id,
        name: "Wireless Earbuds",
        price: 2500,
        stock: 10,
        active: true,
      },
    ],
  });

  await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", marketplacePromoEnabled: true },
  });

  await prisma.sellerPricingConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      defaultModel: "SUBSCRIPTION",
      subscriptionMonthly: 2500,
      payAsYouGoFlatFee: 50,
      payAsYouGoPercent: 3,
      description: "Sellers pay a monthly subscription or a small fee per order.",
    },
  });

  const promoCount = await prisma.marketplacePromo.count();
  if (promoCount === 0) {
    await prisma.marketplacePromo.createMany({
      data: [
        {
          type: "BANNER",
          title: "Welcome to maSoKo",
          subtitle: "Shop from multiple local sellers in one cart",
          sortOrder: 0,
          active: true,
        },
        {
          type: "OFFER",
          title: "Fresh deals daily",
          subtitle: "New products from trusted sellers",
          sortOrder: 1,
          active: true,
        },
      ],
    });
  }

  console.log("Seed complete:");
  console.log("  Admin:    admin@masoko.local / password123");
  console.log("  Seller A: sellerA@masoko.local / password123");
  console.log("  Seller B: sellerB@masoko.local / password123");
  console.log("  Customer: customer@masoko.local / password123");
  console.log("  Admin ID:", admin.id);
  console.log("  Customer ID:", customer.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
