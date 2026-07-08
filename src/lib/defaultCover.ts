// Generates a branded default album cover (brand gradient + the app logo:
// the lucide Music2 icon + "MusiquePeulh" wordmark) as a PNG data URL, used for
// OS media-session artwork when a song has no cover. Without this, mobile
// lock-screen / notification controls fall back to the site favicon, which
// looks bad. Cached after the first render.

let cached: string | null = null;

// Draws the lucide "music-2" icon (24x24 viewBox) at the given transform.
// Paths: <circle cx="8" cy="18" r="4" /> and <path d="M12 18V2l7 4" />
function drawMusic2Icon(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  color: string,
  lineWidth: number
) {
  ctx.save();
  // The icon's visual center in 24-space is ~ (11.5, 12).
  ctx.translate(centerX - 11.5 * scale, centerY - 12 * scale);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth / scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Note head (outlined circle)
  ctx.beginPath();
  ctx.arc(8, 18, 4, 0, Math.PI * 2);
  ctx.stroke();

  // Stem + flag
  ctx.beginPath();
  ctx.moveTo(12, 18);
  ctx.lineTo(12, 2);
  ctx.lineTo(19, 6);
  ctx.stroke();

  ctx.restore();
}

export function getDefaultCover(): string {
  if (cached) return cached;

  try {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Brand gradient (matches --gradient-hero)
    const bg = ctx.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, "hsl(45, 75%, 55%)");
    bg.addColorStop(1, "hsl(15, 75%, 60%)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Subtle bottom vignette for depth
    const vignette = ctx.createLinearGradient(0, size * 0.45, 0, size);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, size, size);

    const white = "rgba(255,255,255,0.95)";

    // Logo icon (Music2), centered in the upper half
    drawMusic2Icon(ctx, size / 2, 190, 8, white, 15);

    // Wordmark below the icon, auto-fit to the canvas width
    ctx.fillStyle = white;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = "MusiquePeulh";
    let fontSize = 60;
    const maxWidth = size - 72;
    const fontFamily =
      "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    while (ctx.measureText(label).width > maxWidth && fontSize > 12) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
    }
    ctx.fillText(label, size / 2, 380);

    cached = canvas.toDataURL("image/png");
    return cached;
  } catch {
    return "";
  }
}
