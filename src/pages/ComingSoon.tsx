import { Music2, Clock, Headphones, Bell } from "lucide-react";

const ComingSoon = () => {
  return (
    <div className="min-h-screen pattern-bg flex flex-col items-center justify-center relative overflow-hidden px-4 py-16">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full mx-auto text-center space-y-10">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Music2 className="w-8 h-8 text-primary" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            MusiquePeulh
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Under Construction</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-gradient">Something Beautiful</span>
            <br />
            <span className="text-foreground">Is Coming</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            We're crafting an immersive home for authentic Fulani music. The
            rhythms of West Africa will be with you soon.
          </p>
        </div>

        {/* Features teaser */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            {
              icon: <Music2 className="w-5 h-5 text-primary" />,
              title: "Authentic Streams",
              desc: "Curated Fulani tracks from across West Africa.",
            },
            {
              icon: <Headphones className="w-5 h-5 text-secondary" />,
              title: "Cultural Heritage",
              desc: "Music rooted in tradition, brought to the world.",
            },
            {
              icon: <Bell className="w-5 h-5 text-accent" />,
              title: "Artist Discovery",
              desc: "Explore emerging and legendary Fulani voices.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="card-gradient border border-border rounded-xl p-5 hover:border-primary/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-3">
                {icon}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MusiquePeulh &mdash; Authentic West
          African Music
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
