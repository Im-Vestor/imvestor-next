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
import { authApi, skillsApi } from "~/lib/api";
import { cn } from "~/lib/utils";

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
});

export default function SignupEntrepreneur() {
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
      birthDate: new Date(),
      skills: [],
      referralToken: (router.query.referralToken as string) ?? "",
    },
  });

  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: skillsApi.getSkillsList,
  });

  const { mutate: registerEntrepreneur, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return authApi.registerEntrepreneur({
        ...data,
        birthDate: format(data.birthDate, "yyyy-MM-dd"),
        skills: data.skills ?? [],
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    registerEntrepreneur(data);
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
          <span className="text-[#E5CD82]">Entrepreneur</span>
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="mt-4">
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
                  <FormItem className="mt-4">
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
              name="email"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="bg-[#181920] text-white placeholder:text-gray-400"
                      placeholder="john@example.com"
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
                <FormItem className="mt-4">
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="bg-[#181920] text-white placeholder:text-gray-400"
                      placeholder="********"
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
                <FormItem className="mt-4">
                  <FormLabel className="text-white">Fiscal Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-[#181920] text-white placeholder:text-gray-400"
                      placeholder="Enter your fiscal code"
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
                <FormItem className="mt-4">
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
                <FormItem className="mt-4 flex flex-col">
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

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-white">Skills</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={
                        skills?.map((skill) => ({
                          label: skill.description,
                          value: skill.id.toString(),
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