/*
 * Site photos are self-hosted WebP files in client/public/images, each in two widths:
 *   name-360.webp  (cards on normal screens, thumbnails)
 *   name-720.webp  (cards on high-density screens)
 * The hero and about photos have their own widths (see the files).
 *
 * Product data stores the 720 version; these helpers derive the srcset so the browser
 * downloads only the size it needs. To add a photo, run it through the same conversion
 * (WebP, quality ~72) at 360 and 720 wide and name it the same way.
 */

const SIZED = /-(\d+)\.webp$/;

/** srcset for a product photo: "…-360.webp 360w, …-720.webp 720w" */
export function productSrcSet(src: string): string | undefined {
  if (!SIZED.test(src)) return undefined; // external or unsized image: no srcset
  const base = src.replace(SIZED, "");
  return `${base}-360.webp 360w, ${base}-720.webp 720w`;
}

/** The small (360px) version, for thumbnails */
export function productThumb(src: string): string {
  return SIZED.test(src) ? src.replace(SIZED, "-360.webp") : src;
}

/** `sizes` for the product grid: 2 columns on phones, 4 on desktop (max ~290px each) */
export const PRODUCT_CARD_SIZES = "(min-width: 1024px) 290px, 46vw";
