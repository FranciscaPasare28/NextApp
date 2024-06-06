
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Adaugă categorii de test
  const category1 = await prisma.category.create({
    data: { name: 'Electronics' },
  });
  const category2 = await prisma.category.create({
    data: { name: 'Clothing' },
  });

  // Adaugă atribute de test
  const sizeAttribute = await prisma.attribute.create({
    data: { name: 'Size' },
  });
  const colorAttribute = await prisma.attribute.create({
    data: { name: 'Color' },
  });
  const saleAttribute = await prisma.attribute.create({
    data: { name: 'Sale' },
  });

  // Adaugă produse de test
  const product = await prisma.product.create({
    data: {
      name: 'T-Shirt',
      price: 19.99,
      description: 'A comfortable cotton t-shirt',
      categoryId: category2.id,
    },
  });

  // Adaugă atribute pentru produs
  await prisma.productAttribute.createMany({
    data: [
      { productId: product.id, attributeId: sizeAttribute.id, value: 'L' },
      { productId: product.id, attributeId: colorAttribute.id, value: 'blue' },
      { productId: product.id, attributeId: saleAttribute.id, value: 'yes' },
    ],
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
