'use client'
import { LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const dashboardNavLinks = [
  { name: "All products", href: `/dashboard` },
  { name: "Add products", href: `/dashboard/add-products` },
]

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Function to check if the current path matches the link
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href;
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 sm:w-72
          bg-white border-r border-gray-200 shadow-lg
          transform transition-transform duration-300 ease-in-out z-40
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">Dashboard</h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {dashboardNavLinks.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "block w-full px-4 py-3 rounded-lg transition-all duration-200 ease-in-out font-medium text-base group",
                    {
                      "bg-black text-white": isActive(item.href),
                      "text-gray-700 hover:bg-black hover:text-white": !isActive(item.href)
                    }
                  )}
                >
                  <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-6 border-t border-gray-200">
          <Button
            onClick={() => signOut({callbackUrl:"/login"})}
            type="button"
            className="
              bg-transparent
              flex items-center gap-3 w-full px-4 py-3 rounded-lg
              text-gray-700 hover:bg-red-50 hover:text-red-600
              transition-all duration-200 ease-in-out
              font-medium text-base
              cursor-pointer
              group
            "
          >
            <LogOut
              size={20}
              className="group-hover:scale-110 transition-transform duration-200"
            />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </>
  )
}

export default Sidebar