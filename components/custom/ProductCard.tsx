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
  image:string[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}
const ProductCard = ({products, image}: ProductCardProps) => {
  const[isLoading, setisLoading] = useState(false);
  const handleDelete = async(id: number)=>{
    if(!confirm('Are you sure?')) return;
    setisLoading(true);
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
         headers: {
                'Content-Type': 'application/json',
            
              },
              credentials: 'include' ,
              cache: 'no-cache'
      });
      toast.success('Product deleted successfully!')
    } catch (error) {
      toast.error('Deletion failed!')
      
    }
    finally{
      setisLoading(false);
    }
  }

  if(isLoading) return(<p>Loading........</p>)
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 place-content-center'>
       {
        products.map((items, idx)=> (
           <Link href={`/dashboard/product-details/${items.id}/${items.p_name}`} key={items.id}>
             <div id="card" 
             className='group border rounded-2xl p-4 hover:scale-105 transition-all ease-in-out duration-75 overflow-hidden' 
             >
            <div id="image"
            className=' md:w-[15em]   xl:w-[20rem] rounded-2xl group hover:scale-100 overflow-hidden'
            >
              <Image
              src={image[idx]}
              width={500}
              height={200}
              alt={items.p_name}
              className='w-full h-[10rem] md:h-[15rem]  object-cover overflow-hidden'
              
              />
            </div>
  
            {/* product name */}
            <div
            className='flex justify-between items-center py-4'
            >
              <h2 className='text-xl font-semibold'>{items.p_name}</h2>
            <p><span>Rs.</span>{items.price}</p>
            </div>
  
            {/* Delete products or update */}
         <div
         className='flex items-center justify-between'
         >
              <Button
              className='bg-red-400 border-red-800 hover:bg-red-600 transform ease-in-out cursor-pointer'
              onClick={(e) => {
                e.preventDefault();
                handleDelete(items.id);
              }}
              >
                <Trash/> <span>Delete</span>
              </Button>
                 <Button
                 className='bg-blue-400 border-blue-800 hover:bg-blue-600 transform ease-in-out cursor-pointer'
                 >
                       <Link href={`/dashboard/update-product/${items.id}` }
                       className='flex items-center gap-2'
                       >
     <Edit/> <span>Edit</span>
     </Link>
            </Button>
         </div>
          </div>
           </Link>
        ))
       }
    </div>
  )
}

export default ProductCard
