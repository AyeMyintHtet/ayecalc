import { BatchWatermarkImages } from "@/components/image-batch-tool";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("batch-watermark-images")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function BatchWatermarkImagesPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <BatchWatermarkImages />
    </DeveloperToolPage>
  );
}
