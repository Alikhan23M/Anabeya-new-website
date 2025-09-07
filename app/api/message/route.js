import Message from "@/lib/models/Message";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, phone, message } = await request.json();
    const newMessage = await Message.create({ name, email, phone, message });
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

