import Link from "next/link";
import ImageUpscaler from "@/components/image-upscaler";
import DeveloperToolPage from "@/components/developer-tool-page";
import { createDeveloperToolMetadata } from "@/lib/developer-tools";
import { upscalerTool } from "@/lib/upscaler-tool";
import styles from "@/components/tool-page.module.css";

export const metadata = createDeveloperToolMetadata(upscalerTool);

export default function AiImageUpscalerPage() {
  return (
    <DeveloperToolPage tool={upscalerTool}>
      <ImageUpscaler />
      <div className={styles.heroFacts}>
        <Link href="/guides/ai-upscaling-vs-resizing">
          AI upscaling vs. resizing
        </Link>
        <Link href="/heic-to-jpg">Convert HEIC photos first</Link>
        <Link href="/privacy">Privacy details</Link>
      </div>
    </DeveloperToolPage>
  );
}
