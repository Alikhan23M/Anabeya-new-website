import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/authOptions"; // ✅ same authOptions as other routes
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST() {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // Clear the user's cart in DB
    await User.findByIdAndUpdate(session.user.id, { cart: [] });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
