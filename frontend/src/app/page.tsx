import NewHero from "@/components/NewHero";
import Awaereness from "../components/Awareness";
import Faq from "../components/Faq";
import Footer from "../components/Footer";
import Try from "../components/Try-section/Try";
import WorkGuide from "../components/WorkGuide";

export default function Home() {
  return (
    <main>
      <NewHero />
      <Awaereness />
      <WorkGuide />
      <Try />
      <Faq />
      <Footer />
    </main>
  );
}
