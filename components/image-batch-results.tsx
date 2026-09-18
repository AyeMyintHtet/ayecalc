import ImageNextStep from "@/components/image-next-step";
import { formatImageBytes, type ImageFileRecord } from "@/lib/image-tools";
import type { ImageDestination } from "@/lib/image-handoff";
import styles from "@/components/image-tools.module.css";

export default function ImageBatchResults({
  items,
  isBusy,
  onRemove,
  current,
}: {
  items: ImageFileRecord[];
  isBusy: boolean;
  onRemove: (id: string) => void;
  current?: ImageDestination;
}) {
  return (
    <div className={styles.resultList}>
      {items.map((item) => (
        <article className={styles.resultItem} key={item.id}>
          <img
            src={item.result?.previewUrl ?? item.previewUrl}
            alt={`Preview of ${item.file.name}`}
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
          />
          <div className={styles.resultMeta}>
            <strong>{item.file.name}</strong>
            <span>
              {item.width} × {item.height}px ·{" "}
              {formatImageBytes(item.file.size)}
            </span>
            {item.result && (
              <span className={styles.resultSuccess}>
                {item.result.width} × {item.result.height}px ·{" "}
                {formatImageBytes(item.result.bytes)}
              </span>
            )}
            {item.status === "processing" && <span>Processing…</span>}
            {item.error && (
              <span className={styles.resultError}>{item.error}</span>
            )}
            {item.result?.warning && (
              <span className={styles.resultWarning}>
                {item.result.warning}
              </span>
            )}
            {item.result && !isBusy && (
              <ImageNextStep
                blob={item.result.blob}
                fileName={item.result.fileName}
                current={current}
              />
            )}
          </div>
          <div className={styles.itemActions}>
            {item.result ? (
              <a href={item.result.previewUrl} download={item.result.fileName}>
                Download
              </a>
            ) : (
              <span className={styles.statusPill}>{item.status}</span>
            )}
            <button
              type="button"
              aria-label={`Remove ${item.file.name}`}
              disabled={isBusy}
              onClick={() => onRemove(item.id)}
            >
              ×
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
