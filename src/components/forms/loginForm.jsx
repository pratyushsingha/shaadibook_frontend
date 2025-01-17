"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import useAuth from "../../store/useAuth";
import { useToast } from "../../hooks/use-toast";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

const LoginForm = () => {
  const { toast } = useToast();
  const [showPassword, setShowpassword] = useState(false);
  const { login, error, loading, user, isAuthenticated } = useAuth();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isAuthenticated === true) {
      toast({
        title: `welcome ${user}`,
      });
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1500);
    }
    if (error && typeof error === "object") {
      Object.entries(error).map(([key, value]) =>
        toast({
          variant: "destructive",
          title: value,
        })
      );
    } else if (error) {
      toast({
        variant: "destructive",
        title: error,
      });
    }
  }, [isAuthenticated, error]);

  const onSubmit = async (data) => {
    await login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
  };
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-semibold text-center">Hello Again!</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-3">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="test@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-3">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? "password" : "text"}
                        placeholder="Pass@2004"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Remember me</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Recovery Password
                </Link>
              </div>
              <Button
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Login"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                OR
              </span>
            </div>
          </div>
          <div className="text-center text-sm">
            Don't have an Account?{" "}
            <Link
              href="/signup"
              className="text-purple-600 hover:text-purple-700"
            >
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
