import DeveloperToolPage from "@/components/developer-tool-page";
import { ImageCompressor } from "@/components/image-batch-tool";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("image-compressor")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function ImageCompressorPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <ImageCompressor />
    </DeveloperToolPage>
  );
}
