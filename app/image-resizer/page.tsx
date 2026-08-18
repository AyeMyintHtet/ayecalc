import DeveloperToolPage from "@/components/developer-tool-page";
import { ImageResizer } from "@/components/image-batch-tool";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("image-resizer")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function ImageResizerPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <ImageResizer />
    </DeveloperToolPage>
  );
}
