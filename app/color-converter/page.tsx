import ColorConverter from "@/components/color-converter";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("color-converter")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function ColorConverterPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <ColorConverter />
    </DeveloperToolPage>
  );
}
