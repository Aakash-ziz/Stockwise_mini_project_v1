import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Inspecting stockwise_db current state ---');
  const [
    users,
    categories,
    suppliers,
    products,
    inventory,
    sales,
    saleItems,
    aiRecommendations,
    auditLogs
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.category.findMany(),
    prisma.supplier.findMany(),
    prisma.product.findMany({ include: { inventory: true, category: true, supplier: true } }),
    prisma.inventory.findMany(),
    prisma.sale.findMany({ include: { saleItems: true } }),
    prisma.saleItem.findMany(),
    prisma.aIRecommendation.findMany(),
    prisma.auditLog.findMany()
  ]);

  console.log(`Users count: ${users.length}`);
  for (const u of users) {
    console.log(`User ID: ${u.id} | username: ${u.username} | role: ${u.role}`);
  }
  console.log(`Categories count: ${categories.length}`);
  console.log(`Suppliers count: ${suppliers.length}`);
  console.log(`Products count: ${products.length}`);
  console.log(`Inventory count: ${inventory.length}`);
  console.log(`Sales count: ${sales.length}`);
  console.log(`Sale Items count: ${saleItems.length}`);
  console.log(`AI Recommendations count: ${aiRecommendations.length}`);
  console.log(`Audit Logs count: ${auditLogs.length}`);

  console.log('\n--- Existing Products Detail ---');
  for (const p of products) {
    console.log(`ID: ${p.id} | SKU: ${p.sku} | Name: ${p.name} | Cat: ${p.category?.name} | Sell: ${p.sellingPrice} | Cost: ${p.purchasePrice} | Stock: ${p.inventory?.quantity}`);
  }

  console.log('\n--- Existing Categories ---');
  for (const c of categories) {
    console.log(`ID: ${c.id} | Name: ${c.name}`);
  }

  console.log('\n--- Existing Suppliers ---');
  for (const s of suppliers) {
    console.log(`ID: ${s.id} | Name: ${s.name}`);
  }

  console.log('\n--- Existing Sales ---');
  for (const s of sales) {
    console.log(`ID: ${s.id} | Date: ${s.date} | Customer: ${s.customerName} | Total: ${s.totalPrice} | Items: ${s.saleItems.length}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
