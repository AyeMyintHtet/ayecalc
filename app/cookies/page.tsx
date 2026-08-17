import InfoPage from "@/components/info-page";
import { createInfoPageMetadata, getInfoPage } from "@/lib/info-pages";

const page = getInfoPage("cookies")!;

export const metadata = createInfoPageMetadata(page);

export default function CookiesPage() {
  return <InfoPage page={page} />;
}
