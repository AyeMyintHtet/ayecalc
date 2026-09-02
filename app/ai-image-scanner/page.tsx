import AiImageScanner from "@/components/ai-image-scanner";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("ai-image-scanner")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function AiImageScannerPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <AiImageScanner />
    </DeveloperToolPage>
  );
}
