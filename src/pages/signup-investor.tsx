import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FinishCard } from "~/components/finish-card";
import { Header } from "~/components/header";
import { SignUpCard } from "~/components/sign-up-card";
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
import { areasApi, authApi } from "~/lib/api";

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
  acceptConfidentiality: z.boolean().refine((val) => val === true, {
    message: "You must accept the confidentiality agreement",
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
      birthDate: undefined,
      areas: [],
      referralToken: (router.query.referralToken as string) ?? "",
      acceptTerms: false,
      acceptConfidentiality: false,
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
      setStep(step + 1);
    },
    onError: (error) => {
      toast.error("Failed to create account. Please try again.");
      console.error("Registration error:", error);
    },
  });

  const formatCurrency = (value: number) => {
    if (value >= 5000000) return "5M+";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="mt-4 w-full md:min-w-[80rem] md:max-w-[80rem]">
        <Header />
      </div>
      <div
        className={`md:max-w-[40rem] ${step !== 7 && "rounded-2xl border-4 border-white/10 bg-[#181920] bg-opacity-30 p-6 backdrop-blur-md"}`}
      >
        {step !== 7 && (
          <button
            type="button"
            className="flex items-center gap-2 hover:opacity-75"
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        <Form {...form}>
          <form className="mt-8">
            {step === 1 && (
              <div className="md:min-w-[30rem] md:max-w-[30rem]">
                <h2 className="my-8 text-center text-4xl font-semibold">
                  Your account as <br />
                  <span className="text-[#E5CD82]">Investor</span>
                </h2>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="First Name*"
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
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Last Name*"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Email*"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Password*"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fiscalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Fiscal Code*"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobileFone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PhoneInput
                            {...field}
                            placeholder="999 999 999"
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="border-none"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span className="font-normal text-[#E5E7EA]">
                                    Birth Date*
                                  </span>
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
                                date > new Date() ||
                                date < new Date("1900-01-01")
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
              </div>
            )}

            {step === 2 && (
              <div className="md:min-w-[30rem] md:max-w-[30rem]">
                <h2 className="my-8 text-center text-4xl font-semibold">
                  Select your <br />
                  <span className="text-[#E5CD82]">Investment Areas</span>
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="areas"
                    render={({ field }) => (
                      <FormItem>
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
              </div>
            )}

            {step === 3 && (
              <div className="md:min-w-[30rem] md:max-w-[30rem]">
                <h2 className="my-8 text-center text-4xl font-semibold">
                  What are your <br />
                  <span className="text-[#E5CD82]">Investment capacity?</span>
                </h2>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="investmentMinValue"
                      render={({ field: minField }) => (
                        <FormField
                          control={form.control}
                          name="investmentMaxValue"
                          render={({ field: maxField }) => (
                            <FormItem>
                              <FormLabel className="text-white">
                                Investment Range
                              </FormLabel>
                              <FormControl>
                                <div className="space-y-4">
                                  <Slider
                                    min={2500}
                                    max={5000000}
                                    step={2500}
                                    minStepsBetweenThumbs={1}
                                    value={[
                                      Number(minField.value || "2500"),
                                      Number(maxField.value || "5000000"),
                                    ]}
                                    onValueChange={([min, max]) => {
                                      if (min && max) {
                                        minField.onChange(min.toString());
                                        maxField.onChange(max.toString());
                                      }
                                    }}
                                    className="py-4"
                                  />
                                  <div className="flex justify-between text-sm text-white/70">
                                    <span>$2.5K</span>
                                    <div className="space-x-2">
                                      <span>
                                        {formatCurrency(
                                          Number(minField.value) || 2500,
                                        )}
                                      </span>
                                      <span>-</span>
                                      <span>
                                        {formatCurrency(
                                          Number(maxField.value) || 5000000,
                                        )}
                                      </span>
                                    </div>
                                    <span>$5M+</span>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="investmentNetWorth"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Net Worth*"
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
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Annual Income*"
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
              <div className="md:min-w-[25rem] md:max-w-[25rem]">
                <h2 className="mt-8 mb-12 text-center text-4xl font-semibold">
                  Terms & <span className="text-[#E5CD82]">Conditions</span>
                </h2>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-gray-400 bg-white data-[state=checked]:bg-[#E5CD82]"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the terms and conditions
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="acceptConfidentiality"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-gray-400 bg-white data-[state=checked]:bg-[#E5CD82]"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the confidentiality agreement
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="min-w-[20rem] md:min-w-[30rem] md:max-w-[30rem]">
                <h2 className="my-8 text-center text-4xl font-semibold">
                  Were you <br />
                  <span className="text-[#E5CD82]">referred?</span>
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="referralToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Referral Token (optional)"
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

            {step === 6 && (
              <SignUpCard
                name={
                  form.getValues("firstName") + " " + form.getValues("lastName")
                }
                type="investor"
                features={[
                  "See all our projects",
                  "See entrepreneur profiles",
                  "Filter Projects",
                  "Meetings",
                  "Interests Match Notifications",
                ]}
              />
            )}

            {step === 7 && <FinishCard name={form.getValues("firstName")} />}

            {step !== 7 && (
              <Button
                type="button"
                className="mt-12 w-full"
                disabled={isPending}
                onClick={async () => {
                  let isValid = false;

                  switch (step) {
                    case 1:
                      isValid = await form.trigger([
                        "firstName",
                        "lastName",
                        "email",
                        "password",
                        "fiscalCode",
                        "mobileFone",
                        "birthDate",
                      ]);
                      break;
                    case 2:
                      isValid = await form.trigger("areas");
                      break;
                    case 3:
                      isValid = await form.trigger([
                        "investmentMinValue",
                        "investmentMaxValue",
                        "investmentNetWorth",
                        "investmentAnnualIncome",
                      ]);
                      break;
                    case 4:
                      isValid = await form.trigger("acceptTerms");
                      break;
                    case 5:
                      isValid = true; // Referral token is optional
                      if (isValid) {
                        registerInvestor(form.getValues());
                        return;
                      }
                      break;
                    case 6:
                      isValid = true;
                      break;
                  }

                  if (isValid) {
                    setStep(step + 1);
                  } else {
                    console.error("Invalid form");
                    console.log(form.formState.errors);
                  }
                }}
              >
                {isPending ? (
                  "Creating account..."
                ) : step === 6 ? (
                  "Take your pass"
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            )}
          </form>
        </Form>
      </div>
    </main>
  );
}
