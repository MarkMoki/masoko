import { getMarketplacePromos } from "@/lib/marketplace";
import { json } from "@/lib/api-route";

export async function GET() {
  const data = await getMarketplacePromos();
  return json(data);
}
