import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Music2, LogOut, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UploadSong from '@/components/UploadSong';
import ManageSongs from '@/components/ManageSongs';
import Analytics from '@/components/Analytics';
import UserManagement from '@/components/UserManagement';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen pattern-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music2 className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">MusiquePeulh</span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded ml-2">Admin</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/player')}
                className="border-primary/30 hover:bg-primary/10"
              >
                <Play className="w-4 h-4 mr-2" />
                Go to Player
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-destructive/30 hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your music library and track analytics</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl">
            <TabsTrigger value="upload">Upload Song</TabsTrigger>
            <TabsTrigger value="manage">Manage Songs</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <UploadSong />
          </TabsContent>
          
          <TabsContent value="manage" className="mt-6">
            <ManageSongs />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
