import { LogOut } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const dashboardNavLinks = [
  {name:"All products", href:`/dashboard`},
  {name:"Add products", href:`/dashboard/add-products`},
  
]
const Sidebar = () => {
  return (
    <div className='text-white py-10 flex flex-col justify-between min-h-[53.8rem]'>
<div>
       {
        dashboardNavLinks.map((items)=> (
          <ul key={items.name}
          className='text-xl  border w-[12rem] py-2 px-4 rounded-md  font-semibold cursor-pointer mb-4'
          >
            <Link href={items.href}
            
            >{items.name}
            </Link>
          </ul>
          
        ))
       }
</div>
     <div>
      <Link href={'/logout'}
      className='flex items-center gap-2'
      >
      Logout <LogOut/>
      </Link>
     </div>
    </div>
  )
}

export default Sidebar
