export async function createOrder(payload: any) {
  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not set");
  }
  const resp = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `Request failed with ${resp.status}`);
  }
  return await resp.json();
}
