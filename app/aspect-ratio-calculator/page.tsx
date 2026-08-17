import AspectRatioCalculator from "@/components/aspect-ratio-calculator";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("aspect-ratio-calculator")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function AspectRatioCalculatorPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <AspectRatioCalculator />
    </DeveloperToolPage>
  );
}
