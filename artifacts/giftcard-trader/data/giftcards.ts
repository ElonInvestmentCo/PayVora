/**
 * Central gift card brand registry.
 * Logos served via Clearbit Logo API — authentic brand marks,
 * no generated or placeholder images.
 */

export interface GiftCardBrand {
  id: string;
  name: string;
  logo: string;
  color: string;
  category: "shopping" | "gaming" | "entertainment" | "finance" | "food" | "travel";
}

const CLEARBIT = "https://logo.clearbit.com";

export const GIFT_CARD_BRANDS: GiftCardBrand[] = [
  { id: "amazon",     name: "Amazon",      logo: `${CLEARBIT}/amazon.com`,        color: "#FF9900", category: "shopping"      },
  { id: "apple",      name: "Apple",       logo: `${CLEARBIT}/apple.com`,         color: "#555555", category: "entertainment"  },
  { id: "itunes",     name: "iTunes",      logo: `${CLEARBIT}/apple.com`,         color: "#FC3C44", category: "entertainment"  },
  { id: "google",     name: "Google Play", logo: `${CLEARBIT}/play.google.com`,   color: "#34A853", category: "entertainment"  },
  { id: "steam",      name: "Steam",       logo: `${CLEARBIT}/steampowered.com`,  color: "#1B2838", category: "gaming"        },
  { id: "xbox",       name: "Xbox",        logo: `${CLEARBIT}/xbox.com`,          color: "#107C10", category: "gaming"        },
  { id: "playstation",name: "PlayStation", logo: `${CLEARBIT}/playstation.com`,   color: "#003087", category: "gaming"        },
  { id: "nintendo",   name: "Nintendo",    logo: `${CLEARBIT}/nintendo.com`,      color: "#E4000F", category: "gaming"        },
  { id: "roblox",     name: "Roblox",      logo: `${CLEARBIT}/roblox.com`,        color: "#E8192C", category: "gaming"        },
  { id: "netflix",    name: "Netflix",     logo: `${CLEARBIT}/netflix.com`,       color: "#E50914", category: "entertainment"  },
  { id: "spotify",    name: "Spotify",     logo: `${CLEARBIT}/spotify.com`,       color: "#1DB954", category: "entertainment"  },
  { id: "visa",       name: "Visa",        logo: `${CLEARBIT}/visa.com`,          color: "#1A1F71", category: "finance"       },
  { id: "mastercard", name: "Mastercard",  logo: `${CLEARBIT}/mastercard.com`,    color: "#EB001B", category: "finance"       },
  { id: "amex",       name: "Amex",        logo: `${CLEARBIT}/americanexpress.com`,color: "#016FD0", category: "finance"      },
  { id: "ebay",       name: "eBay",        logo: `${CLEARBIT}/ebay.com`,          color: "#E43137", category: "shopping"      },
  { id: "walmart",    name: "Walmart",     logo: `${CLEARBIT}/walmart.com`,       color: "#0071CE", category: "shopping"      },
  { id: "target",     name: "Target",      logo: `${CLEARBIT}/target.com`,        color: "#CC0000", category: "shopping"      },
  { id: "nike",       name: "Nike",        logo: `${CLEARBIT}/nike.com`,          color: "#111111", category: "shopping"      },
  { id: "starbucks",  name: "Starbucks",   logo: `${CLEARBIT}/starbucks.com`,     color: "#00704A", category: "food"          },
  { id: "uber",       name: "Uber",        logo: `${CLEARBIT}/uber.com`,          color: "#000000", category: "travel"        },
];

/** Look up a brand by id — returns undefined if not found */
export function getBrand(id: string): GiftCardBrand | undefined {
  return GIFT_CARD_BRANDS.find((b) => b.id === id);
}
