import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, price, description, categoryId, attributes } = req.body;
    try {
      const updatedProduct = await prisma.$transaction(async (prisma) => {
        const productUpdate = await prisma.product.update({
          where: { id: Number(id) },
          data: {
            name,
            price,
            description,
            categoryId
          },
          include: { category: true, attributes: true }
        });

        await prisma.productAttribute.deleteMany({
          where: { productId: Number(id) }
        });

        const attrCreates = attributes.map(attr => ({
          productId: Number(id),
          attributeId: attr.attributeId,
          value: attr.value
        }));
        await prisma.productAttribute.createMany({ data: attrCreates });

        return productUpdate;
      });

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).json({ error: "Failed to update product", details: error.message });
    }
  }else if (req.method === 'DELETE') {
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
