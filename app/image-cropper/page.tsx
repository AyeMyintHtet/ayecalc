import DeveloperToolPage from "@/components/developer-tool-page";
import ImageCropper from "@/components/image-cropper";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("image-cropper")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function ImageCropperPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <ImageCropper />
    </DeveloperToolPage>
  );
}
