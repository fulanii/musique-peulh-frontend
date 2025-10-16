import { useState, useEffect } from "react";
import { Music2, MoreHorizontal, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { api, Song } from "@/lib/api";

const ManageSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const data = await api.getSongs();
      setSongs(data);
    } catch (error) {
      toast.error("Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
                <tr
                  key={song.id}
                  className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                >
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
                  <td className="py-3 text-muted-foreground">
                    {song.artist_name}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {song.duration}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatDate(song.upload_date)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditSong(song);
                              setEditTitle(song.title);
                              setEditArtist(song.artist_name);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Edit className="w-4 h-4" /> Edit
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit dialog - no network call yet */}
      <Dialog
        open={!!editSong}
        onOpenChange={(open) => {
          if (!open) setEditSong(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Song</DialogTitle>
            <DialogDescription>
              Update title and artist. (No backend call yet)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 mt-4">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <label className="text-sm font-medium">Artist</label>
            <Input
              value={editArtist}
              onChange={(e) => setEditArtist(e.target.value)}
            />
          </div>

          <DialogFooter>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setEditSong(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: send update to server when endpoint is ready
                  // payload: { id: editSong?.id, title: editTitle, artist_name: editArtist }
                  setEditSong(null);
                  toast.success(
                    "Saved (locally) — implement API call on backend"
                  );
                  loadSongs();
                }}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ManageSongs;
