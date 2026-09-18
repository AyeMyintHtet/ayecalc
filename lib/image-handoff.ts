export type ImageDestination =
  | "/image-resizer"
  | "/image-compressor"
  | "/image-format-converter"
  | "/ai-image-upscaler";
let pending: {
  file: File;
  destination: ImageDestination;
  expires: number;
} | null = null;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;

/** Only RAM is used. A refresh, consumption, or five-minute expiry clears the file. */
export function stageImage(file: File, destination: ImageDestination) {
  clearTimeout(expiryTimer);
  pending = { file, destination, expires: Date.now() + 5 * 60_000 };
  expiryTimer = setTimeout(() => {
    pending = null;
  }, 5 * 60_000);
}
export function takeStagedImage(destination: ImageDestination) {
  if (!pending || pending.destination !== destination) return null;
  const value = pending;
  pending = null;
  clearTimeout(expiryTimer);
  return value.expires > Date.now() ? value.file : null;
}
