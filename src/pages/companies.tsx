import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Header } from "~/components/header";
import { projectApi, type ProjectResponse } from "~/lib/api";
export default function Companies() {
  const [companies, setCompanies] = useState<ProjectResponse[]>([]);

  useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await projectApi.getProjects();
      setCompanies(response);
    },
  });

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-8">
      <Header />
      <div className="mt-12">
        <div className="space-y-6 rounded-xl border-2 border-white/10 bg-gradient-to-b from-[#20212B] to-[#242834] px-16 py-8">
          <h1 className="text-lg font-bold">Create Company</h1>
        </div>
      </div>
    </main>
  );
}
