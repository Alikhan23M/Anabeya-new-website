import Message from "@/lib/models/Message";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const deletedMessage = await Message.findByIdAndDelete(id);
        if (!deletedMessage) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Message deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// Mark message read or unread

export async function PATCH(request, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const { isRead } = await request.json();
        const updatedMessage = await Message.findByIdAndUpdate(id, { isRead }, { new: true });
        if (!updatedMessage) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }
        return NextResponse.json(updatedMessage, { status: 200 });
    } catch (error) {
        console.error("Error updating message:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}