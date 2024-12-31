import Hero from "@/components/hero";
import Pricing from "@/components/pricing";
import Faq from "@/components/faq";

export default function Home() {
  return (
    <main className="flex flex-col min-h-dvh">
      <Hero />
      <Pricing />
      <Faq />
    </main>
  );
}