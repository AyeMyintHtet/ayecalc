import DeveloperToolPage from "@/components/developer-tool-page";
import ViewportUnitConverter from "@/components/viewport-unit-converter";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("viewport-unit-converter")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function ViewportUnitConverterPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <ViewportUnitConverter />
    </DeveloperToolPage>
  );
}
