import { useState, useEffect } from 'react';
import { Music2, Users, Database, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

const Analytics = () => {
  const [totalSongs, setTotalSongs] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const songs = await api.getSongs();
      setTotalSongs(songs.length);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const stats = [
    {
      title: 'Total Songs',
      value: totalSongs,
      icon: Music2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Users',
      value: '-',
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Storage Used',
      value: '-',
      icon: Database,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Plays',
      value: '-',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 card-gradient border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 card-gradient border-border">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <p className="text-muted-foreground text-center py-8">
            Analytics features coming soon...
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
