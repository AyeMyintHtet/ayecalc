import InfoPage from "@/components/info-page";
import { createInfoPageMetadata, getInfoPage } from "@/lib/info-pages";

const page = getInfoPage("privacy")!;

export const metadata = createInfoPageMetadata(page);

export default function PrivacyPage() {
  return <InfoPage page={page} />;
}
