import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Pencil } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Header } from "~/components/header";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/lib/api";

interface EntrepreneurProfile {
  avatar: string | null;
  firstName: string;
  lastName: string;
  about: string | null;
  city: string | null;
  country: string | null;
  companyRole: string | null;
  companyName: string | null;
  memberSince: string;
  focusSector: string;
  skills: string[];
  totalInvestors: number;
}

interface InvestorProfile {
  reputation: string | null;
  firstName: string | null;
  lastName: string | null;
  about: string | null;
  city: string | null;
  country: string | null;
  companyRole: string | null;
  companyName: string | null;
  memberSince: string;
  netWorth: string;
  investmentObjective: string | null;
  avatar: string | null;
  areas: number[];
}

const entrepreneurFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  companyRole: z.string().optional(),
  companyName: z.string().optional(),
  about: z.string().optional(),
});

const investorFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  about: z.string().optional(),
});

export default function Profile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const userType =
    typeof window !== "undefined" ? sessionStorage.getItem("type") : null;

  useEffect(() => {
    const checkAuth = async () => {
      if (!sessionStorage.getItem("accessToken")) {
        await router.push("/login");
      }
    };
    void checkAuth();
  }, [router]);

  const { data: profileData, isLoading } = useQuery<
    EntrepreneurProfile | InvestorProfile
  >({
    queryKey: ["profile"],
    queryFn: async () => {
      const endpoint =
        userType === "ENTREPRENEUR" ? "/entrepreneur" : "/investor";
      const response = await api.get<EntrepreneurProfile | InvestorProfile>(
        endpoint,
      );
      return response.data;
    },
    enabled: !!userType,
  });

  const entrepreneurForm = useForm<z.infer<typeof entrepreneurFormSchema>>({
    resolver: zodResolver(entrepreneurFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: profileData?.country ?? "",
      city: profileData?.city ?? "",
      companyRole: profileData?.companyRole ?? "",
      companyName: profileData?.companyName ?? "",
      about: profileData?.about ?? "",
    },
  });

  const investorForm = useForm<z.infer<typeof investorFormSchema>>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: {
      firstName: profileData?.firstName ?? "",
      lastName: profileData?.lastName ?? "",
      country: profileData?.country ?? "",
      city: profileData?.city ?? "",
      about: profileData?.about ?? "",
    },
  });

  const { mutate: updateEntrepreneur, isPending: isUpdatingEntrepreneur } =
    useMutation({
      mutationFn: (data: z.infer<typeof entrepreneurFormSchema>) =>
        api.patch("/entrepreneur", data),
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error("Failed to update profile. Please try again.");
        console.error("Update error:", error);
      },
    });

  const { mutate: updateInvestor, isPending: isUpdatingInvestor } = useMutation(
    {
      mutationFn: (data: z.infer<typeof investorFormSchema>) =>
        api.patch("/investor", data),
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error("Failed to update profile. Please try again.");
        console.error("Update error:", error);
      },
    },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-[#E5CD82]">Loading...</div>
      </div>
    );
  }

  const renderEntrepreneurProfile = (data: EntrepreneurProfile) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {data.avatar ? (
            <Image
              src={data.avatar}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-[#282B37]" />
          )}
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil className="h-4 w-4" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {isEditing ? (
        <Form {...entrepreneurForm}>
          <form
            onSubmit={entrepreneurForm.handleSubmit((data) =>
              updateEntrepreneur(data),
            )}
            className="space-y-4 rounded-lg bg-[#242630] p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={entrepreneurForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingEntrepreneur} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entrepreneurForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingEntrepreneur} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={entrepreneurForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingEntrepreneur} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entrepreneurForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingEntrepreneur} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={entrepreneurForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingEntrepreneur} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entrepreneurForm.control}
                name="companyRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingEntrepreneur} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={entrepreneurForm.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isUpdatingEntrepreneur} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="mt-4"
                disabled={isUpdatingEntrepreneur}
              >
                {isUpdatingEntrepreneur ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <>
          <div>
            <h2 className="text-3xl font-semibold">{data.firstName + " " + data.lastName}</h2>
            <p className="mt-3 text-lg text-gray-400">
              {data.companyRole ?? "Entrepreneur"}
            </p>
            <p className="mt-1 flex items-center gap-1 text-gray-400">
              <MapPin className="mr-0.5 h-4 w-4" />
              {data.city && data.country
                ? `${data.city}, ${data.country}`
                : "Not specified"}
            </p>
            <h3 className="mt-12 font-semibold">About me</h3>
            <p className="mt-3 text-gray-400">
              {data.about ?? "No description"}
            </p>
            <h3 className="mt-12 font-semibold">Company</h3>
            <Button 
              className="mt-4 w-1/3"
              onClick={() => router.push("/create-company")}
            >
              Add your Company
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderInvestorProfile = (data: InvestorProfile) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {data.avatar ? (
            <Image
              src={data.avatar}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-[#282B37]" />
          )}
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil className="h-4 w-4" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {isEditing ? (
        <Form {...investorForm}>
          <form
            onSubmit={investorForm.handleSubmit((data) => updateInvestor(data))}
            className="space-y-4 rounded-lg bg-[#242630] p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={investorForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingInvestor} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingInvestor} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={investorForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingInvestor} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdatingInvestor} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={investorForm.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isUpdatingInvestor} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="mt-4"
                disabled={isUpdatingInvestor}
              >
                {isUpdatingInvestor ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div>
          <h2 className="text-3xl font-semibold">{data.firstName + " " + data.lastName}</h2>
          <p className="mt-3 text-lg text-gray-400">
            {data.companyRole ?? "Entrepreneur"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-gray-400">
            <MapPin className="mr-0.5 h-4 w-4" />
            {data.city && data.country
              ? `${data.city}, ${data.country}`
              : "Not specified"}
          </p>
          <h3 className="mt-12 font-semibold">About me</h3>
          <p className="mt-3 text-gray-400">{data.about ?? "No description"}</p>
          <h3 className="mt-12 font-semibold">Portfolio</h3>
          <p>TODO</p>
        </div>
      )}
    </div>
  );

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <Header />
      <div className="mt-12">
        {profileData &&
          (userType === "ENTREPRENEUR"
            ? renderEntrepreneurProfile(profileData as EntrepreneurProfile)
            : renderInvestorProfile(profileData as InvestorProfile))}
      </div>
    </main>
  );
}
