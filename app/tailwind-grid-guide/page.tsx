import DeveloperToolPage from "@/components/developer-tool-page";
import TailwindGridBuilder from "@/components/tailwind-grid-builder";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("tailwind-grid-guide")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function TailwindGridGuidePage() {
  return (
    <DeveloperToolPage tool={tool}>
      <TailwindGridBuilder />
    </DeveloperToolPage>
  );
}
