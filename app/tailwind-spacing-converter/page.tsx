import DeveloperToolPage from "@/components/developer-tool-page";
import TailwindSpacingConverter from "@/components/tailwind-spacing-converter";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("tailwind-spacing-converter")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function TailwindSpacingConverterPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <TailwindSpacingConverter />
    </DeveloperToolPage>
  );
}
