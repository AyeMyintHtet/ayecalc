import BackgroundRemover from "@/components/background-remover";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("background-remover")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function BackgroundRemoverPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <BackgroundRemover />
    </DeveloperToolPage>
  );
}
