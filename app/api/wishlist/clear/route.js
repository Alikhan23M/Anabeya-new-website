import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    await User.findByIdAndUpdate(session.user.id, { $set: { wishlist: [] } });

    return NextResponse.json({ success: true, message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return NextResponse.json({ error: 'Failed to clear wishlist' }, { status: 500 });
  }
}

