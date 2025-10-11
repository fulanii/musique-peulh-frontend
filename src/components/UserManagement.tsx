import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface User {
  id: number;
  email: string;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: number, currentStatus: boolean) => {
    try {
      await api.updateUserAdmin(userId, !currentStatus);
      toast.success(`User ${currentStatus ? 'removed from' : 'promoted to'} admin`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
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
              <TableHead>Joined</TableHead>
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
                <TableCell>{new Date(user.date_joined).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant={user.is_staff ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleAdmin(user.id, user.is_staff)}
                    className="flex items-center gap-2"
                  >
                    {user.is_staff ? (
                      <>
                        <ShieldOff className="w-4 h-4" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Make Admin
                      </>
                    )}
                  </Button>
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
