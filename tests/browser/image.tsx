import type { ImageProps } from "next/image";

// The isolated Vite harness uses native images; the real Next.js page is tested separately.
export default function TestImage({ src, alt, width, height, className, onError }: ImageProps) {
  const path = typeof src === "string" ? src : "default" in src ? src.default.src : src.src;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={path} alt={alt} width={width} height={height} className={className} onError={onError} />;
}
