import ContrastChecker from "@/components/contrast-checker";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("contrast-checker")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function ContrastCheckerPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <ContrastChecker />
    </DeveloperToolPage>
  );
}
