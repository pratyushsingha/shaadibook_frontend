import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import useAuth from "../../store/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "../../hooks/use-toast";

const signupSchema = z.object({
  studioName: z
    .string()
    .min(2, { message: "Studio name must be at least 2 characters" }),
  username: z
    .string()
    .min(2, { message: "User name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Enter a valid phone number" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

const SignupForm = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const { signup, loading, error } = useAuth();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      studioName: "",
      username: "",
      phone: "",
      email: "",
      password: "",
      address: "",
      name: "",
    },
  });

  const onSubmit = async (data) => {
    const result = await signup({
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      studioName: data.studioName,
      phoneNo: data.phone,
      address: data.address,
      role: "STUDIO_ADMIN",
    });
    console.log(result);
    if (result) {
      toast({
        title: "Registration Successful",
        message: "Please login to continue",
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="studioName"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Studio Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter studio name" {...field} />
                    </FormControl>
                    {error ? (
                      <FormMessage>{error.studioName}</FormMessage>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter studio name" {...field} />
                    </FormControl>
                    {error ? (
                      <FormMessage>{error.name}</FormMessage>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>User Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter user name" {...field} />
                    </FormControl>
                    {error ? (
                      <FormMessage>{error.username}</FormMessage>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    {error ? (
                      <FormMessage>{error.phoneNo}</FormMessage>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="test@gmail.com" {...field} />
                    </FormControl>
                    {error ? (
                      <FormMessage>{error.email}</FormMessage>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    {error ? (
                      <FormMessage>{error.password}</FormMessage>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your address"
                        {...field}
                        rows={3}
                        className="resize-none"
                      />
                    </FormControl>
                    {error ? (
                      <FormMessage>{error.address}</FormMessage>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 space-x-3"
                disabled={loading}
              >
                {loading && <Loader2 className="animate-spin" />}
                Sign Up
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
            Have an Account?{" "}
            <Link
              href="/login"
              className="text-purple-600 hover:text-purple-700"
            >
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
