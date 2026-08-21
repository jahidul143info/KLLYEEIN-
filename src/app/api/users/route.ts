import { NextRequest, NextResponse } from 'next/server';
import { ManagedUser, DEFAULT_USERS } from '../../../lib/usersStore';

// In-memory persistent server storage across route calls
let serverUsers: ManagedUser[] = [...DEFAULT_USERS];

export async function GET() {
  return NextResponse.json({
    success: true,
    users: serverUsers,
    total: serverUsers.length,
    active: serverUsers.filter((u) => !u.isBanned).length,
    banned: serverUsers.filter((u) => u.isBanned).length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Bulk sync from admin
    if (body?.users && Array.isArray(body.users)) {
      serverUsers = body.users;
      return NextResponse.json({
        success: true,
        message: 'Users synchronized successfully',
        count: serverUsers.length,
      });
    }

    // Single user creation
    if (body?.email) {
      const email = body.email.trim().toLowerCase();
      const existing = serverUsers.find((u) => u.email.toLowerCase() === email);
      if (existing) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
      }

      const newUser: ManagedUser = {
        id: `user-${Date.now()}`,
        email,
        fullName: body.fullName || email.split('@')[0],
        phone: body.phone,
        address: body.address,
        city: body.city || 'Dhaka',
        role: body.role || 'customer',
        isBanned: false,
        createdAt: new Date().toISOString(),
        ordersCount: 0,
        totalSpent: 0,
      };

      serverUsers.unshift(newUser);
      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process request' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, banReason, role } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const index = serverUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Protect Super Admin
    if (serverUsers[index].email.toLowerCase() === 'admin.osman@gmail.com' && action === 'ban') {
      return NextResponse.json({ error: 'Cannot ban the Super Admin account' }, { status: 403 });
    }

    if (action === 'ban') {
      serverUsers[index].isBanned = true;
      serverUsers[index].banReason = banReason || 'Suspended by Administrator';
      serverUsers[index].bannedAt = new Date().toISOString();
    } else if (action === 'unban') {
      serverUsers[index].isBanned = false;
      delete serverUsers[index].banReason;
      delete serverUsers[index].bannedAt;
    } else if (action === 'update_role' && role) {
      serverUsers[index].role = role;
    }

    return NextResponse.json({
      success: true,
      user: serverUsers[index],
      message: `User ${action} completed successfully`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const target = serverUsers.find((u) => u.id === id);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (target.email.toLowerCase() === 'admin.osman@gmail.com') {
      return NextResponse.json({ error: 'Cannot delete Super Admin account' }, { status: 403 });
    }

    serverUsers = serverUsers.filter((u) => u.id !== id);
    return NextResponse.json({ success: true, message: 'User deleted permanently' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 500 });
  }
}
