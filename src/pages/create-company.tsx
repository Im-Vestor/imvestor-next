import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
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
import { Label } from "~/components/ui/label";
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
import { countries } from "~/data/countries";
import { stateApi, projectApi } from "~/lib/api";
import { cn } from "~/lib/utils";
import { fileToBase64 } from "~/utils/base64";

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
  banner: z
    .object({
      name: z.string(),
      type: z.string(),
      size: z.number(),
      base64: z.string(),
    })
    .optional(),
  quickSolution: z
    .string()
    .min(10, "Quick solution must be at least 10 characters"),
  webSite: z.string().optional(),
  foundationDate: z.date(),
  companySector: z.string().min(2, "Company sector is required"),
  companyStage: z.string().min(2, "Company stage is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "State is required"),
  about: z
    .string()
    .min(10, "About must be at least 10 characters")
    .max(280, "About must be at most 280 characters"),
  startInvestment: z.string().min(1, "Start investment is required"),
  investorSlots: z.string().min(1, "Investors slots is required"),
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
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export default function CreateCompany() {
  const router = useRouter();
  const [states, setStates] = useState<string[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "",
      banner: {
        name: "",
        type: "",
        size: 0,
        base64: "",
      },
      quickSolution: "",
      webSite: "",
      foundationDate: new Date(),
      companySector: "",
      companyStage: "",
      country: "",
      city: "",
      about: "",
      startInvestment: "",
      investorSlots: "",
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
        banner: {
          name: data.banner?.name ?? "",
          type: data.banner?.type ?? "image/jpeg",
          size: data.banner?.size.toString() ?? "",
          base64: data.banner?.base64 ?? "",
        },
        quickSolution: data.quickSolution,
        webSite: data.webSite ?? undefined,
        foundationDate: data.foundationDate.toISOString().split("T")[0] ?? "",
        companySector: data.companySector,
        companyStage: data.companyStage,
        country: data.country,
        city: data.city,
        about: data.about,
        startInvestment: data.startInvestment,
        investorSlots: parseInt(data.investorSlots),
        annualRevenue: data.annualRevenue,
        investmentGoal: data.investmentGoal,
        equity: data.equity,
        companyFaq: data.companyFaq ?? [],
      });

      return response;
    },
    onSuccess: () => {
      toast.success("Company created successfully!");
      void router.push("/profile");
    },
    onError: (error) => {
      toast.error("Failed to create company. Please try again.");
      console.error(
        "Create company error:",
        error instanceof Error ? error.message : "Unknown error",
      );
    },
  });

  const fetchStates = async (countryName: string) => {
    try {
      setIsLoadingStates(true);

      const country = countries.find(
        (country) => country.name === countryName,
      );

      if (!country) {
        throw new Error("Country not found");
      }

      const response = await stateApi.getStateList(country.id);
      setStates(response);
    } catch (error) {
      console.error(
        "Error fetching states:",
        error instanceof Error ? error.message : "Unknown error",
      );
      toast.error("Failed to load states");
      setStates([]);
    } finally {
      setIsLoadingStates(false);
    }
  };

  function onSubmit(data: CompanyFormValues) {
    createCompany(data);
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-8">
      <Header />
      <div className="mt-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6 rounded-xl border-2 border-white/10 bg-gradient-to-b from-[#20212B] to-[#242834] px-16 py-8">
              <button
                type="button"
                className="flex items-center gap-2 hover:opacity-75"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h1 className="text-lg font-bold">Create Company</h1>
              <FormField
                control={form.control}
                name="banner"
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
                                void fileToBase64(file).then((base64) => {
                                  onChange({
                                    name: file.name,
                                    type: file.type,
                                    size: file.size,
                                    base64,
                                  });
                                });
                              }
                            }}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            {...field}
                          />
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#D1D5DC]">
                            {value?.base64 ? (
                              <Image
                                src={`data:${value.type};base64,${value.base64}`}
                                alt="Logo preview"
                                className="h-full w-full rounded-md object-cover"
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
                    <Label className="font-normal text-neutral-200">
                      Company Name*
                    </Label>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
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
                    <Label className="font-normal text-neutral-200">
                      Quick Solution*
                    </Label>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your solution"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="webSite"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      Website (optional)
                    </Label>
                    <FormControl>
                      <Input
                        className="w-1/2"
                        type="url"
                        placeholder="https://example.com"
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
                  <FormItem className="flex flex-col gap-2">
                    <Label className="font-normal text-neutral-200">
                      Foundation Date*
                    </Label>
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
                                <span>Select date</span>
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
                            captionLayout="dropdown"
                            showOutsideDays={false}
                            selected={field.value}
                            onSelect={field.onChange}
                            fromYear={1930}
                            toYear={2025}
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
                      <Label className="font-normal text-neutral-200">
                        Company Sector*
                      </Label>
                      <FormControl>
                        <Input placeholder="e.g. Technology" {...field} />
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
                      <Label className="font-normal text-neutral-200">
                        Company Stage*
                      </Label>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value: string) => {
                            field.onChange(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
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
                      <Label className="font-normal text-neutral-200">
                        Country*
                      </Label>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value: string) => {
                            field.onChange(value);
                            void fetchStates(value);
                            form.setValue("city", "");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Country*" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem
                                key={country.id}
                                value={country.name}
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
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="font-normal text-neutral-200">
                        State*
                      </Label>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value: string) =>
                            field.onChange(value)
                          }
                          disabled={
                            !form.getValues("country") || isLoadingStates
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
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-normal text-neutral-200">
                      About Company*
                    </Label>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your company"
                        {...field}
                      />
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
                      <Label className="font-normal text-neutral-200">
                        Start Investment*
                      </Label>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter amount in USD"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investorSlots"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="font-normal text-neutral-200">
                        Investors Slots*
                      </Label>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number of slots"
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
                      <Label className="font-normal text-neutral-200">
                        Annual Revenue*
                      </Label>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter amount in USD"
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
                      <Label className="font-normal text-neutral-200">
                        Equity
                      </Label>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter equity percentage"
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
                    <Label className="font-normal text-neutral-200">
                      Investment Goal*
                    </Label>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Enter amount in USD"
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
