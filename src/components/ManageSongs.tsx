import { useState, useEffect } from 'react';
import { Music2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { api, Song } from '@/lib/api';

const ManageSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const data = await api.getSongs();
      setSongs(data);
    } catch (error) {
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="p-6 card-gradient border-border">
      <h2 className="text-xl font-semibold mb-4">All Songs</h2>
      
      {loading ? (
        <p className="text-muted-foreground">Loading songs...</p>
      ) : songs.length === 0 ? (
        <div className="text-center py-8">
          <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No songs uploaded yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Artist</th>
                <th className="pb-3 font-semibold">Duration</th>
                <th className="pb-3 font-semibold">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {song.cover_image ? (
                        <img 
                          src={song.cover_image} 
                          alt={song.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          <Music2 className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <span className="font-medium">{song.title}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{song.artist_name}</td>
                  <td className="py-3 text-muted-foreground">{song.duration}</td>
                  <td className="py-3 text-muted-foreground">{formatDate(song.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default ManageSongs;
