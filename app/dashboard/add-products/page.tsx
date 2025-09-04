'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'

const AddProducts = () => {
    const { data: session } = useSession();
    const[isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        product_name: '',
        description: '0',
        price: '',
        discount: '',
        stock: '0',
        images: [] as File[]
    });

    const [errors, setErrors] = useState({
        product_name: '',
        description: '',
        price: '',
        discount: '',
        stock: '',
        images: ''
    });

    const validateField = (name: string, value: string | File[]) => {
        let errorMessage = '';
        
        switch(name) {
            case 'product_name':
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
                if ((value as File[]).length === 0) errorMessage = 'At least one image is required';
                else if ((value as File[]).length > 5) errorMessage = 'Maximum 5 images allowed';
                break;
        }
        
        return errorMessage;
    };
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
       
       
         if (name === 'images' && e.target instanceof HTMLInputElement && e.target.type === 'file') {
            const files = e.target.files;
            if (files) {
                setFormData(prev => ({ ...prev, images: Array.from(files).slice(0, 5) }));
                setErrors(prev => ({ ...prev, images: validateField('images', Array.from(files).slice(0, 5)) }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
       
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all fields before submission
        const newErrors = {
            product_name: validateField('product_name', formData.product_name),
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

        setIsLoading(true); 
        const data = new FormData();
        data.append('product_name', formData.product_name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('discount', formData.discount);
        data.append('stock', formData.stock);
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
            const res = await axios.post('/api/products', data); 
            console.log('Product created:', res.data);
            alert('Product added successfully!');
            
            // Reset form after successful submission
            setFormData({
                product_name: '',
                description: '',
                price: '',
                discount: '',
                stock: '',
                images: []
            });
            setErrors({
                product_name: '',
                description: '',
                price: '',
                discount: '',
                stock: '',
                images: ''
            });
        } catch (err) {
            console.error(err);
            alert('Failed to add product');
        }
        finally{
        setIsLoading(false);
       }
    };

    return (
        <div className='flex items-center justify-center w-full min-h-screen py-10'>
            <form
                onSubmit={handleSubmit}
                className='border rounded-md p-8 max-w-4xl mx-auto'
            >
                <div>
                    <label htmlFor="product_name">Product name <span className="text-red-500">*</span></label>
                    <Input 
                        type="text" 
                        name="product_name" 
                        id="product_name" 
                        className='w-full mt-2'
                        value={formData.product_name}
                        onChange={handleChange}
                    />
                    {errors.product_name && <p className="text-red-500 text-sm mt-1">{errors.product_name}</p>}
                </div>

                <div className='mt-4'>
                    <label htmlFor="description">Product description <span className="text-red-500">*</span></label>
                    <Textarea  
                        name="description" 
                        id="description" 
                        className='w-full mt-2 h-32'
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

                <div className='mt-4'>
                    <label htmlFor="images">Images <span className="text-red-500">(add only 5 images)</span></label>
                    <Input 
                        type='file'
                        multiple
                        name="images"
                        accept="image/*"
                        onChange={handleChange}
                    />
                    {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                </div>

                <div className='flex justify-between mt-6'>
                    <Button
                        type='button'
                        onClick={() => {
                            setFormData({
                                product_name: '',
                                description: '',
                                price: '',
                                discount: '',
                                stock: '',
                                images: []
                            });
                            setErrors({
                                product_name: '',
                                description: '',
                                price: '',
                                discount: '',
                                stock: '',
                                images: ''
                            });
                        }}
                        className='bg-white text-black border-2 hover:bg-black hover:text-white transition ease-in'
                    >
                        Reset Form
                    </Button>
                    
                 <Button
  type="submit"
  disabled={isLoading}
  className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition ease-in flex items-center justify-center gap-2 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
>
  {isLoading ? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      Adding...
    </>
  ) : (
    "Add Product"
  )}
</Button>

                </div>
            </form>
        </div>
    );
};

export default AddProducts;