import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email && localStorage.getItem("password_reset_email")) {
      setEmail(localStorage.getItem("password_reset_email") || "");
    }
  }, []);

  useEffect(() => {
    if (email) localStorage.setItem("password_reset_email", email);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !password || !confirm)
      return toast.error("Please fill all fields");
    if (password !== confirm) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await api.resetPassword(email, parseInt(code, 10), password);
      if (res.message) {
        toast.success(res.message);
        localStorage.removeItem("password_reset_email");
        navigate("/login");
      } else {
        toast.error(res.error || "Failed to reset password");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pattern-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter the code we sent to your email and choose a new password
          </p>
        </div>

        <div className="card-gradient p-8 rounded-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full hero-gradient text-primary-foreground hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
