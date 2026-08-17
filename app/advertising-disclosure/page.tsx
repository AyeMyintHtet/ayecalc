import InfoPage from "@/components/info-page";
import { createInfoPageMetadata, getInfoPage } from "@/lib/info-pages";

const page = getInfoPage("advertising-disclosure")!;

export const metadata = createInfoPageMetadata(page);

export default function AdvertisingDisclosurePage() {
  return <InfoPage page={page} />;
}
