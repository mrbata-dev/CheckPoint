'use client'
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Bell, X, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

type Notification = {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
  product: {
    p_name: string;
    stock: number;
  };
};

type DashboardNavProps = {
  user: {
    name: string;
  };
};

const DashboardNav = ({ user }: DashboardNavProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        // Remove the notification from the list
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerStockCheck = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stock-check', {
        method: 'POST',
      });
      
      if (response.ok) {

        setTimeout(fetchNotifications, 500);
      }
    } catch (error) {
      console.error('Error triggering stock check:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    triggerStockCheck();
    
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Count critical notifications (stock < 3)
  const criticalNotifications = notifications.filter(n => 
    n.product?.stock !== undefined && n.product.stock < 3
  );

  const getNotificationIcon = (notification: Notification) => {
    if (notification.product?.stock !== undefined && notification.product.stock < 3) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <Bell className="h-4 w-4 text-yellow-500 cursor-pointer" />;
  };

  const getNotificationPriority = (notification: Notification) => {
    if (notification.product?.stock !== undefined && notification.product.stock < 3) {
      return 'critical';
    }
    return 'normal';
  };

  return (
    <nav className='px-10 py-4 flex justify-between items-center'>
      <div>
        <h1 className='font-bold text-3xl'>Logo</h1>
      </div>
      
      <div className='flex items-center justify-center gap-8'>
        {/* Stock Check Button (Admin only) */}
        {/* <button 
          onClick={triggerStockCheck}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Stock'}
        </button> */}

        {/* Notification */}
        <div className='relative cursor-pointer'>
          <Popover>
            <PopoverTrigger className="relative cursor-pointer">
              {notifications.length > 0 && (
                <div className="absolute -top-2 -right-2 flex">
                  {criticalNotifications.length > 0 && (
                    <span className='size-3 bg-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse'>
                      !
                    </span>
                  )}
                  <span className='size-4 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold ml-1'>
                    {notifications.length}
                  </span>
                </div>
              )}
              <Bell className={`h-6 w-6 ${criticalNotifications.length > 0 ? 'text-red-500' : 'text-gray-600'}`} />
            </PopoverTrigger>
            
            <PopoverContent className='w-96 p-0 bg-white text-black shadow-lg rounded-md border max-h-96 overflow-hidden'>
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <span className="text-xs text-gray-500">
                    {notifications.length} unread
                  </span>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className='space-y-1'>
                    {notifications
                      .sort((a, b) => {
                        // Sort by priority (critical first) then by date
                        const aPriority = getNotificationPriority(a);
                        const bPriority = getNotificationPriority(b);
                        
                        if (aPriority === 'critical' && bPriority !== 'critical') return -1;
                        if (bPriority === 'critical' && aPriority !== 'critical') return 1;
                        
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      })
                      .map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b hover:bg-gray-50 ${
                            getNotificationPriority(notification) === 'critical' 
                              ? 'bg-red-50 border-red-200' 
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              {getNotificationIcon(notification)}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm break-words ${
                                  getNotificationPriority(notification) === 'critical' 
                                    ? 'text-red-800 font-medium' 
                                    : ''
                                }`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className='text-xs text-gray-500'>
                                    {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {notification.product?.stock !== undefined && (
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      notification.product.stock < 3 
                                        ? 'bg-red-100 text-red-700' 
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      Stock: {notification.product.stock}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => markNotificationAsRead(notification.id)}
                              disabled={loading}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 flex-shrink-0"
                              title="Mark as read"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className='text-center text-gray-500'>No notifications</p>
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 border-t bg-gray-50">
                  <button 
                    onClick={() => {
                      notifications.forEach(n => markNotificationAsRead(n.id));
                    }}
                    disabled={loading}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.name}</span>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;