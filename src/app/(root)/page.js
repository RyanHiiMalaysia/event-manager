import Hero from "@/components/hero";
import Pricing from "@/components/pricing";
import Faq from "@/components/faq";
import Footer from "@/components/footer";
import HowItWorks from "@/components/howitworks";

export default function Home() {
  return (
    <main className="flex flex-col min-h-dvh">
      <Hero />
      <HowItWorks />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}