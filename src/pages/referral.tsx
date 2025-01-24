import { ArrowRight, Copy, Facebook, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import { Button } from "~/components/ui/button";

export default function Referral() {
  return (
    <>
      <div className="relative">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[1000px] -translate-x-1/2 transform rounded-full bg-white/5 blur-[128px]" />

        <main className="relative mx-48 flex min-h-screen justify-between">
          <div className="mt-48 flex w-1/2 flex-col items-start">
            <div className="flex flex-col items-center">
              <Image
                src="/logo/imvestor.png"
                alt="Imvestor"
                width={48}
                height={48}
              />
              <h3 className="mt-2 text-xl font-bold">Im-Vestor</h3>
            </div>
            <h1 className="mt-8 bg-gradient-to-r from-[#BFBFC2] via-[#FDFDFD] to-[#BFBFC2] bg-clip-text text-4xl font-medium tracking-wide text-transparent">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-[#E5CD82] via-[#C2AE72] to-[#978760] bg-clip-text">
                Guilherme!
              </span>
            </h1>
            <p className="mt-8 text-gray-300">
              Our platform connects entrepreneurs and investors, providing
              resources to help businesses thrive. Get ready to explore
              opportunities, make valuable connections, and accelerate your
              growth.{" "}
              <span className="bg-gradient-to-r from-[#E5CD82] via-[#C2AE72] to-[#978760] bg-clip-text text-transparent">
                Stay tuned for our official launch!
              </span>
            </p>
            <Button className="mt-8 rounded-full hover:opacity-75">
              Get your Business Card <ArrowRight />
            </Button>
          </div>
          <div className="relative">
            <Image
              src="/images/badge.svg"
              alt="Badge"
              width={320}
              height={320}
            />
            <div className="absolute inset-0 mt-8 flex flex-col items-center justify-center p-8">
              <h2 className="bg-gradient-to-r from-[#BFBFC2] via-[#FDFDFD] to-[#BFBFC2] bg-clip-text text-2xl font-bold tracking-wide text-transparent">
                Invite Friends
              </h2>
              <h2 className="bg-gradient-to-r from-[#BFBFC2] via-[#FDFDFD] to-[#BFBFC2] bg-clip-text text-2xl font-bold tracking-wide text-transparent">
                Earn Rewards
              </h2>
              <h2 className="bg-gradient-to-r from-[#BFBFC2] via-[#FDFDFD] to-[#BFBFC2] bg-clip-text text-2xl font-bold tracking-wide text-transparent">
                Share your code!
              </h2>
              <div className="mb-20 mt-12 w-48 rounded-sm border-2 border-white/10 bg-[#2D2F3D] bg-opacity-30 p-2 text-lg font-bold placeholder:text-white">
                <div className="relative flex items-center justify-center">
                  <Copy className="absolute right-2 h-4 w-4 cursor-pointer hover:opacity-75" />
                  <p className="flex-1 text-center">HFOPAC</p>
                </div>
              </div>
              <div className="flex w-full justify-between px-8">
                <Linkedin className="h-8 w-8 cursor-pointer hover:opacity-75" />
                <Instagram className="h-8 w-8 cursor-pointer hover:opacity-75" />
                <Facebook className="h-8 w-8 cursor-pointer hover:opacity-75" />
              </div>
            </div>
          </div>
        </main>

        <div className="text-center text-5xl font-bold">TODO: My Invites</div>
      </div>
    </>
  );
}
