import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";

const ResetRequest = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      const res = await api.requestPasswordReset(email);
      // backend returns message even if email not found
      toast.success(
        res.message || "If this email exists, a reset code has been sent"
      );
      navigate("/reset-password", { state: { email } });
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
            Enter your email to receive a reset code
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

            <Button
              type="submit"
              className="w-full hero-gradient text-primary-foreground hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset code"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetRequest;
