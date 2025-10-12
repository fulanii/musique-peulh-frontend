import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await login(formData.emailOrUsername, formData.password);
      // After login, check if user is verified (user_data stored by api.login)
      const userDataString = localStorage.getItem("user_data");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      if (userData && userData.is_verified === false) {
        toast(
          "Your email is not verified. Please enter the code sent to your email."
        );
        navigate("/verify-email", { state: { email: userData.email } });
      } else {
        toast.success("Welcome back!");
        navigate("/player");
      }
    } catch (error) {
      let msg = "Login failed";
      if (error instanceof Error) {
        if (error.message.includes("No active account found")) {
          msg = "Account does not exist or is inactive.";
        } else if (error.message.toLowerCase().includes("password")) {
          msg = "Incorrect password.";
        } else if (error.message.toLowerCase().includes("verify")) {
          msg = "Your account is not verified. Please check your email.";
        } else {
          msg = error.message;
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pattern-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Music2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">
              MusiquePeulh
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue listening</p>
        </div>

        <div className="card-gradient p-8 rounded-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">Email or Username</Label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="you@example.com or username"
                value={formData.emailOrUsername}
                onChange={(e) =>
                  setFormData({ ...formData, emailOrUsername: e.target.value })
                }
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="bg-background/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full hero-gradient text-primary-foreground hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
