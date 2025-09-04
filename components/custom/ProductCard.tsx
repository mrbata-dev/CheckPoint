'use client'
import { Product } from '@prisma/client';
import Image from 'next/image';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ProductCardProps {
  products: Product[];
  image: string[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

const ProductCard = ({ products, image }: ProductCardProps) => {
  const [isLoading, setisLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    setisLoading(true);
    setDeletingId(id);
    
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache'
      });
      toast.success('Product deleted successfully!')
    } catch (error) {
      console.log(error);
      toast.error('Deletion failed!')
    }
    finally {
      setisLoading(false);
      setDeletingId(null);
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  )

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6 place-content-center'>
      {
        products.map((items, idx) => (
          <div key={items.id} className="group relative">
            <div 
              className={`
                border rounded-2xl p-4 overflow-hidden
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10
                hover:-translate-y-1 hover:border-gray-300
                ${deletingId === items.id ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              {/* Clickable Image and Info Area */}
              <Link href={`/dashboard/product-details/${items.id}/${items.p_name}`} className="block">
                {/* Image Container */}
                <div className="relative overflow-hidden rounded-xl mb-4 group/image cursor-pointer md:w-[15rem] lg:w-[20rem]">
                  <div className="aspect-[4/3] w-full">
                    <Image
                      src={image[idx]}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      alt={items.p_name}
                      className="object-cover transition-transform duration-500 ease-out group-hover/image:scale-110"
                    />
                  </div>
                  
                  {/* Overlay effect on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-all duration-300 ease-out"></div>
                </div>

                {/* Product Info */}
                <div className='flex justify-between items-start py-3 mb-4 cursor-pointer'>
                  <h2 className='text-lg font-semibold text-gray-800 line-clamp-2 flex-1 mr-2 hover:text-black transition-colors duration-200'>
                    {items.p_name}
                  </h2>
                  <p className='text-lg font-bold text-green-600 whitespace-nowrap'>
                    <span className='text-sm'>Rs.</span>{items.price}
                  </p>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className='flex items-center justify-between gap-3'>
                <Button
                  disabled={deletingId === items.id}
                  className={`
                    flex-1 bg-red-500 hover:bg-red-600 border-0 text-white
                    transform transition-all duration-200 ease-out
                    hover:scale-105 hover:shadow-lg hover:shadow-red-500/25
                    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:transform-none disabled:shadow-none
                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(items.id);
                  }}
                >
                  {deletingId === items.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Trash className="w-4 h-4 mr-2" />
                      <span>Delete</span>
                    </>
                  )}
                </Button>

                <Button
                  className={`
                    flex-1 bg-blue-500 hover:bg-blue-600 border-0 text-white
                    transform transition-all duration-200 ease-out
                    hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25
                    active:scale-95
                  `}
                >
                  <Link 
                    href={`/dashboard/update-product/${items.id}`}
                    className='flex items-center justify-center gap-2 w-full'
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
}

export default ProductCard