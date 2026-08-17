import InfoPage from "@/components/info-page";
import { createInfoPageMetadata, getInfoPage } from "@/lib/info-pages";

const page = getInfoPage("methodology")!;

export const metadata = createInfoPageMetadata(page);

export default function MethodologyPage() {
  return <InfoPage page={page} />;
}
