// app/dashboard/layout.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from '@/components/custom/DashboardNav';
import Sidebar from "@/components/custom/sidebar";
import { Providers } from "../provider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Get session on the server
  const session = await getServerSession(authOptions);

  // If not logged in or not admin, redirect to login
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <Providers>
 <div>
      <header className="bg-accent-foreground text-white">
        <DashboardNav user={{ name: session.user.name }} />
      </header>
      <main className="flex ">
        <div className="w-xs pl-8 bg-sidebar-accent-foreground  text-shadow-white">
          <Sidebar/>
        </div>
        {children}
        </main>
    </div>
    </Providers>
   
  );
}
