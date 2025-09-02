import { Product } from '@prisma/client';
import React from 'react'

interface ProductDetails {
  params: Product[]; 
}

const ProductDetailsPage = ({ params }: ProductDetails) => {
  // Directly use 'params' without extra destructuring
  console.log(params);

  return (
    <div>
      {/* Render your product details here */}
    </div>
  );
};

export default ProductDetailsPage;