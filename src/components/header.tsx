import { LogOut, Mail, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { type EntrepreneurProfile, type InvestorProfile, profileApi } from "../lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Profile = EntrepreneurProfile | InvestorProfile;

export const Header = () => {
  const router = useRouter();
  const path = usePathname();

  const [accessToken, setAccessToken] = useState("");
  const [userType, setUserType] = useState("");
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const type = sessionStorage.getItem("type");
    setAccessToken(token ?? "");
    setUserType(type ?? "");

    const fetchUserProfile = async () => {
      if (type === "ENTREPRENEUR" || type === "INVESTOR") {
        try {
          const profile = type === "ENTREPRENEUR" 
            ? await profileApi.getEntrepreneurProfile()
            : await profileApi.getInvestorProfile();

          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    if (token && type) {
      void fetchUserProfile();
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!sessionStorage.getItem("accessToken")) {
        await router.push("/login");
      }
    };
    void checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    sessionStorage.clear();
    await router.push("/login");
  };

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

      
        <div className="flex w-1/3 items-center justify-end gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                {userProfile?.avatar ? (
                  <Image
                    src={userProfile?.avatar ?? ""}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-8 w-8" />
                )}
                <span>{userProfile?.firstName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/referral")}>
                <Mail className="h-4 w-4" />
                Referrals
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    </div>
  );
};
