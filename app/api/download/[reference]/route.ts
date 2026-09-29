import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const SIGNED_URL_TTL_SECONDS = 5 * 60;

function getStorageObject(assetUrl: string) {
  const storageOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!storageOrigin) return null;

  try {
    const url = new URL(assetUrl);
    if (url.origin !== new URL(storageOrigin).origin) return null;

    const match = url.pathname.match(
      /^\/storage\/v1\/object\/(?:sign|public|authenticated)\/([^/]+)\/(.+)$/
    );
    if (!match) return null;

    return {
      bucket: decodeURIComponent(match[1]),
      path: match[2].split("/").map(decodeURIComponent).join("/"),
    };
  } catch {
    return null;
  }
}

function redirectToReceipt(requestUrl: string, reference: string, reason: string) {
  const receiptUrl = new URL("/checkout/success", requestUrl);
  receiptUrl.searchParams.set("ref", reference);
  receiptUrl.searchParams.set("download", reason);
  return NextResponse.redirect(receiptUrl, 303);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  if (!reference || reference.length > 255) {
    return redirectToReceipt(request.url, reference ?? "", "unavailable");
  }

  const supabase = createAdminClient();
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("pdf_id")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (purchaseError) {
    console.error("Purchase download lookup failed:", purchaseError);
    return NextResponse.json({ error: "Could not prepare download" }, { status: 500 });
  }

  if (!purchase) {
    return redirectToReceipt(request.url, reference, "unavailable");
  }

  const { data: asset, error: assetError } = await supabase
    .from("download_assets")
    .select("asset_url, asset_name, active, storage_bucket, storage_path")
    .eq("id", purchase.pdf_id)
    .maybeSingle();

  if (assetError) {
    console.error("Download asset lookup failed:", assetError);
    return NextResponse.json({ error: "Could not prepare download" }, { status: 500 });
  }

  const storageObject = asset?.storage_bucket && asset.storage_path
    ? { bucket: asset.storage_bucket, path: asset.storage_path }
    : asset?.asset_url
      ? getStorageObject(asset.asset_url)
      : null;
  if (!asset || asset.active === false || !storageObject) {
    return redirectToReceipt(request.url, reference, "unavailable");
  }

  const filename = asset.asset_name ? `${asset.asset_name}.pdf` : true;
  const { data: signedUrl, error: signingError } = await supabase.storage
    .from(storageObject.bucket)
    .createSignedUrl(storageObject.path, SIGNED_URL_TTL_SECONDS, { download: filename });

  if (signingError || !signedUrl?.signedUrl) {
    console.error("Could not sign purchased asset:", signingError);
    return redirectToReceipt(request.url, reference, "unavailable");
  }

  const { data: authorization, error: authorizationError } = await supabase.rpc(
    "consume_purchase_download",
    { p_reference: reference }
  );

  if (authorizationError) {
    console.error("Purchase download authorization failed:", authorizationError);
    return NextResponse.json({ error: "Could not authorize download" }, { status: 500 });
  }

  if (!authorization?.length) {
    return redirectToReceipt(request.url, reference, "limit");
  }

  const response = NextResponse.redirect(signedUrl.signedUrl, 302);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}