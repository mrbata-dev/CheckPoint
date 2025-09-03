'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ProductImage {
  url: string;
}

interface Product {
  p_name: string;
  price: number;
  discount: number;
  description?: string;
  stock: number;
  image: ProductImage[];
}

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string; productname: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        setProduct(data);
        setMainImage(data.image?.length > 0 ? data.image[0].url : '/placeholder.jpg');
      } catch (err) {
        console.error(err);
        toast.error('Failed to load product');
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border shadow-md">
            <Image
              width={500}
              height={500}
              src={mainImage}
              alt={product.p_name}
              className="w-full h-full object-cover"
            />
          </div>

          {product.image && product.image.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.image.map((img, idx) => (
                <button
                  key={idx}
                  className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                    mainImage === img.url
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setMainImage(img.url)}
                >
                  <Image
                    width={500}
                    height={500}
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.p_name}</h1>

          <div className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold ">${product.price.toFixed(2)}</span>
              {product.discount > 0 && (
                <span className="text-sm line-through text-gray-500">
                  ${(product.price * (1 + product.discount / 100)).toFixed(2)}
                </span>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'No description available.'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-medium">Stock:</span>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  product.stock > 5
                    ? 'bg-green-100 text-green-800'
                    : product.stock < 5
                    ? 'bg-red-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.stock} units
              </span>
            </div>

            <Button className="w-full mt-8 bg-blue-400 border-blue-800 hover:bg-blue-600">
              <Link href={`/dashboard/update-product/${id}`} className="flex items-center gap-2">
                <Edit /> <span>Edit</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
