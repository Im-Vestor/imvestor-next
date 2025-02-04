import Image from "next/image";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/router";

export const Header = () => {
  const router = useRouter();

  return (
    <div className="mb-12 flex items-center justify-between rounded-full border border-white/10 px-8 py-4">
      <div className="flex items-center gap-3">
        <Image
          src="/logo/imvestor.png"
          alt="Imvestor"
          width={24}
          height={24}
        />
        <h1 className="text-xl font-bold text-white">Im-Vestor</h1>
      </div>
      <Button
        onClick={async () => {
          sessionStorage.clear();
          await router.push("/login");
        }}
        variant="ghost"
        size="icon"
      >
        <LogOut className="h-6 w-6" />
      </Button>
    </div>
  );
};
