import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, ImageIcon, MapPin, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { type ChangeEvent, useEffect, useState } from "react";
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
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { PhoneInput } from "~/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { api, type Country, countryAndStateApi } from "~/lib/api";

interface EntrepreneurProfile {
  avatar: string | null;
  banner: string | null;
  firstName: string;
  lastName: string;
  about: string | null;
  city: string | null;
  country: string | null;
  fiscalCode: string | null;
  mobileFone: string | null;
  companyRole: string | null;
  companyName: string | null;
  memberSince: string;
  focusSector: string;
  skills: string[];
  totalInvestors: number;
}

interface InvestorProfile {
  reputation: string | null;
  banner: string | null;
  firstName: string | null;
  lastName: string | null;
  about: string | null;
  mobileFone: string | null;
  fiscalCode: string | null;
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
  companyRole: z.string().min(1, "Role is required"),
  companyName: z.string().min(1, "Company name is required"),
  fiscalCode: z.string().min(1, "Fiscal code is required"),
  mobileFone: z.string().min(1, "Mobile phone is required"),
  about: z.string().optional(),
});

const investorFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  mobileFone: z.string().min(1, "Mobile phone is required"),
  fiscalCode: z.string().min(1, "Fiscal code is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  about: z.string().optional(),
});

export default function Profile() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
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

  const {
    data: profileData,
    isLoading,
    refetch,
  } = useQuery<EntrepreneurProfile | InvestorProfile>({
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

  useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await countryAndStateApi.getCountryList();
      setCountries(response);
    },
    enabled: !!userType,
  });

  const entrepreneurForm = useForm<z.infer<typeof entrepreneurFormSchema>>({
    resolver: zodResolver(entrepreneurFormSchema),
    defaultValues: {
      firstName: profileData?.firstName ?? "",
      lastName: profileData?.lastName ?? "",
      country: profileData?.country ?? "",
      city: profileData?.city ?? "",
      fiscalCode: profileData?.fiscalCode ?? "",
      mobileFone: profileData?.mobileFone ?? "",
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
      fiscalCode: profileData?.fiscalCode ?? "",
      mobileFone: profileData?.mobileFone ?? "",
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

  const fetchStates = async (countryId: string) => {
    try {
      setIsLoadingStates(true);
      const response = await countryAndStateApi.getStateList(
        parseInt(countryId),
      );
      setStates(response);
    } catch (error) {
      console.error("Error fetching states:", error);
      toast.error("Failed to load states");
      setStates([]);
    } finally {
      setIsLoadingStates(false);
    }
  };

  const handleBannerUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        if (typeof reader.result !== "string") {
          toast.error("Failed to process image");
          return;
        }

        const base64 = reader.result.split(",")[1];

        if (!base64) {
          toast.error("Failed to process image");
          return;
        }

        const payload = {
          name: file.name,
          type: file.type,
          size: file.size.toString(),
          base64: base64,
        };

        await api.post("/api/upload-banner", payload);
        toast.success("Banner uploaded successfully!");
        // Refetch profile data to get new banner URL
        void refetch();
      };
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error("Failed to upload banner");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-[#E5CD82]">Loading...</div>
      </div>
    );
  }

  const renderBannerUpload = (currentBanner: string | null) => (
    <div className="relative mb-8 w-full">
      <div className="h-48 w-full overflow-hidden rounded-t-lg bg-[#282B37]">
        {currentBanner && (
          <Image
            src={currentBanner}
            alt="Profile Banner"
            layout="fill"
            objectFit="cover"
            className="transition-opacity duration-300 hover:opacity-75"
          />
        )}
      </div>
      <div className="absolute right-4 top-4">
        <label htmlFor="banner-upload" className="cursor-pointer">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#282A37] px-4 py-2 text-sm text-white hover:bg-[#282A37]/90">
            <ImageIcon className="h-4 w-4" />
            {isUploadingBanner ? "Uploading..." : "Change Banner"}
          </div>
          <input
            id="banner-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
            disabled={isUploadingBanner}
          />
        </label>
      </div>
    </div>
  );

  const renderEntrepreneurProfile = (data: EntrepreneurProfile) => (
    <div className="space-y-6">
      {isEditing ? (
        <Form {...entrepreneurForm}>
          <form
            onSubmit={entrepreneurForm.handleSubmit((data) =>
              updateEntrepreneur(data),
            )}
            className="space-y-4 rounded-lg border-2 border-white/10 bg-[#242630]"
          >
            {renderBannerUpload(data.banner)}

            <div className="flex items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#D1D5DB] hover:opacity-75">
                <Plus className="h-8 w-8 text-black" />
              </div>
            </div>

            <div className="mx-6 grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
              <FormField
                control={entrepreneurForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      First Name*
                    </Label>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={isUpdatingEntrepreneur}
                      />
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
                    <Label className="font-normal text-neutral-200">
                      Last Name*
                    </Label>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={isUpdatingEntrepreneur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mx-6 grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
              <FormField
                control={entrepreneurForm.control}
                name="fiscalCode"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      Fiscal Code*
                    </Label>
                    <FormControl>
                      <Input
                        placeholder="01234567890"
                        {...field}
                        disabled={isUpdatingEntrepreneur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entrepreneurForm.control}
                name="mobileFone"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      Mobile Phone*
                    </Label>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        placeholder="999 999 999"
                        disabled={isUpdatingEntrepreneur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mx-6 grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
              <FormField
                control={entrepreneurForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      Country*
                    </Label>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value: string) => {
                          field.onChange(value);
                          void fetchStates(value);
                          entrepreneurForm.setValue("city", "");
                        }}
                      >
                        <SelectTrigger disabled={isUpdatingEntrepreneur}>
                          <SelectValue placeholder="Country*" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem
                              key={country.id}
                              value={country.id.toString()}
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entrepreneurForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      State*
                    </Label>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value: string) => field.onChange(value)}
                        disabled={
                          isUpdatingEntrepreneur ||
                          !entrepreneurForm.getValues("country") ||
                          isLoadingStates
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="State*" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mx-6 grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
              <FormField
                control={entrepreneurForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      Company Name*
                    </Label>
                    <FormControl>
                      <Input
                        placeholder="Acme Inc."
                        {...field}
                        disabled={isUpdatingEntrepreneur}
                      />
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
                    <Label className="font-normal text-neutral-200">
                      Role*
                    </Label>
                    <FormControl>
                      <Input
                        placeholder="CEO"
                        {...field}
                        disabled={isUpdatingEntrepreneur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mx-6">
              <FormField
                control={entrepreneurForm.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      About me
                    </Label>
                    <FormControl>
                      <Textarea
                        placeholder="I'm a startup founder..."
                        {...field}
                        disabled={isUpdatingEntrepreneur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mx-6 flex justify-end gap-4 pb-8 pt-8">
              <Button
                variant="secondary"
                disabled={isUpdatingEntrepreneur}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingEntrepreneur}>
                {isUpdatingEntrepreneur ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <>
          <div className="rounded-lg border border-white/10 px-12 pb-20 pt-6">
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
            <div className="mt-4 flex items-center justify-between">
              <h2 className="text-3xl font-semibold">
                {data.firstName + " " + data.lastName}
              </h2>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Pencil className="h-4 w-4" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
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
              className="mt-4 md:w-1/3"
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
      {isEditing ? (
        <Form {...investorForm}>
          <form
            onSubmit={investorForm.handleSubmit((data) => updateInvestor(data))}
            className="space-y-4 rounded-lg border-2 border-white/10 bg-[#242630]"
          >
            {renderBannerUpload(data.banner)}
            <div className="flex items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#D1D5DB] hover:opacity-75">
                <Plus className="h-8 w-8 text-black" />
              </div>
            </div>

            <div className="mx-6 grid grid-cols-1 gap-4 pt-8 md:grid-cols-2">
              <FormField
                control={investorForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      First Name*
                    </Label>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={isUpdatingInvestor}
                      />
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
                    <Label className="font-normal text-neutral-200">
                      Last Name*
                    </Label>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={isUpdatingInvestor}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mx-6 grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
              <FormField
                control={investorForm.control}
                name="fiscalCode"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      Fiscal Code*
                    </Label>
                    <FormControl>
                      <Input
                        placeholder="01234567890"
                        {...field}
                        disabled={isUpdatingInvestor}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="mobileFone"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      Mobile Phone*
                    </Label>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        placeholder="999 999 999"
                        disabled={isUpdatingInvestor}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mx-6 grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
              <FormField
                control={investorForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      Country*
                    </Label>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value: string) => {
                          field.onChange(value);
                          void fetchStates(value);
                          investorForm.setValue("city", "");
                        }}
                      >
                        <SelectTrigger disabled={isUpdatingInvestor}>
                          <SelectValue placeholder="Country*" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem
                              key={country.id}
                              value={country.id.toString()}
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      State*
                    </Label>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value: string) => field.onChange(value)}
                        disabled={
                          isUpdatingInvestor ||
                          !investorForm.getValues("country") ||
                          isLoadingStates
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="State*" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mx-6">
              <FormField
                control={investorForm.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      About me
                    </Label>
                    <FormControl>
                      <Textarea
                        placeholder="I'm a Venture Capitalist..."
                        {...field}
                        disabled={isUpdatingInvestor}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mx-6 flex justify-end gap-4 pb-8 pt-8">
              <Button
                variant="secondary"
                disabled={isUpdatingInvestor}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingInvestor}>
                {isUpdatingInvestor ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="rounded-lg border border-white/10 px-12 pb-20 pt-6">
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
          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-3xl font-semibold">
              {data.firstName + " " + data.lastName}
            </h2>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
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
    <main className="mx-auto min-h-screen max-w-6xl p-8">
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
