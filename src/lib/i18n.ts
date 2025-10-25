type Lang = "en" | "fr" | string;

const translations: Record<string, Record<string, string>> = {
  en: {
    songs_available: "{count} {plural}",
    song_singular: "song",
    song_plural: "songs",
    loading_songs: "Loading songs...",
    no_songs: "No songs yet",
    offline_mode: "Offline mode",
    downloading_offline: "Downloading songs for offline use...",
    offline_ready: "Offline songs ready",
    download_error: "Failed to download some songs for offline",
    shuffle_on: "Shuffle On",
    shuffle_off: "Shuffle Off",
  },
  fr: {
    songs_available: "{count} {plural}",
    song_singular: "chanson",
    song_plural: "chansons",
    loading_songs: "Chargement des chansons...",
    no_songs: "Pas encore de chansons",
    offline_mode: "Mode hors ligne",
    downloading_offline:
      "Téléchargement des chansons pour utilisation hors ligne...",
    offline_ready: "Chansons hors ligne prêtes",
    download_error:
      "Échec du téléchargement de certaines chansons pour l'utilisation hors ligne",
    shuffle_on: "Lecture aléatoire activée",
    shuffle_off: "Lecture aléatoire désactivée",
  },
};

let currentLang: Lang = "en";

export function detectLanguage() {
  try {
    const nav = navigator.language || (navigator as any).userLanguage;
    if (!nav) return "en";
    const lang = nav.split("-")[0];
    return lang;
  } catch {
    return "en";
  }
}

export function setLanguage(lang: Lang) {
  currentLang = lang;
}

export function t(key: string, vars?: Record<string, string | number>) {
  const lang = translations[currentLang] ? currentLang : "en";
  const dict = translations[lang] || translations["en"];
  let text = dict[key] || translations["en"][key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`{${k}}`, "g"), String(v));
    }
  }
  return text;
}

export function initI18n() {
  const lang = detectLanguage();
  setLanguage(translations[lang] ? lang : "en");
}

export type { Lang };
