// This file manages admin settings (view and update site settings).

import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export async function GET() {
  try {
    await connectDB();
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    return Response.json(settings);
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();

    await connectDB();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(data);
    } else {
      settings = await Settings.findOneAndUpdate({}, data, { new: true });
    }

    return Response.json(settings);
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}