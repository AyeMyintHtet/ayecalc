import InfoPage from "@/components/info-page";
import { createInfoPageMetadata, getInfoPage } from "@/lib/info-pages";

const page = getInfoPage("disclaimer")!;

export const metadata = createInfoPageMetadata(page);

export default function DisclaimerPage() {
  return <InfoPage page={page} />;
}
