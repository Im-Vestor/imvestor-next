import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CircleUserRound,
  ImageIcon,
  MapPin,
  Pencil,
  Plus,
  User,
} from "lucide-react";
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
import { countries } from "~/data/countries";
import {
  type EntrepreneurProfile,
  type InvestorProfile,
  profileApi,
  projectApi,
  type ProjectResponse,
  stateApi,
} from "~/lib/api";
import { fileToBase64 } from "~/utils/base64";

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
  photo: z
    .object({
      name: z.string(),
      type: z.string(),
      size: z.string(),
      base64: z.string(),
    })
    .optional(),
});

const investorFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  mobileFone: z.string().min(1, "Mobile phone is required"),
  fiscalCode: z.string().min(1, "Fiscal code is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  about: z.string().optional(),
  photo: z
    .object({
      name: z.string(),
      type: z.string(),
      size: z.string(),
      base64: z.string(),
    })
    .optional(),
});

export default function Profile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [states, setStates] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const userType =
    typeof window !== "undefined" ? sessionStorage.getItem("type") : null;

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectApi.getEntrepreneurProjects(),
    enabled: userType === "ENTREPRENEUR",
  });

  const {
    data: profileData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return userType === "ENTREPRENEUR"
        ? profileApi.getEntrepreneurProfile()
        : profileApi.getInvestorProfile();
    },
    enabled: !!userType,
  });

  const entrepreneurForm = useForm<z.infer<typeof entrepreneurFormSchema>>({
    resolver: zodResolver(entrepreneurFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
      city: "",
      fiscalCode: "",
      mobileFone: "",
      companyRole: "",
      companyName: "",
      about: "",
      photo: {
        name: "",
        type: "",
        size: "",
        base64: "",
      },
    },
  });

  const investorForm = useForm<z.infer<typeof investorFormSchema>>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      fiscalCode: "",
      mobileFone: "",
      country: "",
      city: "",
      about: "",
      photo: {
        name: "",
        type: "",
        size: "",
        base64: "",
      },
    },
  });

  // Update form values when profile data is loaded
  useEffect(() => {
    const initializeProfile = async () => {
      if (profileData && userType === "ENTREPRENEUR") {
        const data = profileData as EntrepreneurProfile;
        if (data.country) {
          await fetchStates(data.country);
        }
        entrepreneurForm.reset({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          country:
            countries.find((country) => country.name === data.country)?.name ??
            "",
          city: data.city ?? "",
          fiscalCode: data.fiscalCode ?? "",
          mobileFone: data.mobileFone ?? "",
          companyRole: data.companyRole ?? "",
          companyName: data.companyName ?? "",
          about: data.about ?? "",
          photo: {
            name: data.avatar ?? "",
            type: "",
            size: "",
            base64: "",
          },
        });
      } else if (profileData && userType === "INVESTOR") {
        const data = profileData as InvestorProfile;
        if (data.country) {
          await fetchStates(data.country);
        }
        investorForm.reset({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          fiscalCode: data.fiscalCode ?? "",
          mobileFone: data.mobileFone ?? "",
          country:
            countries.find((country) => country.name === data.country)?.name ??
            "",
          city: data.city ?? "",
          about: data.about ?? "",
          photo: {
            name: data.avatar ?? "",
            type: "",
            size: "",
            base64: "",
          },
        });
      }
    };

    void initializeProfile();
  }, [entrepreneurForm, investorForm, profileData, userType]);

  const { mutate: updateEntrepreneur, isPending: isUpdatingEntrepreneur } =
    useMutation({
      mutationFn: (data: z.infer<typeof entrepreneurFormSchema>) =>
        profileApi.updateEntrepreneurProfile(data),
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        // refetch queries with key "profile"
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
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
        profileApi.updateInvestorProfile(data),
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error("Failed to update profile. Please try again.");
        console.error("Update error:", error);
      },
    },
  );

  const fetchStates = async (countryName: string) => {
    try {
      setIsLoadingStates(true);

      const country = countries.find((country) => country.name === countryName);

      if (!country) {
        throw new Error("Country not found");
      }

      const response = await stateApi.getStateList(country.id);
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

        await profileApi.uploadBanner(payload);
        toast.success("Banner uploaded successfully!");
        void refetch();
      };
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error("Failed to upload banner");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);

    const base64 = await fileToBase64(file);

    const photoData = {
      name: file.name,
      type: file.type,
      size: file.size.toString(),
      base64: base64 as string,
    };

    // Store the photo in the appropriate form state
    if (userType === "ENTREPRENEUR") {
      entrepreneurForm.setValue("photo", photoData);
    } else {
      investorForm.setValue("photo", photoData);
    }

    console.log(photoData);

    toast.success("Photo ready to be saved");
    setIsUploadingPhoto(false);
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

  const renderPhotoUpload = (currentPhoto: string | null) => {
    const formPhoto =
      userType === "ENTREPRENEUR"
        ? entrepreneurForm.getValues("photo")?.base64
        : investorForm.getValues("photo")?.base64;

    const photoToShow = formPhoto
      ? `data:image/*;base64,${formPhoto}`
      : currentPhoto;

    return (
      <div className="relative">
        <label htmlFor="photo-upload">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#D1D5DB] hover:cursor-pointer hover:opacity-75">
            {photoToShow ? (
              <Image
                src={photoToShow}
                alt="Profile"
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <Plus className="h-8 w-8 text-black" />
            )}
          </div>

          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
            disabled={isUploadingPhoto}
          />
        </label>
      </div>
    );
  };

  const renderEntrepreneurProfile = (profileData: EntrepreneurProfile) => (
    <div className="space-y-6">
      {isEditing ? (
        <Form {...entrepreneurForm}>
          <form
            onSubmit={entrepreneurForm.handleSubmit((data) =>
              updateEntrepreneur(data),
            )}
            className="space-y-4 rounded-lg border-2 border-white/10 bg-[#242630]"
          >
            {renderBannerUpload(profileData.banner)}

            <div className="flex items-center justify-center">
              {renderPhotoUpload(profileData.avatar)}
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
                              value={country.name.toString()}
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
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#D1D5DB]">
                {profileData.avatar ? (
                  <Image
                    src={profileData.avatar}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-black" />
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <h2 className="text-3xl font-semibold">
                {profileData.firstName + " " + profileData.lastName}
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
              {profileData.companyRole ?? "Entrepreneur"}
            </p>
            <p className="mt-1 flex items-center gap-1 text-gray-400">
              <MapPin className="mr-0.5 h-4 w-4" />
              {profileData.city && profileData.country
                ? `${profileData.city}, ${profileData.country}`
                : "Not specified"}
            </p>
            <h3 className="mt-12 font-semibold">About me</h3>
            <p className="mt-3 text-gray-400">
              {profileData.about ?? "No description"}
            </p>
            <h3 className="mt-12 font-semibold">Company</h3>
            {projects && projects.length > 0 && (
              <div className="mt-4">
                {projects.map((project) => (
                  <CompanyCard key={project.companyName} company={project} profileData={profileData} />
                ))}
              </div>
            )}
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

  const renderInvestorProfile = (profileData: InvestorProfile) => (
    <div className="space-y-6">
      {isEditing ? (
        <Form {...investorForm}>
          <form
            onSubmit={investorForm.handleSubmit((data) => updateInvestor(data))}
            className="space-y-4 rounded-lg border-2 border-white/10 bg-[#242630]"
          >
            {renderBannerUpload(profileData.banner)}
            <div className="flex items-center justify-center">
              {renderPhotoUpload(profileData.avatar)}
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
                              value={country.name.toString()}
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
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#D1D5DB]">
              {profileData.avatar ? (
                <Image
                  src={profileData.avatar}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-black" />
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-3xl font-semibold">
              {profileData.firstName + " " + profileData.lastName}
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
            {profileData.city && profileData.country
              ? `${profileData.city}, ${profileData.country}`
              : "Not specified"}
          </p>
          <h3 className="mt-12 font-semibold">About me</h3>
          <p className="mt-3 text-gray-400">
            {profileData.about ?? "No description"}
          </p>
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

function CompanyCard({ company, profileData }: { company: ProjectResponse, profileData: EntrepreneurProfile | InvestorProfile }) {
  return (
        <div className="rounded-xl border-2 border-white/10 bg-[#1E202A] p-6">
          <div className="flex gap-6 mb-4">
            <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={company.banner}
                alt="Company Logo"
                width={72}
                height={72}
                className="h-full w-full rounded-md object-cover"
              />
            </div>
    
            <div className="flex flex-col">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{company.companyName}</h3>
                </div>
                <span className="text-white/70">
                  {company.cityState}, {company.country}
                </span>
                <p>{company.quickSolution}</p>
              </div>
            </div>
          </div>
          <hr className="my-6 border-white/10" />
          <div className="flex items-center gap-2">
            <Image
              src={profileData.avatar ?? ""}
              alt="Founder"
              width={24}
              height={24}
              className="h-4 w-4 rounded-full object-cover text-white/50"
            />
            <p className="text-sm font-light">Founded by
            <span className=" text-[#EFD687]"> {profileData.firstName}</span>
            </p>
            <div className="ml-auto flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <CircleUserRound
                  key={i}
                  color="#EFD687"
                  className="h-4 w-4"
                />
              ))}
            </div>
          </div>
        </div>
      );
}
