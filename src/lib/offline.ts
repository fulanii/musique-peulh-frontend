export type DownloadProgressCallback = (
  completed: number,
  total: number
) => void;

const CACHE_NAME = "musique-offline-v1";

export async function isResourceCached(url: string): Promise<boolean> {
  if (!("caches" in window)) return false;
  const cache = await caches.open(CACHE_NAME);
  const match = await cache.match(url);
  return !!match;
}

export async function downloadSongs(
  urls: string[],
  onProgress?: DownloadProgressCallback
): Promise<void> {
  if (!("caches" in window)) throw new Error("Cache API not available");

  const cache = await caches.open(CACHE_NAME);
  let completed = 0;

  for (const url of urls) {
    try {
      // Fetch resource and put into cache
      const resp = await fetch(url, { mode: "cors" });
      if (resp.ok) {
        await cache.put(url, resp.clone());
      }
    } catch (e) {
      // ignore individual failures but continue
      console.error("Failed to cache", url, e);
    }
    completed += 1;
    onProgress?.(completed, urls.length);
  }
}

export async function getCachedBlobUrl(url: string): Promise<string | null> {
  if (!("caches" in window)) return null;
  const cache = await caches.open(CACHE_NAME);
  const match = await cache.match(url);
  if (!match) return null;
  const blob = await match.blob();
  return URL.createObjectURL(blob);
}

export async function clearOfflineCache(): Promise<void> {
  if (!("caches" in window)) return;
  await caches.delete(CACHE_NAME);
}

export function setOfflineEnabled(enabled: boolean) {
  try {
    localStorage.setItem("offline_enabled", enabled ? "1" : "0");
  } catch {}
}

export function getOfflineEnabled(): boolean {
  try {
    return localStorage.getItem("offline_enabled") === "1";
  } catch {
    return false;
  }
}
