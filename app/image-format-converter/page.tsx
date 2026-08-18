import DeveloperToolPage from "@/components/developer-tool-page";
import { ImageFormatConverter } from "@/components/image-batch-tool";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("image-format-converter")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function ImageFormatConverterPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <ImageFormatConverter />
    </DeveloperToolPage>
  );
}
