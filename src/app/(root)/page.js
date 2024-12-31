import Hero from "@/components/hero";
import Pricing from "@/components/pricing";

export default function Home() {
  return (
    <main className="flex flex-col min-h-dvh">
      <Hero />
      <Pricing />
    </main>
  );
}