import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "~/lib/api";
import { Header } from "~/components/header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Pencil } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

interface EntrepreneurProfile {
  avatar: string | null;
  name: string;
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
  name: string;
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
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  mobileFone: z.string().min(1, "Mobile phone is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  companyRole: z.string().optional(),
  companyName: z.string().optional(),
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
      country: profileData?.country ?? "",
      city: profileData?.city ?? "",
      mobileFone: "",
      birthDate: "",
      companyRole: profileData?.companyRole ?? "",
      companyName: profileData?.companyName ?? "",
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
          <div>
            <h2 className="text-2xl font-bold text-[#E5CD82]">{data.name}</h2>
            <p className="text-gray-400">Entrepreneur</p>
          </div>
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
            className="space-y-4 rounded-lg bg-[#282B37] p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={entrepreneurForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#E5CD82]">First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
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
                    <FormLabel className="text-[#E5CD82]">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
                        disabled={isUpdatingEntrepreneur}
                      />
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
                    <FormLabel className="text-[#E5CD82]">City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
                        disabled={isUpdatingEntrepreneur}
                      />
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
                    <FormLabel className="text-[#E5CD82]">Country</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
                        disabled={isUpdatingEntrepreneur}
                      />
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
                    <FormLabel className="text-[#E5CD82]">Company</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
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
                    <FormLabel className="text-[#E5CD82]">Role</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
                        disabled={isUpdatingEntrepreneur}
                      />
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
                  <FormLabel className="text-[#E5CD82]">About</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-[#181920] text-white"
                      disabled={isUpdatingEntrepreneur}
                    />
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
        <div className="space-y-4 rounded-lg bg-[#282B37] p-6">
          <div>
            <h3 className="text-lg font-semibold text-[#E5CD82]">About</h3>
            <p className="text-gray-300">
              {data.about ?? "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-[#E5CD82]">Location</h4>
              <p className="text-gray-300">
                {data.city && data.country
                  ? `${data.city}, ${data.country}`
                  : "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[#E5CD82]">Member Since</h4>
              <p className="text-gray-300">
                {new Date(data.memberSince).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[#E5CD82]">Company</h4>
              <p className="text-gray-300">
                {data.companyName ?? "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[#E5CD82]">Role</h4>
              <p className="text-gray-300">
                {data.companyRole ?? "Not specified"}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[#E5CD82]">Skills</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[#E5CD82] px-3 py-1 text-sm text-black"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
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
          <div>
            <h2 className="text-2xl font-bold text-[#E5CD82]">{data.name}</h2>
            <p className="text-gray-400">Investor</p>
          </div>
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
            className="space-y-4 rounded-lg bg-[#282B37] p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={investorForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#E5CD82]">City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
                        disabled={isUpdatingInvestor}
                      />
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
                    <FormLabel className="text-[#E5CD82]">Country</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
                        disabled={isUpdatingInvestor}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={investorForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#E5CD82]">Company</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
                        disabled={isUpdatingInvestor}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="companyRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#E5CD82]">Role</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white"
                        disabled={isUpdatingInvestor}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={investorForm.control}
              name="mobileFone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#E5CD82]">Mobile Phone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-[#181920] text-white"
                      disabled={isUpdatingInvestor}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={investorForm.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#E5CD82]">Birth Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="bg-[#181920] text-white"
                      disabled={isUpdatingInvestor}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={investorForm.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#E5CD82]">About</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-[#181920] text-white"
                      disabled={isUpdatingInvestor}
                    />
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
        <div className="space-y-4 rounded-lg bg-[#282B37] p-6">
          <div>
            <h3 className="text-lg font-semibold text-[#E5CD82]">About</h3>
            <p className="text-gray-300">
              {data.about ?? "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-[#E5CD82]">Location</h4>
              <p className="text-gray-300">
                {data.city && data.country
                  ? `${data.city}, ${data.country}`
                  : "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[#E5CD82]">Member Since</h4>
              <p className="text-gray-300">
                {new Date(data.memberSince).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[#E5CD82]">Company</h4>
              <p className="text-gray-300">
                {data.companyName ?? "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[#E5CD82]">Role</h4>
              <p className="text-gray-300">
                {data.companyRole ?? "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[#E5CD82]">Net Worth</h4>
              <p className="text-gray-300">${data.netWorth}</p>
            </div>
            <div>
              <h4 className="font-medium text-[#E5CD82]">
                Investment Objective
              </h4>
              <p className="text-gray-300">
                {data.investmentObjective ?? "Not specified"}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[#E5CD82]">Investment Areas</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.areas?.map((area) => (
                <span
                  key={`area-${area}`}
                  className="rounded-full bg-[#E5CD82] px-3 py-1 text-sm text-black"
                >
                  Area {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <Header />
      {profileData &&
        (userType === "ENTREPRENEUR"
          ? renderEntrepreneurProfile(profileData as EntrepreneurProfile)
          : renderInvestorProfile(profileData as InvestorProfile))}
    </main>
  );
}
