// lib/assetDelivery.ts
//
// One place that knows how to get a PDF's bytes. Prefers the Storage
// bucket + path (asks Supabase directly whether the file exists --
// no stored URL to expire or be mistyped), and falls back to the old
// asset_url only for rows that haven't been migrated yet.

import type { SupabaseClient } from "@supabase/supabase-js";

export type DownloadAsset = {
  id: string;
  asset_name: string | null;
  asset_url: string | null;
  storage_bucket?: string | null;
  storage_path?: string | null;
};

export async function fetchAssetBuffer(
  supabase: SupabaseClient,
  asset: DownloadAsset
): Promise<Buffer> {
  if (asset.storage_bucket && asset.storage_path) {
    const { data, error } = await supabase.storage
      .from(asset.storage_bucket)
      .download(asset.storage_path);

    if (error || !data) {
      throw new Error(
        `Storage download failed for ${asset.storage_bucket}/${asset.storage_path}: ${error?.message ?? "no data"}`
      );
    }
    return Buffer.from(await data.arrayBuffer());
  }

  if (asset.asset_url) {
    const res = await fetch(asset.asset_url);
    if (!res.ok) {
      throw new Error(`Could not download PDF from asset_url. Status: ${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  throw new Error("Asset has neither a storage path nor an asset_url");
}