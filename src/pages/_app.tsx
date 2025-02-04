import type { AppType } from "next/app";
import { Roboto } from "next/font/google";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import "~/styles/globals.css";
import { Toaster } from "~/components/ui/sonner";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans",
});

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Imvestor</title>
        <meta name="description" content="Imvestor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${roboto.className} ${roboto.variable} bg-gradient-to-b from-[#20212B] to-[#252935] text-white`}>
        <Component {...pageProps} />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
};

export default MyApp;
