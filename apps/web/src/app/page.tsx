import { Hero } from "../components/hero/hero";
import { SectionStage } from "../components/site/section-stage";
import { WorkSection } from "../components/work/work-section";

export default function Page() {
  return (
    <main id="main">
      <SectionStage isFirst number={1}>
        <Hero />
      </SectionStage>
      <WorkSection />
    </main>
  );
}
