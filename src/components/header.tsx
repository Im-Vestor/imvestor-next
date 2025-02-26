import { LogOut, Mail, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import {
  type EntrepreneurProfile,
  type InvestorProfile,
  profileApi,
} from "../lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

type Profile = EntrepreneurProfile | InvestorProfile;

export const Header = () => {
  const router = useRouter();
  const path = usePathname();

  const [accessToken, setAccessToken] = useState("");
  const [userType, setUserType] = useState("");
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  const {
    data: profileData,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return userType === "ENTREPRENEUR"
        ? profileApi.getEntrepreneurProfile()
        : profileApi.getInvestorProfile();
    },
    enabled: !!userType && !!accessToken,
  });

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const type = sessionStorage.getItem("type");
    setAccessToken(token ?? "");
    setUserType(type ?? "");
  }, []);

  useEffect(() => {
    if (profileData) {
      setUserProfile(profileData);
    }
  }, [profileData]);

  const handleSignOut = async () => {
    sessionStorage.clear();
    setAccessToken("");
    setUserType("");
    setUserProfile(null);
    await router.push("/login");
  };

  return (
    <div
      className={`mb-12 flex ${accessToken ? "items-center justify-between" : "justify-center"} rounded-full border border-white/10 px-8 py-4`}
    >
      <div className={`flex ${accessToken ? "w-1/3" : "w-full"} items-center gap-3`}>
        <Image
          src="/logo/imvestor.png"
          alt="Imvestor"
          width={24}
          height={24}
        />
        <h1 className="text-xl font-bold text-white">Im-Vestor</h1>
      </div>
      {accessToken && userType === "INVESTOR" && (
        <div className="flex w-1/3 items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={`${path === "/companies" ? "text-[#EFD687]" : ""}`}
            onClick={() => router.push("/companies")}
          >
            Find Projects
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
            className={`${path === "/news" ? "text-[#EFD687]" : ""}`}
            onClick={() => router.push("/news")}
          >
            News
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
            className={`${path === "/news" ? "text-[#EFD687]" : ""}`}
            onClick={() => router.push("/news")}
          >
            News
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
      <div className="flex w-1/3 items-center justify-end gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-4">
              <span>{userProfile?.firstName}</span>
              {userProfile?.avatar ? (
                <Image
                  src={userProfile?.avatar ?? ""}
                  alt="Profile"
                  width={24}
                  height={24}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8" />
              )}
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
      )}
    </div>
  );
};
