import { Play, Pause, Music2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Song } from "@/lib/api";
import { memo } from "react";

interface SongCardProps {
  song: Song;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  isActive?: boolean;
}

const SongCard = ({
  song,
  onPlay,
  onPause,
  isPlaying,
  isActive = false,
}: SongCardProps) => {
  return (
    // Default: desktop/large card on >=656px. For screens <=655px, show a spotify-like list row (small square cover left, text right)
    <Card
      className={`group overflow-hidden card-gradient transition-all duration-300 flex items-center h-[150px] w-[300px] max-[655px]:flex-row max-[655px]:w-full max-[655px]:h-[76px] max-[655px]:px-3 ${
        isActive
          ? "border-2 border-primary/60 shadow-lg"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="relative flex-shrink-0 flex items-center justify-center">
        {song.cover_image ? (
          <img
            src={song.cover_image}
            alt={song.title}
            loading="lazy"
            decoding="async"
            width={150}
            height={150}
            className="object-cover h-[150px] w-[150px] rounded-md max-[655px]:h-16 max-[655px]:w-16 max-[655px]:rounded-md"
          />
        ) : (
          <div className="w-[150px] h-[150px] rounded-md bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center max-[655px]:w-16 max-[655px]:h-16">
            <Music2 className="w-12 h-12 text-primary/50" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={isPlaying ? onPause : onPlay}
            size="lg"
            className="rounded-full w-14 h-14 hero-gradient text-primary-foreground hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 flex-1 min-w-0 max-[655px]:pl-4 max-[655px]:py-0 max-[655px]:flex max-[655px]:flex-col max-[655px]:justify-center">
        <h3 className="font-semibold text-lg mb-1 truncate max-[655px]:text-base">
          {song.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate max-[655px]:text-sm">
          {song.artist_name}
        </p>
      </div>
    </Card>
  );
};

export default memo(SongCard);
