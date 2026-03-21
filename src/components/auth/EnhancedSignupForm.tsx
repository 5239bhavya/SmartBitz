import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

export function EnhancedSignupForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    businessStage: "",
    location: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const initializeUserProfile = async (userId: string) => {
    // 2. Update extended profile (row created by trigger)
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        phone: formData.phone,
        business_stage: formData.businessStage,
        location: formData.location,
      })
      .eq('user_id', userId);

    if (profileError) console.error("Profile update error:", profileError);

    // 3. Initialize user progress
    const { error: progressError } = await supabase
      .from("user_progress")
      .upsert({ user_id: userId }, { onConflict: 'user_id' });

    if (progressError) console.error("Progress insert error:", progressError);

    // 4. Initialize user points
    const { error: pointsError } = await supabase
      .from("user_points")
      .upsert({ user_id: userId, total_points: 0 }, { onConflict: 'user_id' });

    if (pointsError) console.error("Points insert error:", pointsError);

    // 5. Award points via RPC
    const { error: rpcError } = await supabase.rpc("award_points", {
      p_user_id: userId,
      p_activity_type: "profile_complete",
      p_points: 10,
      p_description: "Completed profile setup",
    });

    if (rpcError) console.error("Error awarding points:", rpcError);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            business_stage: formData.businessStage,
            location: formData.location,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        if (authData.session) {
          // email confirmation is disabled in Supabase, user is immediately logged in
          await initializeUserProfile(authData.user.id);
          toast.success("Account created successfully!");
          navigate("/profile");
        } else {
          // email confirmation is required
          toast.success("OTP sent successfully. Please check your email!");
          setStep("otp");
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: "signup"
      });

      if (error) throw error;

      if (data.session && data.user) {
        await initializeUserProfile(data.user.id);
        toast.success("Email verified and account created successfully!");
        navigate("/profile");
      }
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error(error.message || "Invalid OTP code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass shadow-2xl border-primary/10 animate-scale-in">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" />
          Create Your Account
        </CardTitle>
        <CardDescription className="text-base">
          Join StartupDesk and start building your business today
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "otp" ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2 text-center pb-4">
              <Label htmlFor="otp" className="text-base">Enter the 8-digit verification code</Label>
              <Input
                id="otp"
                placeholder="12345678"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={8}
                className="text-center text-2xl tracking-widest py-6"
              />
              <p className="text-sm text-muted-foreground mt-2">
                We sent a secure code to <strong>{formData.email}</strong>. Please check your spam folder if you don't see it.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || otp.length < 8}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                "Verify & Create Account"
              )}
            </Button>
            
            <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setStep("form")}
                disabled={isLoading}
            >
              Back to Sign Up
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              {/* Business Stage */}
              <div className="space-y-2">
                <Label htmlFor="businessStage">Business Stage *</Label>
                <Select
                  value={formData.businessStage}
                  onValueChange={(value) => handleChange("businessStage", value)}
                  required
                >
                  <SelectTrigger id="businessStage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Idea">Idea</SelectItem>
                    <SelectItem value="Startup">Startup</SelectItem>
                    <SelectItem value="Growing">Growing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Mumbai, Maharashtra"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="bg-background/50 focus:bg-background transition-colors"
                  required
                />
              </div>

            </div>

            <Button type="submit" className="w-full mt-4 shadow-md hover:shadow-lg" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account & Send OTP
                </>
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => navigate("/auth")}
              >
                Sign in
              </Button>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
