import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
import { authApi, areasApi } from "~/lib/api";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fiscalCode: z.string().min(1, "Fiscal code is required"),
  mobileFone: z.string().min(1, "Mobile phone is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  investmentMinValue: z.string().min(1, "Minimum investment value is required"),
  investmentMaxValue: z.string().min(1, "Maximum investment value is required"),
  investmentNetWorth: z.string().min(1, "Net worth is required"),
  investmentAnnualIncome: z.string().min(1, "Annual income is required"),
  about: z.string().optional(),
  birthDate: z.date({
    required_error: "Birth date is required",
  }),
  areas: z.array(z.number()).min(1, "At least one area is required"),
  referralToken: z.string().optional(),
});

export default function SignupInvestor() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      fiscalCode: "",
      mobileFone: "",
      city: "",
      country: "",
      investmentMinValue: "",
      investmentMaxValue: "",
      investmentNetWorth: "",
      investmentAnnualIncome: "",
      about: "",
      birthDate: new Date(),
      areas: [],
      referralToken: (router.query.referralToken as string) ?? "",
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
        areas: data.areas ?? [],
      });
    },
    onSuccess: () => {
      toast.success("Account created successfully!");
      void router.push("/login");
    },
    onError: (error: Error) => {
      toast.error("Failed to create account. Please try again.");
      console.error("Registration error:", error);
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    registerInvestor(data);
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="my-12 min-w-[40rem] max-w-[40rem] rounded-2xl border-4 border-white/10 bg-[#181920] bg-opacity-30 p-6 backdrop-blur-md">
        <button
          type="button"
          className="flex items-center gap-2 hover:opacity-75"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h2 className="mt-8 text-center text-4xl font-semibold">
          Your account as <br />
          <span className="text-[#E5CD82]">Investor</span>
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fiscalCode"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Fiscal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your fiscal code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobileFone"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Mobile Phone</FormLabel>
                  <FormControl>
                    <PhoneInput
                      placeholder="Enter your phone number"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="investmentMinValue"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Min Investment</FormLabel>
                    <FormControl>
                      <Input placeholder="$10,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investmentMaxValue"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Max Investment</FormLabel>
                    <FormControl>
                      <Input placeholder="$100,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="investmentNetWorth"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Net Worth</FormLabel>
                    <FormControl>
                      <Input placeholder="$1,000,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investmentAnnualIncome"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Annual Income</FormLabel>
                    <FormControl>
                      <Input placeholder="$250,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="mt-4 flex flex-col">
                  <FormLabel>Birth Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
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
                    <PopoverContent className="w-auto p-0" align="start">
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

            <FormField
              control={form.control}
              name="areas"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Investment Areas</FormLabel>
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

            <Button type="submit" className="mt-12 w-full" disabled={isPending}>
              {isPending ? (
                "Creating account..."
              ) : (
                <>
                  Create Account <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
