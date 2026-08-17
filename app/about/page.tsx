import InfoPage from "@/components/info-page";
import { createInfoPageMetadata, getInfoPage } from "@/lib/info-pages";

const page = getInfoPage("about")!;

export const metadata = createInfoPageMetadata(page);

export default function AboutPage() {
  return <InfoPage page={page} />;
}
