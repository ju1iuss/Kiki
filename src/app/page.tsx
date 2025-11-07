import HeroSection from "@/components/hero-section";
// import Testimonials from "@/components/testimonials";
import PricingComparator from "@/components/pricing-comparator";
import Features from "@/components/features-4";
import Features6 from "@/components/features-6";
import Pricing from "@/components/pricing";
import FAQsThree from "@/components/faqs-3";
import FooterSection from "@/components/footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <Features />
      {/* <Testimonials /> */}
      <Features6 />
      <PricingComparator />
      <Pricing />
      <FAQsThree />
      <FooterSection />
    </>
  );
}
