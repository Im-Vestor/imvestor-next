import { LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export const Header = () => {
  const router = useRouter();

  const path = usePathname();

  const [accessToken, setAccessToken] = useState("");
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const userType = sessionStorage.getItem("type");
    setAccessToken(token ?? "");
    setUserType(userType ?? "");
  }, []);

  return (
    <div
      className={`mb-12 flex ${accessToken ? "items-center justify-between" : "justify-center"} rounded-full border border-white/10 px-8 py-4`}
    >
      <div className="flex w-1/3 items-center gap-3">
        <Image src="/logo/imvestor.png" alt="Imvestor" width={24} height={24} />
        <h1 className="text-xl font-bold text-white">Im-Vestor</h1>
      </div>
      {accessToken && userType === "INVESTOR" && (
        <div className="flex w-1/3 items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={`${path === "/dashboard" ? "text-[#EFD687]" : ""}`}
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${path === "/meetings" ? "text-[#EFD687]" : ""}`}
            onClick={() => router.push("/meetings")}
          >
            Meetings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${path === "/add-ons-store" ? "text-[#EFD687]" : ""}`}
            onClick={() => router.push("/add-ons-store")}
          >
            Add-ons Store
          </Button>
        </div>
      )}

      {accessToken && userType === "ENTREPRENEUR" && (
        <div className="flex w-1/3 items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={`${path === "/companies" ? "text-[#EFD687]" : ""}`}
            onClick={() => router.push("/companies")}
          >
            Companies
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${path === "/meetings" ? "text-[#EFD687]" : ""}`}
            onClick={() => router.push("/meetings")}
          >
            Meetings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${path === "/add-ons-store" ? "text-[#EFD687]" : ""}`}
            onClick={() => router.push("/add-ons-store")}
          >
            Add-ons Store
          </Button>
        </div>
      )}

      {accessToken && (
        <div className="flex w-1/3 justify-end gap-3">
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
      )}
    </div>
  );
};
