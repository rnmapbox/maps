import type { ImageEntry, ImageEntryData } from '../../components/Images';

import { type AssetSource, resolveAsset } from './assetUri';

export type StyleImage = {
  url: string;
  options: {
    pixelRatio: number;
    sdf?: boolean;
    stretchX?: [number, number][];
    stretchY?: [number, number][];
    content?: [number, number, number, number];
  };
};

function isImageEntryData(entry: ImageEntry): entry is ImageEntryData {
  return (
    typeof entry === 'object' &&
    !Array.isArray(entry) &&
    ('url' in entry || 'image' in entry)
  );
}

// Mirrors native: stretch and content are given in points of `scale`, and
// the pixel ratio combines `scale` with the asset's own resolution scale.
export function resolveImageEntry(entry: ImageEntry): StyleImage | undefined {
  if (!isImageEntryData(entry)) {
    const source = Array.isArray(entry) ? entry[0] : entry;
    const asset = resolveAsset(source as AssetSource);
    return asset && { url: asset.uri, options: { pixelRatio: asset.scale } };
  }
  const asset = resolveAsset(
    entry.url ?? (entry.image as AssetSource | undefined),
  );
  if (!asset) {
    return undefined;
  }
  const scale = entry.scale ?? 1;
  const scaleRange = ([from, to]: [number, number]): [number, number] => [
    from * scale,
    to * scale,
  ];
  const { content } = entry;
  return {
    url: asset.uri,
    options: {
      pixelRatio: scale * asset.scale,
      sdf: entry.sdf,
      stretchX: entry.stretchX?.map(scaleRange),
      stretchY: entry.stretchY?.map(scaleRange),
      content: content && [
        content[0] * scale,
        content[1] * scale,
        content[2] * scale,
        content[3] * scale,
      ],
    },
  };
}
