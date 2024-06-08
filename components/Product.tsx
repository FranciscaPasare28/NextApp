import React, { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
}

interface Attribute {
  id?: number;
  name: string;
  value: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: {
    id: number;
    name: string;
  };
  attributes: Attribute[];
}

const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [showAttributes, setShowAttributes] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name);
      setProductPrice(editingProduct.price.toString());
      setProductDescription(editingProduct.description);
      setProductCategory(editingProduct.category.id.toString());
      setAttributes([...editingProduct.attributes]);
    }
  }, [editingProduct]);

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = attributes.map((attr, idx) => {
      if (idx === index) {
        if (field === 'id') {
          const attributeDetails = availableAttributes.find(attr => attr.id.toString() === value);
          return { ...attr, id: parseInt(value), name: attributeDetails?.name };
        }
        return { ...attr, [field]: value };
      }
      return attr;
    });
    setAttributes(updatedAttributes);
  };

  const addAttributeField = () => {
    setAttributes([...attributes, { id: undefined, name: '', value: '' }]);
  };

  const removeAttributeField = (index: number) => {
    setAttributes(attributes.filter((_, idx) => idx !== index));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    const updatedAttributes = await Promise.all(attributes.map(async attribute => {
      if (!attribute.id) {
        const response = await fetch('/api/attributes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: attribute.name })
        });
        const newAttribute = await response.json();
        return { ...attribute, id: newAttribute.id };
      }
      return attribute;
    }));

    const productData = {
      name: productName,
      price: parseFloat(productPrice),
      categoryId: parseInt(productCategory),
      description: productDescription,
      attributes: updatedAttributes.map(attr => ({
        attributeId: attr.id,
        value: attr.value
      }))
    };

    const endpoint = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      const updatedProduct = await response.json();
      setProducts(prevProducts => {
        const newProducts = editingProduct
          ? prevProducts.map(product =>
            product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product
          )
          : [...prevProducts, updatedProduct];

        return newProducts;
      });
      setShowModal(false);
      setEditingProduct(null);
    } else {
      const errorResponse = await response.json();
      console.error('Failed to update or add product:', errorResponse);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const attributeNames = selectedAttributes.join(',');
        const response = await fetch(`/api/products?search=${search}&sort=${sort}&order=${order}&priceFrom=${priceFrom}&priceTo=${priceTo}&categoryId=${selectedCategory}&attributeNames=${attributeNames}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    }

    fetchProducts();
  }, [search, sort, order, priceFrom, priceTo, selectedCategory, selectedAttributes]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await fetch('/api/attributes');
        if (response.ok) {
          const data = await response.json();
          setAvailableAttributes(data);
        } else {
          throw new Error('Failed to fetch attributes');
        }
      } catch (error) {
        console.error('Error fetching attributes:', error);
      }
    };

    fetchAttributes();
  }, []);

  const toggleAttribute = attr => {
    const newSelectedAttributes = selectedAttributes.includes(attr)
      ? selectedAttributes.filter(item => item !== attr)
      : [...selectedAttributes, attr];
    setSelectedAttributes(newSelectedAttributes);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="grid grid-cols-4 gap-4 pl-2 pt-2 ">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="form-input w-full"
        />
        </div>

      <div className="flex items-center pt-2 pl-2">
        <label className="mr-2 text-sm font-medium text-gray-700">Sort by:</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="form-select block w-auto px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="ml-2 form-select block w-auto  px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <div className="flex items-center space-x-4 bg-white pt-2 pl-2 shadow rounded-lg">
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700">Price From:</label>
          <input
            type="number"
            placeholder="0"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            className="form-input block w-40 px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700">Price To:</label>
          <input
            type="number"
            placeholder="10000"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            className="form-input block w-40 px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-white pt-2 pl-2 pb-2 shadow rounded-lg">
        <label className="text-sm font-medium text-gray-700">Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-select block w-auto px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"        >
          <option value="">All</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <button onClick={() => {
        setEditingProduct(null);
        setShowModal(true);
      }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pl-2">
        New Product
      </button>

      <div className="flex flex-col space-y-4 pt-2 text-black">
        <button
          onClick={() => setShowAttributes(!showAttributes)}
          className=" py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 w-32"
        >
          {showAttributes ? 'Hide Attributes' : 'Show Attributes'}
        </button>

        {showAttributes && (
          <div className="flex flex-col mt-4">
            {availableAttributes.map(attr => (
              <label key={attr.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedAttributes.includes(attr.name)}
                  onChange={() => toggleAttribute(attr.name)}
                  className="form-checkbox h-5 w-5 text-blue-500"
                />
                <span className="text-lg">{attr.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributes</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {products.map(product => (
          <tr key={product.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{product.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{product.category.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{product.description}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{product.attributesString}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-900">Edit</button>
              <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <div className="mt-2">
                    <form onSubmit={handleSubmitProduct}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          name="name"
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                          name="price"
                          type="text"
                          pattern="\d+(\,\d{2})?"
                          title="Please enter a valid price (e.g., 100,99)"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          name="category"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          required
                        >
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="description"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                        ></textarea>
                      </div>
                      {editingProduct && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 text-black">Attributes</label>
                          {attributes.map((attribute, index) => (
                            <div key={attribute.id || index} className="flex items-center mb-2">
                              <select
                                value={attribute.id}
                                onChange={(e) => handleAttributeChange(index, 'id', e.target.value)}
                                className="border p-2 mr-2 text-black"
                              >
                                {availableAttributes.map(attr => (
                                  <option key={attr.id} value={attr.id}>{attr.name}</option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={attribute.value}
                                onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                placeholder="Attribute Value"
                                className="border p-2 mr-2 text-black"
                              />
                              <button onClick={() => removeAttributeField(index)} className="bg-red-500 text-white p-2 rounded">
                                Remove
                              </button>
                            </div>
                          ))}

                          <button type="button" onClick={addAttributeField} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                            Add Attribute
                          </button>

                        </div>
                      )}
                      <div className="mt-4 flex justify-end">
                        <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Cancel</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{editingProduct ? 'Update Product' : 'Add Product'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
