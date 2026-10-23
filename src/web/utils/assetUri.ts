// @ts-expect-error untyped module
import { getAssetByID } from '@react-native/assets-registry/registry';

type PackagerAsset = {
  httpServerLocation: string;
  name: string;
  type: string;
  scales: number[];
};

export type AssetSource = number | string | { uri: string };

export function resolveAsset(
  source: AssetSource | undefined,
): { uri: string; scale: number } | undefined {
  if (typeof source === 'object') {
    return { uri: source.uri, scale: 1 };
  }
  if (typeof source !== 'number') {
    return source === undefined ? undefined : { uri: source, scale: 1 };
  }
  const asset = getAssetByID(source) as PackagerAsset | undefined;
  if (!asset) {
    return undefined;
  }
  const scale = asset.scales[0] ?? 1;
  const scaleSuffix = scale === 1 ? '' : `@${scale}x`;
  return {
    uri: `${asset.httpServerLocation}/${asset.name}${scaleSuffix}.${asset.type}`,
    scale,
  };
}

export function assetUri(source: AssetSource | undefined) {
  return resolveAsset(source)?.uri;
}
