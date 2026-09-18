"use client";

import { useRouter } from "next/navigation";
import { stageImage, type ImageDestination } from "@/lib/image-handoff";
import styles from "@/components/image-tools.module.css";

export default function ImageNextStep({
  blob,
  fileName,
  current,
}: {
  blob: Blob;
  fileName: string;
  current?: ImageDestination;
}) {
  const router = useRouter();
  const destinations: Array<{ href: ImageDestination; label: string }> = [
    { href: "/image-resizer", label: "Resize" },
    { href: "/image-compressor", label: "Compress" },
    { href: "/image-format-converter", label: "Convert format" },
    { href: "/ai-image-upscaler", label: "AI upscale" },
  ];
  return (
    <div
      className={styles.presetRow}
      aria-label={`Continue editing ${fileName}`}
    >
      {destinations
        .filter((item) => item.href !== current)
        .map((item) => (
          <button
            type="button"
            key={item.href}
            onClick={() => {
              stageImage(
                new File([blob], fileName, { type: blob.type }),
                item.href,
              );
              router.push(item.href);
            }}
          >
            {item.label} →
          </button>
        ))}
    </div>
  );
}
