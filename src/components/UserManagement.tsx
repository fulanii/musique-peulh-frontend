import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { User } from "@/lib/api";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current user info from localStorage
  let currentUserId = null;
  let isAdmin = false;
  try {
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
    currentUserId = userData.id;
    isAdmin = userData.is_staff || userData.is_superuser;
  } catch {}

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: number, currentStatus: boolean) => {
    if (!isAdmin) {
      toast.error("Only admins can update user roles");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to ${
          currentStatus ? "remove admin role from" : "promote"
        } this user?`
      )
    ) {
      return;
    }

    try {
      await api.updateUserAdmin(userId, !currentStatus);
      toast.success(
        `User ${currentStatus ? "removed from" : "promoted to"} admin`
      );
      loadUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const deleteUser = async (userId: number) => {
    if (!isAdmin) {
      toast.error("Only admins can delete users");
      return;
    }
    if (userId === currentUserId) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const data = await api.deleteUser(userId);
      if (data && data.success) {
        toast.success("User deleted");
        loadUsers();
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.is_superuser ? (
                    <Badge className="bg-primary">Super Admin</Badge>
                  ) : user.is_staff ? (
                    <Badge variant="secondary">Admin</Badge>
                  ) : (
                    <Badge variant="outline">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isAdmin && user.id !== currentUserId && !user.is_staff && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => toggleAdmin(user.id, user.is_staff)}
                        className="flex items-center gap-2"
                      >
                        <>
                          <Shield className="w-4 h-4" />
                          Make Admin
                        </>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                        className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  {isAdmin && user.id !== currentUserId && user.is_staff && (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled
                        className="flex items-center gap-2 opacity-60 cursor-not-allowed"
                        title="Cannot remove admin role from another admin"
                      >
                        <ShieldOff className="w-4 h-4" />
                        Remove Admin
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="flex items-center gap-2 border-destructive text-destructive opacity-60 cursor-not-allowed"
                        title="Cannot delete another admin"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
