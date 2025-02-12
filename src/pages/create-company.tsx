import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, CalendarIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Header } from "~/components/header";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { projectApi } from "~/lib/api";
import { cn } from "~/lib/utils";

const COMPANY_STAGES = [
  "Pre-seed",
  "Seed",
  "Serie A",
  "Serie B",
  "Serie C",
  "Serie D",
  "IPO",
];

const companyFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  quickSolution: z
    .string()
    .min(10, "Quick solution must be at least 10 characters"),
  website: z.string().url().optional(),
  foundationDate: z.date(),
  companySector: z.string().min(2, "Company sector is required"),
  companyStage: z.string().min(2, "Company stage is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
  about: z
    .string()
    .min(10, "About must be at least 10 characters")
    .max(280, "About must be at most 280 characters"),
  startInvestment: z.string().min(1, "Start investment is required"),
  investorsSlots: z.string().min(1, "Investors slots is required"),
  annualRevenue: z.string().min(1, "Annual revenue is required"),
  investmentGoal: z.string().min(1, "Investment goal is required"),
  equity: z.string().optional(),
  companyFaq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .optional(),
  logo: z.instanceof(File).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export default function CreateCompany() {
  const router = useRouter();
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "",
      quickSolution: "",
      website: "",
      foundationDate: new Date(),
      companySector: "",
      companyStage: "",
      country: "",
      city: "",
      about: "",
      startInvestment: "",
      investorsSlots: "",
      annualRevenue: "",
      investmentGoal: "",
      equity: "",
      companyFaq: [{ question: "", answer: "" }],
    },
  });

  const { mutate: createCompany, isPending } = useMutation({
    mutationFn: async (data: CompanyFormValues) => {
      // First create the project
      const response = await projectApi.createProject({
        name: data.companyName,
        quickSolution: data.quickSolution,
        website: data.website ?? undefined,
        foundationDate: data.foundationDate.toISOString(),
        companySector: data.companySector,
        companyStage: data.companyStage,
        country: data.country,
        city: data.city,
        about: data.about,
        startInvestment: data.startInvestment,
        investorsSlots: parseInt(data.investorsSlots),
        annualRevenue: data.annualRevenue,
        investmentGoal: data.investmentGoal,
        equity: data.equity,
        companyFaq: data.companyFaq ?? [],
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
          reader.onerror = () =>
            reject(new Error(reader.error?.message ?? "Failed to read file"));
        });
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Company created successfully!");
      void router.push("/profile");
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
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <Header />
      <div className="mt-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6 rounded-xl border-2 border-white/10 bg-gradient-to-b from-[#20212B] to-[#242834] px-16 py-8">
              <h1 className="text-lg font-bold">Create Company</h1>

              <FormField
                control={form.control}
                name="logo"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="relative h-24 w-24 hover:opacity-75">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                              }
                            }}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            {...field}
                          />
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#D1D5DC]">
                            {value ? (
                              <Image
                                src={URL.createObjectURL(value)}
                                alt="Logo preview"
                                className="h-full w-full object-cover"
                                width={100}
                                height={100}
                              />
                            ) : (
                              <PlusIcon className="h-6 w-6 text-black" />
                            )}
                          </div>
                        </div>
                        {value && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              {value.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => onChange(undefined)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
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
                    <FormControl>
                      <Input placeholder="Company Name*" {...field} />
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
                    <FormControl>
                      <Textarea placeholder="Quick Solution*" {...field} />
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
                    <FormControl>
                      <Input
                        className="w-1/2"
                        type="url"
                        placeholder="Website (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="foundationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-1/2 border-none pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Foundation Date*</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto border-none p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companySector"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Company Sector*" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value: string) => {
                            field.onChange(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Company Stage*" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPANY_STAGES.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {stage}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Country*" {...field} />
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
                      <FormControl>
                        <Input placeholder="City*" {...field} />
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
                    <FormControl>
                      <Textarea placeholder="About Company*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="mt-2 text-lg">Financial Requirements</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Start Investment*"
                          {...field}
                        />
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
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Investors Slots*"
                          {...field}
                        />
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
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Annual Revenue*"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equity"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Equity (Optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="investmentGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Investment Goal*"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="mt-2 text-lg">Company FAQ</h3>

              <div className="space-y-4">
                {form.watch("companyFaq")?.map((_, index) => (
                  <div key={index}>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FormField
                          control={form.control}
                          name={`companyFaq.${index}.question`}
                          render={({ field }) => (
                            <FormItem className="w-11/12">
                              <FormControl>
                                <Input
                                  placeholder={`Question ${index + 1}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentFaq =
                              form.getValues("companyFaq") ?? [];
                            form.setValue(
                              "companyFaq",
                              currentFaq.filter((_, i) => i !== index),
                            );
                          }}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`companyFaq.${index}.answer`}
                        render={({ field }) => (
                          <FormItem className="w-11/12">
                            <FormControl>
                              <Input
                                placeholder={`Answer ${index + 1}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentFaq = form.getValues("companyFaq") ?? [];
                    form.setValue("companyFaq", [
                      ...currentFaq,
                      { question: "", answer: "" },
                    ]);
                  }}
                >
                  <PlusIcon className="h-4 w-4" /> Add Question
                </Button>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button className="w-1/3" type="submit" disabled={isPending}>
                  {isPending ? (
                    "Saving..."
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Save</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}
