// @ts-expect-error untyped module
import { getAssetByID } from '@react-native/assets-registry/registry';

type PackagerAsset = {
  httpServerLocation: string;
  name: string;
  type: string;
  scales: number[];
};

export function assetUri(
  source: number | string | { uri: string } | undefined,
) {
  if (typeof source === 'object') {
    return source.uri;
  }
  if (typeof source !== 'number') {
    return source;
  }
  const asset = getAssetByID(source) as PackagerAsset | undefined;
  if (!asset) {
    return undefined;
  }
  const scale = asset.scales[0] ?? 1;
  const scaleSuffix = scale === 1 ? '' : `@${scale}x`;
  return `${asset.httpServerLocation}/${asset.name}${scaleSuffix}.${asset.type}`;
}
