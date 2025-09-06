// /app/api/wishlist/route.js
import { getServerSession } from 'next-auth/next';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';

/**
 * Helper: Try to determine the current user id.
 * - First try NextAuth session
 * - If session has no id, try email search (useful for credentials provider)
 * - If Authorization Bearer token exists, try to decode JWT
 * Returns an object { userId, user } where userId is string or null, user is the mongoose user doc (if we fetch it)
 */
async function resolveUser(req) {
  // 1) Try NextAuth session
  const session = await getServerSession(authOptions);
  if (session) {
    // prefer id fields
    const id = session.user?.id || session.user?._id || null;
    if (id) return { userId: id, session };

    // fallback: if session includes email, find user by email
    if (session.user?.email) {
      await connectDB();
      const user = await User.findOne({ email: session.user.email }).lean();
      if (user) return { userId: String(user._id), user, session };
    }
  }

  // 2) Try custom Bearer token (JWT)
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      // adjust according to how you sign tokens (payload.userId or payload.sub etc)
      const userId = payload.userId || payload.sub || null;
      if (userId) return { userId, tokenPayload: payload };
      // if token contains email
      if (payload.email) {
        await connectDB();
        const user = await User.findOne({ email: payload.email }).lean();
        if (user) return { userId: String(user._id), user, tokenPayload: payload };
      }
    } catch (err) {
      console.error('JWT verify failed:', err.message);
      return { userId: null };
    }
  }

  return { userId: null };
}

async function ensureConnected() {
  await connectDB();
}

/* GET /api/wishlist */
export async function GET(req) {
  try {
    const { userId } = await resolveUser(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await ensureConnected();
    const user = await User.findById(userId).populate({ path: 'wishlist', model: Product }).lean();
    return new Response(JSON.stringify({ wishlist: user?.wishlist || [] }), { status: 200 });
  } catch (err) {
    console.error('GET /api/wishlist error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

/* POST /api/wishlist */
export async function POST(req) {
  try {
    const { userId } = await resolveUser(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const productId = body?.productId;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return new Response(JSON.stringify({ error: 'Invalid productId' }), { status: 400 });
    }

    await ensureConnected();
    // Add to set (no duplicates)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: new mongoose.Types.ObjectId(productId) }
    });

    // Return populated wishlist
    const updated = await User.findById(userId).populate({ path: 'wishlist', model: Product }).lean();
    return new Response(JSON.stringify({ wishlist: updated?.wishlist || [] }), { status: 200 });
  } catch (err) {
    console.error('POST /api/wishlist error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

/* DELETE /api/wishlist */
export async function DELETE(req) {
  try {
    const { userId } = await resolveUser(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const productId = body?.productId;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return new Response(JSON.stringify({ error: 'Invalid productId' }), { status: 400 });
    }

    await ensureConnected();
    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: mongoose.Types.ObjectId(productId) }
    });

    const updated = await User.findById(userId).populate({ path: 'wishlist', model: Product }).lean();
    return new Response(JSON.stringify({ wishlist: updated?.wishlist || [] }), { status: 200 });
  } catch (err) {
    console.error('DELETE /api/wishlist error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
