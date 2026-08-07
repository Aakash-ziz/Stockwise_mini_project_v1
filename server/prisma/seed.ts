import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log('🌱 Seeding database...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.auditLog.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const adminUser = await prisma.user.create({
    data: {
      id: 'usr-admin1',
      username: 'admin',
      role: 'Admin',
    },
  });
  const salesUser = await prisma.user.create({
    data: {
      id: 'usr-sales1',
      username: 'sales',
      role: 'Sales',
    },
  });
  await prisma.user.create({
    data: {
      id: 'usr-manager1',
      username: 'manager',
      role: 'Manager',
    },
  });

  // 3. Create Categories
  const catElectronics = await prisma.category.create({
    data: { id: 'cat-electronics', name: 'Electronics', description: 'Consumer electronic devices' },
  });
  const catPeripherals = await prisma.category.create({
    data: { id: 'cat-peripherals', name: 'Peripherals', description: 'Computer peripherals and inputs' },
  });

  // 4. Create Suppliers
  const supApple = await prisma.supplier.create({
    data: { id: 'sup-apple', name: 'Apple Global', contactInfo: 'apple-sales@apple.com' },
  });
  const supSony = await prisma.supplier.create({
    data: { id: 'sup-sony', name: 'Sony Logistics', contactInfo: 'sony-sales@sony.com' },
  });
  const supKeychron = await prisma.supplier.create({
    data: { id: 'sup-keychron', name: 'Keychron Hub', contactInfo: 'support@keychron.com' },
  });
  const supLogitech = await prisma.supplier.create({
    data: { id: 'sup-logitech', name: 'Logi Distribution', contactInfo: 'logitech-b2b@logi.com' },
  });
  const supDell = await prisma.supplier.create({
    data: { id: 'sup-dell', name: 'Dell Direct', contactInfo: 'dell-orders@dell.com' },
  });

  // 5. Create Products & Inventory
  const productsData = [
    {
      id: 'prod-1',
      name: 'MacBook Pro M2',
      sku: 'SKU-29384',
      categoryId: catElectronics.id,
      supplierId: supApple.id,
      purchasePrice: 1850.00,
      sellingPrice: 2499.00,
      quantity: 42,
      minStock: 10,
      status: 'IN STOCK',
      thumbnailColor: '#F3F4F6',
      thumbnailIcon: 'laptop',
    },
    {
      id: 'prod-2',
      name: 'Sony WH-1000XM5',
      sku: 'SKU-11029',
      categoryId: catElectronics.id,
      supplierId: supSony.id,
      purchasePrice: 240.00,
      sellingPrice: 349.00,
      quantity: 5,
      minStock: 10,
      status: 'LOW STOCK',
      thumbnailColor: '#E5E7EB',
      thumbnailIcon: 'headphones',
    },
    {
      id: 'prod-3',
      name: 'Keychron K2 V2',
      sku: 'SKU-88273',
      categoryId: catPeripherals.id,
      supplierId: supKeychron.id,
      purchasePrice: 65.00,
      sellingPrice: 99.00,
      quantity: 0,
      minStock: 5,
      status: 'OUT OF STOCK',
      thumbnailColor: '#F9FAFB',
      thumbnailIcon: 'keyboard',
    },
    {
      id: 'prod-4',
      name: 'Logitech MX Master 3S',
      sku: 'SKU-44021',
      categoryId: catPeripherals.id,
      supplierId: supLogitech.id,
      purchasePrice: 72.00,
      sellingPrice: 129.00,
      quantity: 156,
      minStock: 20,
      status: 'IN STOCK',
      thumbnailColor: '#E5E7EB',
      thumbnailIcon: 'mouse',
    },
    {
      id: 'prod-5',
      name: 'Dell UltraSharp 32"',
      sku: 'SKU-55120',
      categoryId: catElectronics.id,
      supplierId: supDell.id,
      purchasePrice: 890.00,
      sellingPrice: 1249.00,
      quantity: 12,
      minStock: 5,
      status: 'IN STOCK',
      thumbnailColor: '#F3F4F6',
      thumbnailIcon: 'monitor',
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        sku: p.sku,
        categoryId: p.categoryId,
        supplierId: p.supplierId,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        thumbnailColor: p.thumbnailColor,
        thumbnailIcon: p.thumbnailIcon,
        status: p.quantity > p.minStock ? 'ACTIVE' : 'INACTIVE',
      },
    });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: p.quantity,
        minStock: p.minStock,
        status: p.status,
      },
    });
  }

  // 6. Create Sales & SaleItems
  const sale1 = await prisma.sale.create({
    data: {
      id: 'TXN-90231',
      customerName: 'Alexander Thorne',
      discount: 0.00,
      totalPrice: 198.00,
      status: 'DELIVERED',
      date: new Date('2026-07-01'),
      createdBy: salesUser.id,
    },
  });

  await prisma.saleItem.create({
    data: {
      saleId: sale1.id,
      productId: 'prod-3',
      quantity: 2,
      unitPrice: 99.00,
    },
  });

  const sale2 = await prisma.sale.create({
    data: {
      id: 'TXN-90232',
      customerName: 'Sarah Jenkins',
      discount: 30.00,
      totalPrice: 99.00,
      status: 'PROCESSING',
      date: new Date('2026-07-01'),
      createdBy: salesUser.id,
    },
  });

  await prisma.saleItem.create({
    data: {
      saleId: sale2.id,
      productId: 'prod-4',
      quantity: 1,
      unitPrice: 129.00,
    },
  });

  // 7. Create AI Recommendations
  await prisma.aIRecommendation.create({
    data: {
      productId: 'prod-2',
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      description: 'Sony WH-1000XM5 is at 5 units (threshold 10). Reorder recommended.',
      suggestedQty: 15,
      status: 'PENDING',
    },
  });

  // 8. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      actionType: 'PRICE_CHANGE',
      entityName: 'products',
      entityId: 'prod-1',
      previousValue: '{"sellingPrice": 2399.00}',
      newValue: '{"sellingPrice": 2499.00}',
      reason: 'Adjusted price for market inflation.',
    },
  });

  // eslint-disable-next-line no-console
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
