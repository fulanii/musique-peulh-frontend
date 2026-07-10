import { useState } from "react";
import { Youtube, Download, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api, YoutubeData } from "@/lib/api";

const YoutubeUpload = () => {
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<YoutubeData | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setFetching(true);
    try {
      const result = await api.getYoutubeData(trimmed);
      setData(result);
      setTitle(result.title ?? "");
      setArtist(result.channel ?? "");
    } catch (error) {
      if (!(error as any)?.isRateLimit)
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch video details"
        );
    } finally {
      setFetching(false);
    }
  };

  const handleDownload = async () => {
    const t = title.trim();
    const a = artist.trim();
    if (!t || !a) {
      toast.error("Title and artist are required");
      return;
    }

    setDownloading(true);
    try {
      const res = await api.downloadFromYoutube(url.trim(), t, a);
      toast.success(
        res.detail || "Processing — the song will appear once uploaded."
      );
      // Reset the form; the upload finishes in the background.
      setUrl("");
      setData(null);
      setTitle("");
      setArtist("");
    } catch (error) {
      if (!(error as any)?.isRateLimit)
        toast.error(
          error instanceof Error ? error.message : "Failed to start download"
        );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="p-6 card-gradient border-border">
      <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
        <Youtube className="w-5 h-5 text-primary" />
        YouTube Upload
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Paste a YouTube link to fetch the video details, then upload it as a
        song.
      </p>

      {/* URL fetch row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleFetch();
          }}
          className="bg-background/50 flex-1"
        />
        <Button
          onClick={handleFetch}
          disabled={fetching || !url.trim()}
          className="hero-gradient text-primary-foreground hover:opacity-90"
        >
          {fetching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fetching...
            </>
          ) : (
            "Fetch"
          )}
        </Button>
      </div>

      {/* Metadata preview + song details */}
      {data && (
        <div className="mt-6 space-y-6">
          {/* Video preview */}
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="max-w-2xl mx-auto">
              {data.thumbnail ? (
                <img
                  src={data.thumbnail}
                  alt={data.title ?? "Video thumbnail"}
                  className="w-full aspect-video object-cover rounded-md"
                />
              ) : (
                <div className="w-full aspect-video rounded-md bg-primary/10 flex items-center justify-center">
                  <Youtube className="w-14 h-14 text-primary" />
                </div>
              )}
              <div className="min-w-0 mt-4">
                <p className="text-lg font-semibold break-words line-clamp-3">
                  {data.title ?? "Untitled"}
                </p>
                <p className="text-sm text-muted-foreground mt-1.5 truncate">
                  {data.channel ?? "Unknown channel"}
                </p>
                {data.duration_string && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.duration_string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Song details form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yt_title">Title</Label>
              <Input
                id="yt_title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yt_artist">Artist name</Label>
              <Input
                id="yt_artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <Button
              onClick={handleDownload}
              disabled={downloading || !title.trim() || !artist.trim()}
              className="w-full hero-gradient text-primary-foreground hover:opacity-90"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download &amp; Upload
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default YoutubeUpload;
