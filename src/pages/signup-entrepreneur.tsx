import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SignUpCard } from "~/components/sign-up-card";
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
import { PhoneInput } from "~/components/ui/phone-input";
import { PopoverContent } from "~/components/ui/popover";
import { authApi } from "~/lib/api";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fiscalCode: z.string().min(1, "Fiscal code is required"),
  mobileFone: z.string().min(1, "Mobile phone is required"),
  birthDate: z.date({
    required_error: "Birth date is required",
  }),
  skills: z.array(z.number()).default([]),
  referralToken: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export default function SignupEntrepreneur() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      fiscalCode: "",
      mobileFone: "",
      birthDate: undefined,
      skills: [],
      referralToken: "",
      acceptTerms: false,
    },
  });

  const { mutate: registerEntrepreneur, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return authApi.registerEntrepreneur({
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
    registerEntrepreneur(data);
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="my-12 min-w-[40rem] max-w-[40rem] rounded-2xl border-4 border-white/10 bg-[#181920] bg-opacity-30 p-6 backdrop-blur-md">
        <button
          type="button"
          className="flex items-center gap-2 hover:opacity-75"
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            {step === 1 && (
              <>
                <h2 className="my-8 text-center text-4xl font-semibold">
                  Your account as <br />
                  <span className="text-[#E5CD82]">Entrepreneur</span>
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
                </div>
              </>
            )}
            {step === 2 && (
              <>
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
              </>
            )}
            {step === 3 && (
              <SignUpCard
                name={
                  form.getValues("firstName") + " " + form.getValues("lastName")
                }
                type="entrepreneur"
                features={[
                  "1 active project at a time",
                  "Up to 5 investors per project",
                  "Investor Search",
                  "View investor profiles",
                  "1 free pokes per month",
                ]}
              />
            )}
            {step === 4 && <>
              
            </>}
            {step === 4 ? (
              <Button
                type="submit"
                className="mt-12 w-full"
                disabled={isPending || !form.formState.isValid}
              >
                {isPending
                  ? "Creating account..."
                  : form.formState.isValid
                    ? "Go to Login"
                    : "Please fill all the fields"}
              </Button>
            ) : (
              <Button
                type="button"
                className="mt-12 w-full"
                onClick={() => setStep(step + 1)}
              >
                {step === 3 ? "Take your pass" : "Continue"}{" "}
                <ArrowRight className="ml-2" />
              </Button>
            )}
          </form>
        </Form>
      </div>
    </main>
  );
}
