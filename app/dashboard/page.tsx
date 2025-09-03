'use client';
import ProductCard from '@/components/custom/ProductCard';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Define types
interface Product {
  id: number;
  p_name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAt: Date;
  userid: number;
  discount: number;
  image?: { url: string }[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

interface DashboardProps {
  searchParams: { 
    page?: string;
    q?: string;
  };
}

// Debounce utility function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Dashboard = ({ searchParams }: DashboardProps) => {
  const urlSearchParams = useSearchParams();
  const page = urlSearchParams.get('page') ?? '1';
  const q = urlSearchParams.get('q') ?? '';

  const [searchQuery, setSearchQuery] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: parseInt(page),
    totalPages: 1,
    totalCount: 0,
    limit: 12,
  });
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  // const page = parseInt(searchParams.page || "1");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Fetch products function with abort controller for smooth UX
const fetchProducts = useCallback(async (currentPage: number = 1, query: string = '') => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  
  abortControllerRef.current = new AbortController();
  setLoading(true);
  
  try {
    // Always use the search endpoint
    const url = `/api/search?q=${encodeURIComponent(query)}&page=${currentPage}&limit=12`;
    
    const response = await fetch(url, {
      signal: abortControllerRef.current.signal
    });
    
    if (response.ok) {
      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {
        currentPage,
        totalPages: Math.ceil((data.products?.length || 0) / 12),
        totalCount: data.products?.length || 0,
        limit: 12
      });
    } else {
      console.error('Failed to fetch products:', await response.json());
    }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'name' in error && (error as { name: string }).name !== 'AbortError') {
      console.error('Error fetching products:', error);
    }
  } finally {
    setLoading(false);
  }
}, []);

  // Initial load and search effect
  useEffect(() => {
    fetchProducts(1, debouncedSearchQuery);
  }, [debouncedSearchQuery, fetchProducts]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  // Handle pagination click
  const handlePageClick = (pageNum: number) => {
    fetchProducts(pageNum, debouncedSearchQuery);
  };

  return (
    <div className='min-h-screen'>
      <div className='max-w-full mx-auto p-6 sm:p-8 flex flex-col'>
        {/* Header Section */}
        <div className='mb-12'>
          <div className='text-left mb-8'>
            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2'>
              Discover Products
            </h1>
            <p className='text-slate-600 text-lg'>
              {isSearching 
                && `Found ${pagination.totalCount} results for "${debouncedSearchQuery}"` 
               
              }
            </p>
          </div>

          <div className='flex justify-center items-center mb-8'>
            <div className='relative w-full max-w-2xl'>
              <div className={`
                relative flex items-center bg-white rounded-2xl shadow-lg 
                border-2 transition-all duration-300 overflow-hidden
                ${searchFocused ? ' shadow-xl scale-[1.02]' : 'border-slate-200 hover:border-slate-300'}
              `}>
                <div className='absolute left-4 text-slate-400'>
                  <Search size={20} />
                </div>
                
                <input
                  type='search'
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search products by name or description..."
                  className='w-full pl-12 pr-20 py-4 outline-none text-slate-700 placeholder-slate-400 text-lg md:w-2xl justify-center-safe'
                />
                
                <div className="flex items-center pr-2">

                  {loading && (
                    <div className="mr-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}

                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="p-1 mr-2 text-slate-400 hover:text-slate-600 transition-colors duration-200 hover:bg-slate-100 rounded-full"
                      aria-label="Clear search"
                    >
                      <X size={18} />
                    </button>
                  )}
                  
                  {/* Search button */}
                  <Button 
                    className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200'
                  >
                    <Search size={18} />
                  </Button>
                </div>
              </div>
              

              {searchFocused && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                  
                </div>
              )}
            </div>
          </div>

      
        </div>

        {/* Results Section */}
        <div className='relative flex flex-col items-center justify-center'>
      
          {loading && (
            <div className=' bg-white/50  flex items-center justify-center z-10 rounded-xl'>
              <div className='text-center'>
                <div className='animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-2'></div>
                <p className='text-slate-600 font-medium'>Searching products...</p>
              </div>
            </div>
          )}

          {/* No results message */}
          {!loading && products.length === 0 && debouncedSearchQuery && (
            <div className="text-center py-16 flex items-center justify-center flex-col min-w-full ">
              <div className='mb-6'>
                <div className='w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center'>
                  <Search size={32} className='text-slate-400' />
                </div>
                <h3 className='text-xl font-semibold text-slate-700 mb-2'>No products found</h3>
                <p className="text-slate-500 mb-6">We couldn&apos;t find any products matching `{debouncedSearchQuery}`</p>
              </div>
              <Button 
                onClick={clearSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                View all products
              </Button>
            </div>
          )}

          {/* Product cards */}
          {products.length > 0 && (
            <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              <ProductCard
                products={products}
                image={products.map(product => product.image?.[0]?.url ?? '')}
                pagination={pagination}
              />
            </div>
          )}

          {/* Enhanced Pagination */}
          {
          !loading && products.length > 0 && pagination.totalPages > 1 && (
            <div className='mt-16 flex justify-center'>
              <div className='flex items-center space-x-2 bg-white rounded-xl p-2 shadow-lg border border-slate-200'>
                {/* Previous button */}
                {pagination.currentPage > 1 && (
                  <button
                    onClick={() => handlePageClick(pagination.currentPage - 1)}
                    className='px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200'
                  >
                    ← Previous
                  </button>
                )}
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 7) {
                    pageNum = i + 1;
                  } else {
                    if (pagination.currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 6 + i;
                    } else {
                      pageNum = pagination.currentPage - 3 + i;
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageClick(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        pagination.currentPage === pageNum 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {/* Next button */}
                {pagination.currentPage < pagination.totalPages && (
                  <button
                    onClick={() => handlePageClick(pagination.currentPage + 1)}
                    className='px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200'
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          )
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;