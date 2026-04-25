import Banner from "@/features/Home/component/Banner";
import Navbar from "@/components/sheard/website/Navbar";
import Footer from "@/components/sheard/website/Footer";
import VerifyAnyDevices from "@/features/Home/component/VerifyAnyDevices";
import ImportantWarning from "@/features/Home/component/ImportantWarning";
import ExperienceSmarter from "@/features/Home/component/ExperienceSmarter";
import AIPoweredInsights from "@/features/Home/component/AIPoweredInsights";
import ForTheSmartBuyer from "@/features/Home/component/ForTheSmartBuyer";
import Pricing from "@/features/Home/component/Pricing";
import Review from "@/features/Home/component/Review";
import StartChecking from "@/features/Home/component/StartChecking";

export default function Home() {
  return (
    <main>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Banner />
      </div>
      <VerifyAnyDevices />
      <ExperienceSmarter />
      <ImportantWarning />
      <ForTheSmartBuyer />
      <AIPoweredInsights />
      <Pricing />
      <Review />
      <StartChecking />
      <Footer />
    </main>
  );
}
