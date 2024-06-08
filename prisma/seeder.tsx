const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  await prisma.category.createMany({
    data: [
      { name: 'Electronics' },
      { name: 'Clothing' },
      { name: 'Books' }
    ],
    skipDuplicates: true
  });


  await prisma.attribute.createMany({
    data: [
      { name: 'Size' },
      { name: 'Color' },
      { name: 'Weight' }
    ],
    skipDuplicates: true
  });


  const product1 = await prisma.product.create({
    data: {
      name: 'Smartphone',
      price: 999.99,
      description: 'A high-end smartphone with great features',
      categoryId: 1,
      attributes: {
        create: [
          { attributeId: 2, value: 'Black' },
        ]
      }
    }
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Jeans',
      price: 49.99,
      description: 'Comfortable and stylish jeans',
      categoryId: 2,
      attributes: {
        create: [
          { attributeId: 1, value: '32' },
          { attributeId: 2, value: 'Blue' }
        ]
      }
    }
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Programming Book',
      price: 39.99,
      description: 'Learn programming with this detailed book',
      categoryId: 3,
      attributes: {
        create: [
          { attributeId: 3, value: '500g' }
        ]
      }
    }
  });

  console.log("Data has been seeded.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
