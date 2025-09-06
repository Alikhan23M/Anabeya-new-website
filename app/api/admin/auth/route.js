import bcrypt from 'bcryptjs';

// This file handles admin authentication (login, logout, etc).

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      return Response.json({ 
        success: true, 
        user: { email: adminEmail, isAdmin: true } 
      });
    }

    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}