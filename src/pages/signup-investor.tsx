import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon, Check } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import { PhoneInput } from "~/components/ui/phone-input";
import { PopoverContent } from "~/components/ui/popover";
import { Slider } from "~/components/ui/slider";
import { authApi, areasApi } from "~/lib/api";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mobileFone: z.string().min(1, "Mobile phone is required"),
  fiscalCode: z.string().min(1, "Fiscal code is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  investmentMinValue: z.string().min(1, "Minimum investment value is required"),
  investmentMaxValue: z.string().min(1, "Maximum investment value is required"),
  investmentNetWorth: z.string().min(1, "Net worth is required"),
  investmentAnnualIncome: z.string().min(1, "Annual income is required"),
  birthDate: z.date({
    required_error: "Birth date is required",
  }),
  areas: z.array(z.number()).min(1, "At least one area is required"),
  referralToken: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export default function SignupInvestor() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobileFone: "",
      fiscalCode: "",
      city: "",
      country: "",
      investmentMinValue: "",
      investmentMaxValue: "",
      investmentNetWorth: "",
      investmentAnnualIncome: "",
      birthDate: new Date(),
      areas: [],
      referralToken: (router.query.referralToken as string) ?? "",
      acceptTerms: false,
    },
  });

  const { data: areas } = useQuery({
    queryKey: ["areas"],
    queryFn: areasApi.getAreasList,
  });

  const { mutate: registerInvestor, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return authApi.registerInvestor({
        ...data,
        birthDate: format(data.birthDate, "yyyy-MM-dd"),
      });
    },
    onSuccess: () => {
      toast.success("Account created successfully!");
      void router.push("/login");
    },
    onError: (error) => {
      toast.error("Failed to create account. Please try again.");
      console.error("Registration error:", error);
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (step < 6) {
      let isValid = false;
      
      switch (step) {
        case 1:
          isValid = await form.trigger(["firstName", "lastName", "mobileFone", "birthDate"]);
          break;
        case 2:
          isValid = await form.trigger("areas");
          break;
        case 3:
          isValid = await form.trigger([
            "investmentMinValue",
            "investmentMaxValue",
            "investmentNetWorth",
            "investmentAnnualIncome"
          ]);
          break;
        case 4:
          isValid = await form.trigger("acceptTerms");
          break;
        case 5:
          isValid = true; // Referral token is optional
          break;
      }

      if (isValid) {
        setStep(step + 1);
      }
      return;
    }

    registerInvestor(data);
  };

  const formatCurrency = (value: number) => {
    if (value >= 5000000) return "5M+";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="my-12 min-w-[40rem] max-w-[40rem] rounded-2xl border-4 border-white/10 bg-[#181920] bg-opacity-30 p-6 backdrop-blur-md">
        <button
          type="button"
          className="flex items-center gap-2 hover:opacity-75"
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h2 className="mt-8 text-center text-4xl font-semibold">
          Your account as <br />
          <span className="text-[#E5CD82]">Investor</span>
        </h2>

        <div className="mt-4 flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-full",
                step === i ? "bg-[#E5CD82]" : "bg-white/20"
              )}
            />
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-[#181920] text-white placeholder:text-gray-400"
                            placeholder="John"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-[#181920] text-white placeholder:text-gray-400"
                            placeholder="Doe"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mobileFone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Mobile Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          {...field}
                          className="bg-[#181920] text-white"
                          placeholder="Enter your phone number"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-white">Birth Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-none" align="start">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="areas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Investment Areas</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={
                            areas?.map((area) => ({
                              label: area.name,
                              value: area.id.toString(),
                            })) ?? []
                          }
                          selected={field.value.map(String)}
                          onChange={(values) =>
                            field.onChange(values.map((v) => Number(v)))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="investmentMinValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Investment Range</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Slider
                              min={2500}
                              max={5000000}
                              step={2500}
                              value={[Number(field.value || "2500")]}
                              onValueChange={([value]) => field.onChange(value!.toString())}
                              className="py-4"
                            />
                            <div className="flex justify-between text-sm text-white/70">
                              <span>$2.5K</span>
                              <span>{formatCurrency(Number(field.value) || 2500)}</span>
                              <span>$5M+</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="investmentNetWorth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Net Worth</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-[#181920] text-white placeholder:text-gray-400"
                            placeholder="$1,000,000"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="investmentAnnualIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Annual Income</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-[#181920] text-white placeholder:text-gray-400"
                            placeholder="$250,000"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white">
                          I accept the{" "}
                          <a
                            href="/terms"
                            target="_blank"
                            className="text-[#E5CD82] hover:underline"
                          >
                            terms and conditions
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy"
                            target="_blank"
                            className="text-[#E5CD82] hover:underline"
                          >
                            privacy policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="referralToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Referral Token (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-[#181920] text-white placeholder:text-gray-400"
                          placeholder="Enter your referral token"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E5CD82]">
                  <Check className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-2xl font-semibold">
                  Welcome, {form.getValues("firstName")}!
                </h3>
                <p className="text-white/70">
                  Your account has been created successfully. You can now log in to access your account.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="mt-12 w-full"
              disabled={isPending}
            >
              {isPending ? (
                "Creating account..."
              ) : step === 6 ? (
                "Go to Login"
              ) : (
                <>
                  Continue <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
