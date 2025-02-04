import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { projectApi } from "~/lib/api";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { ArrowRight } from "lucide-react";

const companyFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  quickSolution: z.string().min(10, "Quick solution must be at least 10 characters"),
  website: z.string().url().optional(),
  foundationDate: z.string(),
  companySector: z.string().min(2, "Company sector is required"),
  companyStage: z.string().min(2, "Company stage is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
  about: z.string().min(10, "About must be at least 10 characters"),
  startInvestment: z.string().min(1, "Start investment is required"),
  investorsSlots: z.string().min(1, "Investors slots is required"),
  annualRevenue: z.string().min(1, "Annual revenue is required"),
  investmentGoal: z.string().min(1, "Investment goal is required"),
  logo: z.instanceof(File).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export function CreateCompanyForm() {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "",
      quickSolution: "",
      website: "",
      foundationDate: "",
      companySector: "",
      companyStage: "",
      country: "",
      city: "",
      about: "",
      startInvestment: "",
      investorsSlots: "",
      annualRevenue: "",
      investmentGoal: "",
    },
  });

  const { mutate: createCompany, isPending } = useMutation({
    mutationFn: async (data: CompanyFormValues) => {
      // First create the project
      const response = await projectApi.createProject({
        name: data.companyName,
        quickSolution: data.quickSolution,
        website: data.website ?? undefined,
        foundationDate: data.foundationDate,
        companySector: data.companySector,
        companyStage: data.companyStage,
        country: data.country,
        city: data.city,
        about: data.about,
        startInvestment: data.startInvestment,
        investorsSlots: parseInt(data.investorsSlots),
        annualRevenue: data.annualRevenue,
        investmentGoal: data.investmentGoal,
      });

      // If there's a logo, upload it
      if (data.logo) {
        const reader = new FileReader();
        reader.readAsDataURL(data.logo);
        
        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64String = (reader.result as string).split(",")[1];
              if (!base64String) {
                throw new Error("Failed to convert file to base64");
              }
              
              await projectApi.uploadFile({
                idProject: response.id,
                name: data.logo!.name,
                type: data.logo!.type ?? "image/jpeg",
                size: data.logo!.size.toString(),
                base64: base64String,
              });
              resolve();
            } catch (error) {
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          };
          reader.onerror = () => reject(new Error(reader.error?.message ?? "Failed to read file"));
        });
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Company created successfully!");
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create company. Please try again.");
      console.error("Create company error:", error);
    },
  });

  function onSubmit(data: CompanyFormValues) {
    createCompany(data);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4 w-1/3">
          Add your Company <ArrowRight className="ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Company</DialogTitle>
          <DialogDescription>
            Fill in your company details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="logo"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Company Logo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quickSolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quick Solution*</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="foundationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foundation Date*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companySector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Sector*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Company*</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Investment*</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investorsSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investors Slots*</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="annualRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Revenue*</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investmentGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Goal*</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create Company"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 