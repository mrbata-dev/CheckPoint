'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Product {
    id: number;
    p_name: string;
    description: string;
    price: number;
    discount: number;
    stock: number;
    userid: number;
    createdAt: string;
    image: Array<{ id: number; url: string; productId: number }>;
}

interface UpdateProductProps {
    productId: number;
}

const UpdateProduct = ({ productId }: UpdateProductProps) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        p_name: '',
        description: '',
        price: '',
        discount: '',
        stock: '',
        images: [] as File[],
        existingImages: [] as Array<{ id: number; url: string }>
    });

    const [errors, setErrors] = useState({
        p_name: '',
        description: '',
        price: '',
        discount: '',
        stock: '',
        images: ''
    });

    // Fetch existing product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/products/${productId}`);
                const product: Product = response.data;
                
                setOriginalProduct(product);
                setFormData({
                    p_name: product.p_name,
                    description: product.description || '',
                    price: product.price.toString(),
                    discount: product.discount?.toString() || '',
                    stock: product.stock?.toString() || '',
                    images: [],
                    existingImages: product.image || []
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                alert('Failed to fetch product data');
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const validateField = (name: string, value: string | File[]) => {
        let errorMessage = '';
        
        switch(name) {
            case 'p_name':
                if (typeof value === 'string' && !value.trim()) errorMessage = 'Product name is required';
                break;
            case 'description':
                if (typeof value === 'string' && !value.trim()) errorMessage = 'Description is required';
                break;
            case 'price':
                if (!value) errorMessage = 'Price is required';
                else if (isNaN(Number(value)) || Number(value) <= 0) errorMessage = 'Price must be a positive number';
                break;
            case 'discount':
                if (value && (isNaN(Number(value)) || Number(value) < 0)) errorMessage = 'Discount must be a non-negative number';
                break;
            case 'stock':
                if (value && (isNaN(Number(value)) || Number(value) < 0)) errorMessage = 'Stock must be a non-negative number';
                break;
            case 'images':
                const totalImages = (value as File[]).length + formData.existingImages.length;
                if (totalImages > 5) errorMessage = 'Maximum 5 images allowed (including existing images)';
                break;
        }
        
        return errorMessage;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'images' && e.target instanceof HTMLInputElement && e.target.type === 'file') {
            const files = e.target.files;
            if (files) {
                const newImages = Array.from(files);
                const totalImages = newImages.length + formData.existingImages.length;
                const allowedNewImages = totalImages > 5 ? newImages.slice(0, 5 - formData.existingImages.length) : newImages;
                
                setFormData(prev => ({ ...prev, images: allowedNewImages }));
                setErrors(prev => ({ ...prev, images: validateField('images', allowedNewImages) }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const removeExistingImage = (imageId: number) => {
        setFormData(prev => ({
            ...prev,
            existingImages: prev.existingImages.filter(img => img.id !== imageId)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all fields before submission
        const newErrors = {
            p_name: validateField('p_name', formData.p_name),
            description: validateField('description', formData.description),
            price: validateField('price', formData.price),
            discount: validateField('discount', formData.discount),
            stock: validateField('stock', formData.stock),
            images: validateField('images', formData.images)
        };
        
        setErrors(newErrors);
        
        // Check if there are any errors
        if (Object.values(newErrors).some(error => error !== '')) {
            return;
        }

        const data = new FormData();
        data.append('p_name', formData.p_name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('discount', formData.discount);
        data.append('stock', formData.stock);
        data.append('keepImageIds', JSON.stringify(formData.existingImages.map(img => img.id)));
        
        if (session && session.user && session.user.id) {
            data.append('userid', session.user.id.toString());
        } else {
            alert('User session not found. Please log in.');
            return;
        }

        formData.images.forEach((img) => {
            data.append('images', img);
        });

        try {
            const res = await axios.put(`/api/products/${productId}`, data);
            console.log('Product updated:', res.data);
            alert('Product updated successfully!');
            router.push('/dashboard'); 
        } catch (err) {
            console.error(err);
            alert('Failed to update product');
        }
    };

    const resetToOriginal = () => {
        if (originalProduct) {
            setFormData({
                p_name: originalProduct.p_name,
                description: originalProduct.description || '',
                price: originalProduct.price.toString(),
                discount: originalProduct.discount?.toString() || '',
                stock: originalProduct.stock?.toString() || '',
                images: [],
                existingImages: originalProduct.image || []
            });
            setErrors({
                p_name: '',
                description: '',
                price: '',
                discount: '',
                stock: '',
                images: ''
            });
        }
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center w-full min-h-screen'>
                <div className="text-lg">Loading product data...</div>
            </div>
        );
    }

    if (!originalProduct) {
        return (
            <div className='flex items-center justify-center w-full min-h-screen'>
                <div className="text-lg text-red-500">Product not found</div>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center w-full min-h-screen py-10'>
            <div className='max-w-6xl mx-auto flex gap-8'>
                {/* Original Product Details - Left Side */}
                <div className='w-1/2 border rounded-md p-6 bg-gray-50'>
                    <h2 className='text-xl font-bold mb-4 text-gray-700'>Current Product Details</h2>
                    
                    <div className='space-y-4'>
                        <div>
                            <label className='text-sm font-medium text-gray-600'>Product Name:</label>
                            <p className='text-base font-medium'>{originalProduct.p_name}</p>
                        </div>
                        
                        <div>
                            <label className='text-sm font-medium text-gray-600'>Description:</label>
                            <p className='text-base'>{originalProduct.description || 'No description'}</p>
                        </div>
                        
                        <div className='flex gap-4'>
                            <div className='flex-1'>
                                <label className='text-sm font-medium text-gray-600'>Price:</label>
                                <p className='text-base font-medium'>${originalProduct.price}</p>
                            </div>
                            <div className='flex-1'>
                                <label className='text-sm font-medium text-gray-600'>Discount:</label>
                                <p className='text-base'>{originalProduct.discount}%</p>
                            </div>
                            <div className='flex-1'>
                                <label className='text-sm font-medium text-gray-600'>Stock:</label>
                                <p className='text-base'>{originalProduct.stock}</p>
                            </div>
                        </div>
                        
                        {originalProduct.image && originalProduct.image.length > 0 && (
                            <div>
                                <label className='text-sm font-medium text-gray-600'>Current Images:</label>
                                <div className='flex flex-wrap gap-2 mt-2'>
                                    {originalProduct.image.map((image, index) => (
                                        <Image
                                        width={500} 
                                        height={500}
                                            key={image.id}
                                            src={image.url} 
                                            alt={`Product ${index + 1}`} 
                                            className='w-16 h-16 object-cover border rounded'
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label className='text-sm font-medium text-gray-600'>Created:</label>
                            <p className='text-base'>{new Date(originalProduct.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Update Form - Right Side */}
                <form
                    onSubmit={handleSubmit}
                    className='w-1/2 border rounded-md p-6'
                >
                    <h2 className='text-xl font-bold mb-4'>Update Product</h2>
                    
                    <div>
                        <label htmlFor="p_name">Product name <span className="text-red-500">*</span></label>
                        <Input 
                            type="text" 
                            name="p_name" 
                            id="p_name" 
                            className='w-full mt-2'
                            value={formData.p_name}
                            onChange={handleChange}
                        />
                        {errors.p_name && <p className="text-red-500 text-sm mt-1">{errors.p_name}</p>}
                    </div>

                    <div className='mt-4'>
                        <label htmlFor="description">Product description <span className="text-red-500">*</span></label>
                        <Textarea  
                            name="description" 
                            id="description" 
                            className='w-full mt-2 h-24'
                            value={formData.description}
                            onChange={handleChange}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div className='flex gap-4 justify-between mt-4'>
                        <div className='w-1/3'>
                            <label htmlFor="price">Product price <span className="text-red-500">*</span></label>
                            <Input 
                                type="number" 
                                step="0.01"
                                name="price" 
                                id="price" 
                                className='w-full mt-2'
                                value={formData.price}
                                onChange={handleChange}
                            />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                        </div>

                        <div className='w-1/3'>
                            <label htmlFor="discount">Discount (%)</label>
                            <Input 
                                type="number" 
                                step="0.01"
                                name="discount" 
                                id="discount" 
                                className='w-full mt-2'
                                value={formData.discount}
                                onChange={handleChange}
                            />
                            {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
                        </div>

                        <div className='w-1/3'>
                            <label htmlFor="stock">Stock</label>
                            <Input 
                                type="number" 
                                name="stock" 
                                id="stock" 
                                className='w-full mt-2'
                                value={formData.stock}
                                onChange={handleChange}
                            />
                            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                        </div>
                    </div>

                    {/* Existing Images Management */}
                    {formData.existingImages.length > 0 && (
                        <div className='mt-4'>
                            <label>Keep These Images</label>
                            <div className='flex flex-wrap gap-2 mt-2'>
                                {formData.existingImages.map((image) => (
                                    <div key={image.id} className='relative'>
                                        <Image
                                        width={500}
                                        height={500} 
                                            src={image.url} 
                                            alt="Product" 
                                            className='w-20 h-20 object-cover border rounded'
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(image.id)}
                                            className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600'
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className='mt-4'>
                        <label htmlFor="images">Add New Images <span className="text-red-500">(max 5 total)</span></label>
                        <Input 
                            type='file'
                            multiple
                            name="images"
                            accept="image/*"
                            onChange={handleChange}
                        />
                        {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                        {formData.images.length > 0 && (
                            <div className='flex flex-wrap gap-2 mt-2'>
                                {formData.images.map((file, index) => (
                                    <div key={index} className='relative'>
                                        <Image
                                        width={500}
                                        height={500} 
                                            src={URL.createObjectURL(file)} 
                                            alt={`New ${index + 1}`} 
                                            className='w-20 h-20 object-cover border rounded'
                                        />
                                        <span className='absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
                                            +
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className='flex justify-between mt-6'>
                        <div className='flex gap-2'>
                            <Button
                                type='button'
                                onClick={() => router.back()}
                                className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2'
                            >
                                Cancel
                            </Button>
                            
                            <Button
                                type='button'
                                onClick={resetToOriginal}
                                className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2'
                            >
                                Reset
                            </Button>
                        </div>
                        
                        <Button
                            type='submit'
                            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2'
                        >
                            Update Product
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProduct;