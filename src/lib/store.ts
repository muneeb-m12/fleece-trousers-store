// Store settings — the one file to edit for shop details.
//
// WHATSAPP_NUMBER: the store's WhatsApp number in international format
// WITHOUT "+" or spaces, e.g. "923001234567". The WhatsApp order button
// stays disabled until this is set — no number has been invented here.

export const STORE_NAME = "FLEECE.";
export const STORE_TAGLINE = "Premium fleece trousers · Pakistan";
export const WHATSAPP_NUMBER = "";

export const TRUST_LINE =
  "Delivery across Pakistan · Cash on delivery · 7-day exchange";

export function whatsappOrderUrl(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
