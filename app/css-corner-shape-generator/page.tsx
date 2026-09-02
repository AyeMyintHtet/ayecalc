import CssCornerShapeGenerator from "@/components/css-corner-shape-generator";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("css-corner-shape-generator")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function CssCornerShapeGeneratorPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <CssCornerShapeGenerator />
    </DeveloperToolPage>
  );
}
