import { Play, Pause, Music2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Song } from '@/lib/api';

interface SongCardProps {
  song: Song;
  onPlay: () => void;
  isPlaying: boolean;
}

const SongCard = ({ song, onPlay, isPlaying }: SongCardProps) => {
  return (
    <Card className="group overflow-hidden card-gradient border-border hover:border-primary/50 transition-all duration-300">
      <div className="relative aspect-square">
        {song.cover_image ? (
          <img 
            src={song.cover_image} 
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Music2 className="w-20 h-20 text-primary/50" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={onPlay}
            size="lg"
            className="rounded-full w-16 h-16 hero-gradient text-primary-foreground hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate mb-1">{song.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{song.artist_name}</p>
        <p className="text-xs text-muted-foreground mt-1">{song.duration}</p>
      </div>
    </Card>
  );
};

export default SongCard;
