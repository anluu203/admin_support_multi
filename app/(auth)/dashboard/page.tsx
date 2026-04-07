"use client";

import { Card, Text } from "@/app/components";
import { useEffect, useState } from "react";

/**
 * User info from localStorage
 */
interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
}

/**
 * DashboardPage - Main dashboard content
 * 
 * Protected by ProtectedAuthLayout in (auth)/layout.tsx
 * Auth checking and logout handling is done in layout
 */
export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const userStr = localStorage.getItem("user");
    
    if (userStr) {
      try {
        setUser(JSON.parse(userStr) as User);
      } catch {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      {user && (
        <div>
          <Text>
            Chào mừng trở lại, <span className="font-semibold text-primary">{user.fullName}</span>!
          </Text>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card padding="lg">
          <Text size="sm" color="muted" className="mb-2">
            Created Tickets
          </Text>
          <Text size="2xl" weight="bold">
            24,208
          </Text>
          <Text size="xs" color="muted">
            -5% from last month
          </Text>
        </Card>

        <Card padding="lg">
          <Text size="sm" color="muted" className="mb-2">
            Unsolved Tickets
          </Text>
          <Text size="2xl" weight="bold">
            4,564
          </Text>
          <Text size="xs" color="muted">
            +2% from last month
          </Text>
        </Card>

        <Card padding="lg">
          <Text size="sm" color="muted" className="mb-2">
            Resolved Tickets
          </Text>
          <Text size="2xl" weight="bold">
            18,208
          </Text>
          <Text size="xs" color="muted">
            +8% from last month
          </Text>
        </Card>

        <Card padding="lg">
          <Text size="sm" color="muted" className="mb-2">
            Avg First Reply Time
          </Text>
          <Text size="2xl" weight="bold">
            12:01 min
          </Text>
          <Text size="xs" color="muted">
            +8% from last month
          </Text>
        </Card>
      </div>

      {/* User Info Card */}
      <Card padding="lg">
        <Text weight="bold" className="mb-4">
          Account Information
        </Text>
        {user ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Text size="sm" color="muted" className="mb-1">
                Full Name
              </Text>
              <Text weight="bold">{user.fullName}</Text>
            </div>
            <div>
              <Text size="sm" color="muted" className="mb-1">
                Email
              </Text>
              <Text weight="bold">{user.email}</Text>
            </div>
            <div>
              <Text size="sm" color="muted" className="mb-1">
                Username
              </Text>
              <Text weight="bold">{user.username}</Text>
            </div>
            <div>
              <Text size="sm" color="muted" className="mb-1">
                User ID
              </Text>
              <Text weight="bold" className="text-xs font-mono">
                {user.id}
              </Text>
            </div>
          </div>
        ) : (
          <Text color="muted" size="sm">Loading user information...</Text>
        )}
      </Card>

      {/* Features Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            📊 Analytics
          </Text>
          <Text size="sm" color="muted">
            View reports and statistics
          </Text>
        </Card>

        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            💬 Messaging
          </Text>
          <Text size="sm" color="muted">
            Manage customer conversations
          </Text>
        </Card>

        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            ⚙️ Settings
          </Text>
          <Text size="sm" color="muted">
            Configure system preferences
          </Text>
        </Card>
      </div>

            <div className="grid gap-4 md:grid-cols-3">
        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            📊 Analytics
          </Text>
          <Text size="sm" color="muted">
            View reports and statistics
          </Text>
        </Card>

        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            💬 Messaging
          </Text>
          <Text size="sm" color="muted">
            Manage customer conversations
          </Text>
        </Card>

        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            ⚙️ Settings
          </Text>
          <Text size="sm" color="muted">
            Configure system preferences
          </Text>
        </Card>
      </div>      <div className="grid gap-4 md:grid-cols-3">
        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            📊 Analytics
          </Text>
          <Text size="sm" color="muted">
            View reports and statistics
          </Text>
        </Card>

        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            💬 Messaging
          </Text>
          <Text size="sm" color="muted">
            Manage customer conversations
          </Text>
        </Card>

        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            ⚙️ Settings
          </Text>
          <Text size="sm" color="muted">
            Configure system preferences
          </Text>
        </Card>
      </div>      <div className="grid gap-4 md:grid-cols-3">
        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            📊 Analytics
          </Text>
          <Text size="sm" color="muted">
            View reports and statistics
          </Text>
        </Card>

        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            💬 Messaging
          </Text>
          <Text size="sm" color="muted">
            Manage customer conversations
          </Text>
        </Card>

        <Card padding="lg">
          <Text weight="bold" className="mb-2">
            ⚙️ Settings
          </Text>
          <Text size="sm" color="muted">
            Configure system preferences
          </Text>
        </Card>
      </div>
    </div>
  );
}
