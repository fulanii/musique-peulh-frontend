import { useState } from "react";
import { Pause, MoreVertical, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { api, Playlist, Song } from "@/lib/api";

interface SongRowProps {
  song: Song;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
  // When rendered inside a playlist, enables "Remove From Playlist".
  playlistId?: number;
  onRemoved?: () => void;
}

const SongRow = ({
  song,
  isActive,
  isPlaying,
  onClick,
  playlistId,
  onRemoved,
}: SongRowProps) => {
  const rowPlaying = isActive && isPlaying;

  // Only fetch the playlist list once the row's menu is opened (and reuse the
  // shared cache if the Player page already loaded it). Avoids fetching
  // playlists just because a page full of song rows rendered.
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => api.getPlaylists(),
    enabled: menuOpen,
    staleTime: 5 * 60 * 1000,
  });

  const handleAddToPlaylist = async (playlist: Playlist) => {
    try {
      await api.addSongToPlaylist(playlist.id, song.id);
      toast.success(`Added to ${playlist.playlist_name}`);
    } catch (error) {
      if (!(error as any)?.isRateLimit)
        toast.error(
          error instanceof Error ? error.message : "Failed to add to playlist"
        );
    }
  };

  const handleRemoveFromPlaylist = async () => {
    if (playlistId == null) return;
    try {
      await api.removeSongFromPlaylist(playlistId, song.id);
      toast.success("Removed from playlist");
      onRemoved?.();
    } catch (error) {
      if (!(error as any)?.isRateLimit)
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to remove from playlist"
        );
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 cursor-pointer border-b border-border/50 last:border-0 transition-colors ${
        isActive ? "bg-primary/10" : "hover:bg-muted/60"
      }`}
    >
      {/* Title + artist stacked */}
      <div className="flex-1 min-w-0">
        <p
          className={`flex items-center gap-1.5 truncate text-sm font-medium ${
            isActive ? "text-primary" : "text-foreground"
          }`}
        >
          {rowPlaying && <Pause className="w-3.5 h-3.5 flex-shrink-0" />}
          <span className="truncate">{song.title}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {song.artist_name}
        </p>
      </div>

      {/* Duration - far right */}
      <span className="text-sm text-muted-foreground tabular-nums flex-shrink-0">
        {song.duration || "—"}
      </span>

      {/* Options menu */}
      <DropdownMenu onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label="Song options"
            className="flex items-center justify-center w-8 h-8 -mr-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Plus className="w-4 h-4 mr-2" />
              Add To Playlist
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className="max-h-64 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {playlists.length === 0 ? (
                <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>
              ) : (
                playlists.map((playlist) => (
                  <DropdownMenuItem
                    key={playlist.id}
                    className="capitalize"
                    onClick={() => handleAddToPlaylist(playlist)}
                  >
                    {playlist.playlist_name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Only shown inside a playlist */}
          {playlistId != null && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleRemoveFromPlaylist}
            >
              Remove From Playlist
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SongRow;
