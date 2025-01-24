import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authApi } from "~/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { mutate: login, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      sessionStorage.setItem("accessToken", data.token);
      sessionStorage.setItem("refreshToken", data.refreshToken);
      await router.push("/dashboard");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <>
      <main className="flex min-h-screen">
        {/* Left side - Image */}
        <div className="hidden lg:block lg:w-1/2">
          <Image
            src="/images/login-image.png" // Add your image here
            alt="Login"
            className="h-screen w-full object-cover"
            width={1920}
            height={1080}
          />
        </div>

        {/* Right side - Login form */}
        <div className="flex w-full items-center justify-center px-8 lg:w-1/2">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="mt-6 text-3xl font-bold text-[#E5CD82]">Login</h2>
              <p className="mt-2 text-sm text-gray-300">
                Please sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                  <Input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Email address"
                    className="bg-[#282B37] p-4 placeholder:text-white"
                    disabled={isPending}
                  />
                  <Input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Password"
                    className="bg-[#282B37] p-4 placeholder:text-white"
                    disabled={isPending}
                  />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  "Logging in..."
                ) : (
                  <>
                    Login <ArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500">Or continue with</span>
              </div>

              <div className="mt-6 flex justify-center gap-6">
                <button className="inline-flex justify-center rounded-full border border-gray-300 bg-white p-3 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-200">
                  <Image
                    className="h-4 w-4"
                    src="/images/google.png"
                    alt="Google"
                    width={24}
                    height={24}
                  />
                </button>
                <button className="inline-flex justify-center rounded-full border border-gray-300 bg-white p-3 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-200">
                  <Image
                    className="h-4 w-4"
                    src="/images/apple.png"
                    alt="Apple"
                    width={24}
                    height={24}
                  />
                </button>
                <button className="inline-flex justify-center rounded-full border border-gray-300 bg-white p-3 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50">
                  <Image
                    className="h-4 w-4"
                    src="/images/facebook.png"
                    alt="Facebook"
                    width={24}
                    height={24}
                  />
                </button>
              </div>

              <p className="mt-8 text-center text-xs">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline hover:opacity-70">
                  <span className="text-[#F0D687] underline hover:opacity-70">
                    Create one
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
