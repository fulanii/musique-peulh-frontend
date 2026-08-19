import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

// Shuffle is a persistent mode rather than a one-off action, so its "on" state
// has to read at a glance: a tinted pill, a ring and a dot, not just a colour
// shift on a ghost icon.
const ShuffleToggle = ({ className }: { className?: string }) => {
  const { shuffle, setShuffle } = useMusicPlayer();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setShuffle(!shuffle)}
      aria-pressed={shuffle}
      aria-label={shuffle ? "Shuffle on" : "Shuffle off"}
      title={shuffle ? "Shuffle on" : "Shuffle off"}
      className={cn(
        "relative rounded-full transition-colors",
        shuffle
          ? "text-primary bg-primary/15 ring-1 ring-primary/40 hover:bg-primary/20 hover:text-primary"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Shuffle className="w-5 h-5" />
      {shuffle && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </Button>
  );
};

export default ShuffleToggle;
