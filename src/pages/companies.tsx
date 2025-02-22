import { useQuery } from "@tanstack/react-query";
import { CircleUserRound, SearchIcon, UserRoundIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Header } from "~/components/header";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { areasApi, type ProjectResponse } from "~/lib/api";

const COMPANY_STAGES = [
  "Pre-seed",
  "Seed",
  "Serie A",
  "Serie B",
  "Serie C",
  "Serie D",
  "IPO",
];

export default function Companies() {
  const router = useRouter();
  const [companies, setCompanies] = useState<ProjectResponse[]>([]);
  const [showAllAreas, setShowAllAreas] = useState(false);

  const { data: areas } = useQuery({
    queryKey: ["areas"],
    queryFn: areasApi.getAreasList,
  });

  const visibleAreas = showAllAreas ? areas : areas?.slice(0, 3);

  // useQuery({
  //   queryKey: ["companies"],
  //   queryFn: async () => {
  //     const response = await projectApi.getEntrepreneurProjects();
  //     setCompanies(response);
  //   },
  // });

  // if user type is entrepreneur, go back to profile page
  useEffect(() => {
    const userType = sessionStorage.getItem("type");
    if (userType === "ENTREPRENEUR") {
      void router.push("/profile");
    }
  }, [router]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-8">
      <Header />
      <div className="mt-12">
        <div className="flex rounded-xl border-2 border-white/10 bg-gradient-to-b from-[#20212B] to-[#242834] px-16 py-12">
          <div className="w-1/5">
            <p className="font-medium">Sector</p>
            <div className="ml-2 mt-1.5 flex flex-col max-w-[150px]">
              {visibleAreas?.map((area) => (
                <div key={area.id} className="flex items-center gap-2">
                  <Checkbox id={area.id.toString()} />
                  <p key={area.id} className="text-sm">
                    {area.name}
                  </p>
                </div>
              ))}
              {areas && areas.length > 3 && (
                <button
                  onClick={() => setShowAllAreas(!showAllAreas)}
                  className="mt-1 text-sm text-start text-white/50 hover:text-white hover:underline"
                >
                  {showAllAreas ? (
                    "Show less"
                  ) : (
                    `See more (${areas.length - 3})`
                  )}
                </button>
              )}
            </div>
            <p className="mt-2 font-medium">Investor Slots</p>
            <div className="ml-2 mt-1.5 flex flex-col">
              <div className="flex items-center gap-2">
                <Checkbox id="1" />
                <p className="text-sm">1 - 5</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="2" />
                <p className="text-sm">N/E</p>
              </div>
            </div>
            <p className="mt-2 font-medium">Stage</p>
            <div className="ml-2 mt-1.5 flex flex-col">
              {COMPANY_STAGES.map((stage) => (
                <div key={stage} className="flex items-center gap-2">
                  <Checkbox id={stage} />
                  <p className="text-sm">{stage}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 font-medium">Revenue</p>
            <div className="ml-2 mt-1.5 flex flex-col">
              <div className="flex items-center gap-2">
                <Checkbox id="1" />
                <p className="text-sm">Less than $100k</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="2" />
                <p className="text-sm">$100k - $500k</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="3" />
                <p className="text-sm">$500k - $1M</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="4" />
                <p className="text-sm">$1M - $5M</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="5" />
                <p className="text-sm">$5M+</p>
              </div>
            </div>
            <p className="mt-2 font-medium">Initial Investment</p>
            <div className="ml-2 mt-1.5 flex flex-col">
              <div className="flex items-center gap-2">
                <Checkbox id="1" />
                <p className="text-sm">Less than $100k</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="2" />
                <p className="text-sm">$100k - $500k</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="3" />
                <p className="text-sm">$500k - $1M</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="4" />
                <p className="text-sm">$1M - $5M</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="5" />
                <p className="text-sm">$5M+</p>
              </div>
            </div>
          </div>
          <div className="w-4/5">
            <div className="flex items-center rounded-md bg-[#282A37]">
              <SearchIcon className="ml-3 h-5 w-5 text-white" />
              <Input placeholder="Search" className="bg-transparent" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-white/50">Showing 0 of 0 companies</p>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <CompanyCard />
              <CompanyCard />
              <CompanyCard />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function CompanyCard() {
  return (
    <div className="rounded-xl border-2 border-white/10 bg-[#1E202A] p-6">
      <div className="flex gap-6 mb-4">
        <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src="https://cloudfront-us-east-1.images.arcpublishing.com/estadao/PQS5HFKS3FNJTHE7HUDVWTHDIU.jpg"
            alt="Company Logo"
            width={72}
            height={72}
            className="h-full w-full rounded-md object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Airbnb</h3>
            </div>
            <span className="text-white/70">San Francisco, CA, USA</span>
            <p>Book accommodations around the world.</p>
          </div>
        </div>
      </div>
      <span className="rounded-full bg-[#323645] px-6 py-1 font-light">
        Accomodations
      </span>
      <hr className="my-4 border-white/10" />
      <div className="flex items-center gap-2">
        <UserRoundIcon className="h-4 w-4 text-white/50" />
        <p className="text-sm text-white/50">Founded by</p>
        <span className=" text-[#EFD687]">Guilherme</span>
        <div className="ml-auto flex space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <CircleUserRound
              key={i}
              color="#EFD687"
              className="h-4 w-4"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
