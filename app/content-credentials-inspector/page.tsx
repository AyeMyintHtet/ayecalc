import ContentCredentialsInspector from "@/components/content-credentials-inspector";
import DeveloperToolPage from "@/components/developer-tool-page";
import {
  createDeveloperToolMetadata,
  getDeveloperTool,
} from "@/lib/developer-tools";

const tool = getDeveloperTool("content-credentials-inspector")!;

export const metadata = createDeveloperToolMetadata(tool);

export default function ContentCredentialsInspectorPage() {
  return (
    <DeveloperToolPage tool={tool}>
      <ContentCredentialsInspector />
    </DeveloperToolPage>
  );
}
