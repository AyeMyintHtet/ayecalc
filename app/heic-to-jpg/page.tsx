import HeicConverter from "@/components/heic-converter";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("heic-to-jpg")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function HeicToJpgPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <HeicConverter />
    </DeveloperToolPage>
  );
}
