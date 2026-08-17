import CssUnitMatrix from "@/components/css-unit-matrix";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("rem-em-px-converter")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function RemEmPxConverterPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <CssUnitMatrix />
    </DeveloperToolPage>
  );
}
