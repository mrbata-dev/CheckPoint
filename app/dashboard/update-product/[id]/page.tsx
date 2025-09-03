import UpdateProduct from "@/components/custom/updateProducts";


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = parseInt(id);
  
  if (isNaN(productId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">Invalid product ID</div>
      </div>
    );
  }
  
  return <UpdateProduct productId={productId} />;
}