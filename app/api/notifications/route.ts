import { getPrisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const notifications = await getPrisma().notification.findMany({
      where: { read: false },
      orderBy: { createdAt: "desc" },
      include: { 
        product: {
          select: {
            p_name: true,
            stock: true
          }
        } 
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" }, 
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PUT(request: Request) {
  try {
    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const updatedNotification = await getPrisma().notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}