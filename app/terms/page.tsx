import InfoPage from "@/components/info-page";
import { createInfoPageMetadata, getInfoPage } from "@/lib/info-pages";

const page = getInfoPage("terms")!;

export const metadata = createInfoPageMetadata(page);

export default function TermsPage() {
  return <InfoPage page={page} />;
}
