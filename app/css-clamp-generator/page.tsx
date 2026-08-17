import ClampGenerator from "@/components/clamp-generator";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("css-clamp-generator")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function CssClampGeneratorPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <ClampGenerator />
    </DeveloperToolPage>
  );
}
