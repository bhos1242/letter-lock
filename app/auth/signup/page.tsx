"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaGoogle } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import InputPassword from "@/components/AppInputFields/components/InputPassword";
import toast from "react-hot-toast";
import { useSignup } from "@/hooks/auth/useSignup";
import { signIn } from "next-auth/react";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
    avatar: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const signupMutation = useSignup();

  const methods = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const result = await signupMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        avatar: avatarFile || undefined,
      });

      toast.success(result.message);
      // Redirect to OTP verification page with email
      router.push(`/auth/verify-otp?email=${encodeURIComponent(result.email)}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to create account";
      toast.error(errorMessage);
    }
  };

  const handleOAuthSignIn = async (provider: "google") => {
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 dark:bg-gray-950">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Avatar (Optional)
                </label>
                <div className="flex items-center gap-4">
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Full Name
                </label>
                <Input
                  {...methods.register("name")}
                  placeholder="John Doe"
                />
                {methods.formState.errors.name && (
                  <p className="text-sm font-medium text-destructive">
                    {methods.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input
                  {...methods.register("email")}
                  placeholder="name@example.com"
                  type="email"
                />
                {methods.formState.errors.email && (
                  <p className="text-sm font-medium text-destructive">
                    {methods.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <InputPassword
                  name="password"
                  label="Password"
                  placeholder="Create a password"
                  description="Must contain 8+ chars, uppercase, number, special char"
                  type="password"
                />
              </div>

              <div className="space-y-2">
                <InputPassword
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  type="password"
                />
              </div>

              <Button
                className="w-full mt-4"
                type="submit"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={signupMutation.isPending}
                >
                  <FaGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
