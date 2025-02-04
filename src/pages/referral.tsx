import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Copy, Facebook, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { authApi, referralApi } from "~/lib/api";

export default function Referral() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getUserProfile(type),
  });

  const { data: referral } = useQuery({
    queryKey: ["referral"],
    queryFn: () => referralApi.getReferralList(email ?? ""),
  });

  useEffect(() => {
    const userType = sessionStorage.getItem("type");

    if (userType) setType(userType);
  }, []);

  useEffect(() => {
    if (profile) {
      console.log(profile);

      setName(profile.name ?? "");
      setEmail(sessionStorage.getItem("email") ?? "");
    }
  }, [profile]);

  return (
    <>
      <div className="relative">
        <div className="absolute -top-1/2 left-1/2 h-[800px] min-h-screen md:w-[1000px] w-[200px] -translate-x-1/2 transform rounded-full bg-white/5 blur-[128px]" />

        <main className="relative mx-4 md:mx-48 flex flex-col md:flex-row md:justify-between">
          <div className="mt-12 md:mt-48 flex w-full md:w-1/2 flex-col items-center md:items-start">
            <div className="flex flex-col items-center">
              <Image
                src="/logo/imvestor.png"
                alt="Imvestor"
                width={48}
                height={48}
              />
              <h3 className="mt-2 text-xl font-bold">Im-Vestor</h3>
            </div>
            <h1 className="mt-8 text-center md:text-left bg-gradient-to-r from-[#BFBFC2] via-[#FDFDFD] to-[#BFBFC2] bg-clip-text text-3xl md:text-4xl font-medium tracking-wide text-transparent">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-[#E5CD82] via-[#C2AE72] to-[#978760] bg-clip-text">
                {name}
              </span>
            </h1>
            <p className="mt-8 text-center md:text-left text-gray-300">
              Our platform connects entrepreneurs and investors, providing
              resources to help businesses thrive. Get ready to explore
              opportunities, make valuable connections, and accelerate your
              growth.{" "}
              <span className="bg-gradient-to-r from-[#E5CD82] via-[#C2AE72] to-[#978760] bg-clip-text text-transparent">
                Stay tuned for our official launch!
              </span>
            </p>
            <Link href="/profile" className="w-full md:w-auto">
              <Button className="mt-8 w-full md:w-auto rounded-full hover:opacity-75">
                Get your Business Card <ArrowRight />
              </Button>
            </Link>
          </div>

          <div className="relative mt-12 md:mt-0">
            <Image
              src="/images/badge.svg"
              alt="Badge"
              width={320}
              height={320}
              className="hidden md:block"
            />
            <div className="md:absolute md:inset-0 mt-8 md:mt-64 flex flex-col items-center justify-center px-8">
              <h2 className="bg-gradient-to-r from-[#BFBFC2] via-[#FDFDFD] to-[#BFBFC2] bg-clip-text text-xl md:text-2xl font-bold tracking-wide text-transparent text-center">
                Invite Friends & Earn Rewards
              </h2>
              <h2 className="hidden md:block bg-gradient-to-r from-[#BFBFC2] via-[#FDFDFD] to-[#BFBFC2] bg-clip-text text-2xl font-bold tracking-wide text-transparent">
                Share your code!
              </h2>
              <div className="mb-8 md:mb-20 mt-8 md:mt-12 w-full md:w-52 rounded-sm border-2 border-white/10 bg-[#2D2F3D] bg-opacity-30 p-2 text-lg font-bold placeholder:text-white">
                <div className="relative flex items-center justify-center">
                  <Copy
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        referral?.referralCode ?? "",
                      );
                      toast.success("Copied to clipboard!");
                    }}
                    className="absolute right-2 h-4 w-4 cursor-pointer hover:opacity-75"
                  />
                  <p className="flex-1 text-center">{referral?.referralCode}</p>
                </div>
              </div>
              <div className="flex w-full justify-center md:justify-between gap-8 md:px-8">
                <Link
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    "https://imvestor.com",
                  )}&text=${encodeURIComponent(
                    `Join Imvestor using my referral code: ${referral?.referralCode}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-8 w-8 cursor-pointer hover:opacity-75" />
                </Link>
                <Link
                  href={`https://www.instagram.com/share?url=${encodeURIComponent(
                    "https://imvestor.com",
                  )}&caption=${encodeURIComponent(
                    `Join Imvestor using my referral code: ${referral?.referralCode}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-8 w-8 cursor-pointer hover:opacity-75" />
                </Link>
                <Link
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    "https://imvestor.com",
                  )}&quote=${encodeURIComponent(
                    `Join Imvestor using my referral code: ${referral?.referralCode}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-8 w-8 cursor-pointer hover:opacity-75" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        <div className="flex-col items-center justify-center md:flex hidden">
          <div className="mt-12 text-center text-5xl font-bold text-[#E5CD82]">
            My Referral
          </div>
          <div className="mt-6 bg-gradient-to-r from-[#BFBFC2] via-[#FDFDFD] to-[#BFBFC2] bg-clip-text text-center text-xl font-bold">
            Total: {referral?.total}
          </div>
          {referral?.references.map((ref) => (
            <div
              key={ref.name}
              className="mt-10 flex items-center justify-center gap-8 rounded-md bg-[#1b1c24] px-24 py-3"
            >
              <div className="text-center text-lg font-bold text-white">
                {ref.name}
              </div>
              <div className="text-center text-lg text-white">
                Joined Sep 16th, 2022
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
