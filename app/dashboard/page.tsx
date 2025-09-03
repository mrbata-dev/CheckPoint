import ProductCard from '@/components/custom/ProductCard';
import { Button } from '@/components/ui/button';

import { fetchProducts } from '@/lib/prisma';
import { Search } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const Dashboard = async ({searchParams}: {searchParams: {page?:string}}) => {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const{products, pagination} = await fetchProducts(page, limit);
  // console.log(products);
  // console.log(pagination);
  
  
  return (
    <div className='p-8 flex flex-col'>
      <h1 className='pb-8 font-bold text-sm sm:text-lg md:text-xl lg:text-2xl'>All Products</h1>
      <div className='flex w-full items-center justify-center '>
       <div className='flex gap-2 md:w-2xl rounded-2xl items-center-safe border-black border-2 justify-center-safe'>
          <input 
          type='search'
          className='border-0 focus:border-0 w-full md:w-2xl outline-0 pl-5'
          />
          <Button className=''>
<Search/>

          </Button>
          </div>
      </div>

      {/* product cards */}
      <div className='mt-8'>
        <ProductCard  
          products={products} 
          image={products.map(product => product.image?.[0]?.url ?? '')}
          pagination={pagination}
        />
      </div>

      {/* paginations */}
      <div className='mt-12 w-full flex items-center justify-center'>
        {
          [...Array(pagination.totalPages)].map((_, i)=>(
            <Link
            key={i+1}
            href={`?page=${i + 1}&limit=12`}
            className={`px-3 py-1 rounded ${pagination.currentPage === i + 1 ? 'bg-gray-400 text-black' : 'bg-white text-black border-black'}`}
            >
            
              {i+1}
            </Link>
          ))
        }
      </div>
    </div>
  )
}

export default Dashboard
