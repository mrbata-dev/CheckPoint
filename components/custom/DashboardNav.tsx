import { Avatar, AvatarFallback } from '@radix-ui/react-avatar'
import React from 'react'

type DashboardNavProps = {
  user: {
    name: string;
    
  };
};

const DashboardNav = ({user} : DashboardNavProps) => {
    
  return (
    <nav className='px-10 py-4 flex justify-between items-center'>
        <div>
            <h1 className='font-bold text-3xl'>Logo</h1>
        </div>
        <div
        className='size-10 rounded-full border text-center flex items-center justify-center'
        >
            <Avatar 
            
            >
                <AvatarFallback
                className='font-black'
                >
                    { (user.name?.[0]).toUpperCase()
}
                </AvatarFallback>
            </Avatar>
        </div>
    </nav>
  )
}

export default DashboardNav
