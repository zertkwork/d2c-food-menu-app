export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

export function validateTrackingId(trackingId: string): boolean {
  return /^[A-Z0-9-]+$/.test(trackingId);
}

export function validateOrderStatus(status: string): boolean {
  const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
  return validStatuses.includes(status);
}

export function validateKitchenStatus(status: string): boolean {
  const validStatuses = ["pending", "preparing", "ready", "completed"];
  return validStatuses.includes(status);
}

export function validateDeliveryStatus(status: string): boolean {
  const validStatuses = ["out_for_delivery", "delivered"];
  return validStatuses.includes(status);
}

export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
