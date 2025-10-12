import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: emailFromState,
    code: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.code) {
      toast.error("Please enter both email and verification code");
      return;
    }

    setLoading(true);
    try {
      await api.verifyEmail({
        email: formData.email,
        code: parseInt(formData.code),
      });

      toast.success("Email verified successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
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
          <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="card-gradient p-8 rounded-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
                maxLength={6}
                className="bg-background/50 text-center text-2xl tracking-widest"
              />
            </div>

            <Button
              type="submit"
              className="w-full hero-gradient text-primary-foreground hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Didn't receive the code?{" "}
            </span>
            <button
              className="text-primary hover:underline font-medium"
              onClick={async () => {
                try {
                  const email = formData.email;
                  if (!email) {
                    toast.error("Please enter your email to resend code");
                    return;
                  }
                  const res = await api.resendVerification(email);
                  toast.success(res.detail || "Verification code resent");
                } catch (err) {
                  toast.error("Failed to resend verification code");
                }
              }}
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
