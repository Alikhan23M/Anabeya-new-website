"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from 'next-auth/react';
export default function AdminNotification() {
    const { data: session } = useSession();
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        if (!session) return; // not logged in yet

        // Check if this user is admin
        const isAdmin = session?.user?.isAdmin || false;
        console.log("Is Admin:", isAdmin);
        console.log("Session:", session);
        // Check if dismissed in this tab
        const dismissed = sessionStorage.getItem("dismiss-admin-prompt");

        if (isAdmin && !dismissed) {
            setShowPrompt(true);
        }
    }, [session]);

    const dismissPrompt = () => {
        sessionStorage.setItem("dismiss-admin-prompt", "true");
        setShowPrompt(false);
    };
    return (
        <>
         {/* Admin notfication for visiting admin panel */}
              {showPrompt && (
                <div className="fixed top-5 m-4 md:m-0 md:right-5 z-50 bg-white shadow-lg border border-gray-200 rounded-lg p-4 max-w-sm">
                  <p className="text-gray-800 font-medium mb-3">
                    You’re logged in as an admin. Do you want to visit the Admin Panel?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={dismissPrompt}
                      className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                    >
                      Dismiss
                    </button>
                    <Link
                      href="/admin"
                      className="px-3 py-1 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Yes
                    </Link>
                  </div>
                </div>
              )}
              
              </>
    );
}