import { HeroSection } from "../components/HeroSection/HeroSection";
import { TreatsGrid } from "../components/TreatsGrid/TreatsGrid";
import { PackagesTable } from "../components/PackagesTable/PackagesTable";

export const LandingPage = () => {
  return (
    <div>
      <HeroSection />
      <TreatsGrid />
      <PackagesTable />
    </div>
  );
};
