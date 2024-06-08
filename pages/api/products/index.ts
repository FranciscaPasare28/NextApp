import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      try {
        const { search, sort, order, priceFrom, priceTo, categoryId, attributeNames } = req.query;
        let sortOptions;
        if (sort && order) {
          sortOptions = { [sort as string]: order as string };
        }

        let searchOptions: any = {};
        if (search) {

          const searchTerm = search.toString().toLowerCase();
          searchOptions.name = {
            contains: searchTerm,
          };
        }

        if (priceFrom || priceTo) {
          searchOptions.price = {};
          if (priceFrom) {
            searchOptions.price.gte = parseFloat(priceFrom as string);
          }
          if (priceTo) {
            searchOptions.price.lte = parseFloat(priceTo as string);
          }
        }

        if (categoryId) {

          searchOptions.categoryId = parseInt(categoryId as string);
        }

        if (attributeNames) {
          const attributeNamesArray = attributeNames.split(',');

          const attributeConditions = attributeNamesArray.map(name => ({
            attributes: {
              some: {
                attribute: {
                  name: name
                }
              }
            }
          }));

          searchOptions = {
            ...searchOptions,
            AND: attributeConditions,
          };
        }

        const products = await prisma.product.findMany({
          where: searchOptions,
          orderBy: sortOptions,
          include: {
            category: true,
            attributes: {
              include: {
                attribute: true,
              },
            },
          },
        });

        const formattedProducts = products.map(product => ({
          ...product,
          attributesString: product.attributes
            .map(attr => `${attr.attribute.name}: ${attr.value}`)
            .join('; '),
        }));

        res.status(200).json(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: "Failed to fetch products" });
      }
      break;

    case 'POST':
      try {
        const { name, price, description, categoryId, attributes } = req.body;
        const newProduct = await prisma.product.create({
          data: {
            name,
            price,
            description,
            categoryId,
            attributes: {
              create: attributes.map(attr => ({
                attributeId: attr.attributeId,
                value: attr.value,
              })),
            },
          },
          include: {
            category: true,
            attributes: {
              include: {
                attribute: true,
              },
            },
          },
        });
        res.status(201).json(newProduct);
      } catch (error) {
        console.error('Failed to create product:', error);
        res.status(500).json({ error: "Failed to create product" });
      }
      break;
    case 'PUT':
      try {
        const { id, name, price, description, categoryId, attributes } = req.body;

        const newAttributes = attributes.filter(attr => !attr.id);
        const existingAttributes = attributes.filter(attr => attr.id);

        const productUpdatePromise = prisma.product.update({
          where: { id: parseInt(id) },
          data: {
            name,
            price,
            description,
            categoryId
          }
        });


        const newAttributesPromise = newAttributes.length > 0 ? prisma.productAttribute.createMany({
          data: newAttributes.map(attr => ({
            productId: parseInt(id),
            attributeId: attr.attributeId,
            value: attr.value
          }))
        }) : Promise.resolve();


        const existingAttributesPromises = existingAttributes.map(attr => {
          return prisma.productAttribute.update({
            where: { id: attr.id },
            data: { value: attr.value }
          });
        });

        await prisma.$transaction([productUpdatePromise, newAttributesPromise, ...existingAttributesPromises]);

        const updatedProduct = await prisma.product.findUnique({
          where: { id: parseInt(id) },
          include: {
            category: true,
            attributes: {
              include: {
                attribute: true
              }
            }
          }
        });

        res.status(200).json(updatedProduct);
      } catch (error) {
        console.error('Failed to update product:', error);
        res.status(500).json({ error: "Failed to update product", details: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
