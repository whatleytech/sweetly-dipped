import { HeroSection } from "../components/HeroSection/HeroSection";
import { TreatsGrid } from "../components/TreatsGrid/TreatsGrid";
import { PackagesTable } from "../components/PackagesTable/PackagesTable";
import { CtaBand } from "../components/CtaBand/CtaBand";

export const LandingPage = () => {
  const handleStartOrder = () => {
    // TODO: Implement order funnel navigation
    console.log("Start order clicked");
  };

  return (
    <div>
      <HeroSection />
      <TreatsGrid />
      <PackagesTable />
      <CtaBand onStartOrder={handleStartOrder} />
    </div>
  );
};
