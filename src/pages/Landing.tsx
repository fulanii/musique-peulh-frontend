import { Link } from 'react-router-dom';
import { Music2, Play, Users, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen pattern-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        <div className="container relative z-10 px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
              <Music2 className="w-4 h-4" />
              <span className="text-sm font-medium">Authentic West African Music</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-gradient">Discover Fulani Music</span>
              <br />
              <span className="text-foreground">From Across West Africa</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the rich cultural heritage of Fulani music. Stream authentic rhythms, discover talented artists, and connect with West African musical traditions.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button asChild size="lg" className="hero-gradient text-primary-foreground hover:opacity-90 transition-opacity">
                <Link to="/register">
                  Get Started Free
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why MusiquePeulh?</h2>
            <p className="text-muted-foreground">Connecting you to the heart of Fulani culture</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-gradient p-8 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stream Anywhere</h3>
              <p className="text-muted-foreground">Access your favorite Fulani tracks anytime, anywhere with our seamless streaming platform.</p>
            </div>
            
            <div className="card-gradient p-8 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Artists</h3>
              <p className="text-muted-foreground">Explore talented Fulani musicians and discover new voices from across West Africa.</p>
            </div>
            
            <div className="card-gradient p-8 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cultural Heritage</h3>
              <p className="text-muted-foreground">Immerse yourself in the rich musical traditions and stories of the Fulani people.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="card-gradient p-12 rounded-2xl border border-primary/20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Listening?</h2>
            <p className="text-muted-foreground mb-8">Join MusiquePeulh today and experience authentic West African music.</p>
            <Button asChild size="lg" className="hero-gradient text-primary-foreground hover:opacity-90">
              <Link to="/register">
                Create Your Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
