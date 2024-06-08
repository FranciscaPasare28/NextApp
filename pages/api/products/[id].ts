import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method === 'POST') {
    try {
      const { name } = req.body;
      if (typeof name !== 'string') {
        return res.status(400).json({ error: "Invalid input for attribute name." });
      }
      const newAttribute = await prisma.attribute.create({
        data: { name }
      });
      res.status(200).json(newAttribute);
    } catch (error) {
      console.error('Failed to create attribute:', error);
      res.status(500).json({ error: 'Failed to create attribute', details: error.message });
    }
  }
  else if (req.method === 'PUT') {
    const { name, price, description, categoryId, attributes: newAttributes } = req.body;
    console.log(name);
    console.log(newAttributes);
    try {
      const updatedProduct = await prisma.$transaction(async (prisma) => {
        const product = await prisma.product.update({
          where: { id: parseInt(id) },
          data: {
            name,
            price,
            description,
            categoryId
          },
          include: {
            attributes: true
          }
        });

        const currentAttributeIds = product.attributes.map(attr => attr.attributeId);
        const attributesToAdd = newAttributes.filter(attr => !currentAttributeIds.includes(attr.attributeId));
        const attributesToUpdate = newAttributes.filter(attr => currentAttributeIds.includes(attr.attributeId));
        const attributesToRemove = currentAttributeIds.filter(attributeId => !newAttributes.map(attr => attr.attributeId).includes(attributeId));

        await Promise.all(attributesToAdd.map(attr => {
          return prisma.productAttribute.create({
            data: {
              productId: parseInt(id),
              attributeId: attr.attributeId,
              value: attr.value
            }
          });
        }));

        await Promise.all(attributesToUpdate.map(attr => {
          return prisma.productAttribute.update({
            where: {
              productId_attributeId: {
                productId: parseInt(id),
                attributeId: attr.attributeId
              }
            },
            data: {value: attr.value}
          });
        }));

        await Promise.all(attributesToRemove.map(attributeId => {
          return prisma.productAttribute.deleteMany({
            where: {
              productId: parseInt(id),
              attributeId: attributeId
            }
          });
        }));

        return product;
      });

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).json({ error: "Failed to update product", details: error.message });
    }
  }
 else if (req.method === 'DELETE') {
    try {
      await prisma.productAttribute.deleteMany({
        where: { productId: Number(id) },
      });
      await prisma.product.delete({
        where: { id: Number(id) },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Failed to delete product:', error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
