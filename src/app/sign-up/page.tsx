"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Account created! Redirecting to sign in...");
        router.push("/sign-in"); 
      } else {
        toast.error(data.error || "Signup failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-md">
        <div className="h-2 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="mx-auto bg-violet-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-2">
            <UserPlus className="text-violet-600 w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Join Epic Events</CardTitle>
          <p className="text-slate-500 text-sm">Create an account to start booking</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              placeholder="Full Name" 
              required 
              className="rounded-xl h-12"
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
            <Input 
              type="email" 
              placeholder="Email address" 
              required 
              className="rounded-xl h-12"
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
            />
            <Input 
              type="password" 
              placeholder="Create a password" 
              required 
              className="rounded-xl h-12"
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-violet-600 font-bold hover:underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
