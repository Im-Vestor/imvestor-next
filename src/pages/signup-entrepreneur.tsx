import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { PhoneInput } from "~/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { authApi, skillsApi, type RegisterEntrepreneurRequest } from "~/lib/api";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fiscalCode: z.string().min(1, "Fiscal code is required"),
  mobileFone: z.string().min(1, "Mobile phone is required"),
  birthDate: z.string().min(1, "Birth date is required"),
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
      birthDate: "",
      skills: [],
      referralToken: (router.query.referralToken as string) ?? "",
    },
  });

  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: skillsApi.getSkillsList,
  });

  const { mutate: registerEntrepreneur, isPending } = useMutation({
    mutationFn: (data: RegisterEntrepreneurRequest) => authApi.registerEntrepreneur(data),
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
    registerEntrepreneur({
      ...data,
      skills: data.skills ?? [],
    });
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#181920] py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-[#E5CD82]">
          Sign up as Entrepreneur
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Create your entrepreneur account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#282B37] px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="bg-[#181920] text-white placeholder:text-gray-400"
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
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="bg-[#181920] text-white placeholder:text-gray-400"
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
                    <FormLabel className="text-white">Fiscal Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#181920] text-white placeholder:text-gray-400"
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
                    <FormLabel className="text-white">Mobile Phone</FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        className="bg-[#181920] text-white"
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
                  <FormItem>
                    <FormLabel className="text-white">Birth Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="bg-[#181920] text-white placeholder:text-gray-400"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Skills</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange([...(field.value ?? []), Number(value)])
                      }
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#181920] text-white">
                          <SelectValue placeholder="Select your skills" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {skills?.map((skill) => (
                          <SelectItem
                            key={skill.id}
                            value={skill.id.toString()}
                            className="cursor-pointer"
                          >
                            {skill.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(field.value ?? []).map((skillId) => {
                        const skill = skills?.find((s) => s.id === skillId);
                        return (
                          <div
                            key={skillId}
                            className="flex items-center gap-1 rounded bg-[#E5CD82] px-2 py-1 text-xs text-black"
                          >
                            {skill?.description ?? skillId}
                            <button
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  (field.value ?? []).filter((s) => s !== skillId)
                                )
                              }
                              className="ml-1 text-xs font-bold"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  "Creating account..."
                ) : (
                  <>
                    Sign Up <ArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
} 