/*
 * Lets any part of the page (e.g. the hero's range tiles) open the products
 * section on a given range. ProductsSection listens for this event.
 */

import { scrollToTarget } from "./smoothScroll";

/** Filter ids understood by ProductsSection: "all", a category id, or a group below */
export const FILTER_GROUPS: Record<string, string[]> = {
  wors: ["boerewors", "drywors"],
  extras: ["SHOTS", "sauces"],
};

export const SHOP_FILTER_EVENT = "shweet:shop-filter";

export function openShop(filter: string) {
  window.dispatchEvent(new CustomEvent(SHOP_FILTER_EVENT, { detail: { filter } }));
  scrollToTarget("#products");
}
