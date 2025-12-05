import { WishlistItem } from "@/types/product";

const WISHLIST_STORAGE_KEY = "fanrc_wishlist";

export const getWishlist = (): WishlistItem[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveWishlist = (items: WishlistItem[]): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save wishlist:", error);
  }
};

export const addToWishlist = (item: WishlistItem): void => {
  const currentWishlist = getWishlist();
  const existingIndex = currentWishlist.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  );

  if (existingIndex >= 0) {
    currentWishlist[existingIndex].quantity += item.quantity;
  } else {
    currentWishlist.push(item);
  }

  saveWishlist(currentWishlist);
};

export const removeFromWishlist = (productId: number, variantId?: number): void => {
  const currentWishlist = getWishlist();
  const filtered = currentWishlist.filter(
    (item) => !(item.productId === productId && item.variantId === variantId)
  );
  saveWishlist(filtered);
};

export const clearWishlist = (): void => {
  saveWishlist([]);
};

export const isInWishlist = (productId: number, variantId?: number): boolean => {
  const wishlist = getWishlist();
  return wishlist.some(
    (item) => item.productId === productId && item.variantId === variantId
  );
};

export const formatWishlistForMessenger = (items: WishlistItem[], products: any[]): string => {
  let message = "Hi Fan RC! I'm interested in purchasing the following items:\n\n";
  
  items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const variant = item.variantId
        ? product.variants.find((v: any) => v.id === item.variantId)
        : product.variants[0];
      
      const variantTitle = variant ? ` - ${variant.title}` : "";
      const price = variant ? (variant.price / 100).toFixed(2) : (product.variants[0].price / 100).toFixed(2);
      
      message += `• ${product.title}${variantTitle}\n`;
      message += `  SKU: ${variant?.sku || product.variants[0].sku}\n`;
      message += `  Quantity: ${item.quantity}\n`;
      message += `  Price: $${price}\n`;
      message += `  URL: ${product.url}\n\n`;
    }
  });

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const variant = item.variantId
        ? product.variants.find((v: any) => v.id === item.variantId)
        : product.variants[0];
      const price = variant ? variant.price : product.variants[0].price;
      return sum + price * item.quantity;
    }
    return sum;
  }, 0);

  message += `Total: $${(total / 100).toFixed(2)}\n\n`;
  message += "Please let me know if these items are available and how to proceed with the purchase. Thank you!";

  return message;
};

