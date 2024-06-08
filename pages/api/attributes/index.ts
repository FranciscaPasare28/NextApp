import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const attributes = await prisma.attribute.findMany();
      res.status(200).json(attributes);
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
      res.status(500).json({ error: "Failed to fetch attributes", details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Attribute name is required' });
        return;
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
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
