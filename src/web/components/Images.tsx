import { type ReactNode, useContext, useEffect, useMemo, useRef } from 'react';
import type { Map as GLMap } from 'mapbox-gl';

import type { ImageEntry } from '../../components/Images';
import MapContext from '../MapContext';
import { warnUnimplemented } from '../UnimplementedComponent';
import { resolveImageEntry, type StyleImage } from '../utils/imageEntry';

type LoadedImage = Parameters<GLMap['addImage']>[1];

type Props = {
  images?: { [key: string]: ImageEntry };
  nativeAssetImages?: unknown[];
  onImageMissing?: (imageKey: string) => void;
  children?: ReactNode;
};

function loadImage(map: GLMap, url: string) {
  return new Promise<LoadedImage>((resolve, reject) => {
    map.loadImage(url, (error, image) => {
      if (error || !image) {
        reject(error ?? new Error(`no image at ${url}`));
      } else {
        resolve(image);
      }
    });
  });
}

function Images({
  images,
  nativeAssetImages,
  onImageMissing,
  children,
}: Props) {
  const { map, styleGeneration = 0 } = useContext(MapContext);
  const styleImages = useMemo(() => {
    const resolved: { [name: string]: StyleImage } = {};
    for (const [name, entry] of Object.entries(images ?? {})) {
      const styleImage = resolveImageEntry(entry);
      if (styleImage) {
        resolved[name] = styleImage;
      }
    }
    return resolved;
  }, [images]);
  const latest = useRef({ styleImages, onImageMissing });
  latest.current = { styleImages, onImageMissing };
  const loads = useRef(new Map<string, Promise<LoadedImage>>());
  // name -> style generation and entry the map currently holds for it
  const added = useRef(new Map<string, string>());

  if (nativeAssetImages?.length) {
    warnUnimplemented('Images.nativeAssetImages');
  }

  useEffect(() => {
    if (!map || styleGeneration === 0) {
      return;
    }
    const addedImages = added.current;
    for (const [name, styleImage] of Object.entries(styleImages)) {
      const key = `${styleGeneration} ${JSON.stringify(styleImage)}`;
      if (addedImages.get(name) === key) {
        continue;
      }
      let load = loads.current.get(styleImage.url);
      if (!load) {
        load = loadImage(map, styleImage.url);
        loads.current.set(styleImage.url, load);
      }
      load.then(
        (image) => {
          const isStale =
            map._removed ||
            latest.current.styleImages[name] !== styleImage ||
            addedImages.get(name) === key;
          if (isStale) {
            return;
          }
          if (map.hasImage(name)) {
            map.removeImage(name);
          }
          map.addImage(name, image, styleImage.options);
          addedImages.set(name, key);
        },
        (error: Error) => {
          loads.current.delete(styleImage.url);
          console.warn(
            `@rnmapbox/maps: Images failed to load ${name}: ${error.message}`,
          );
        },
      );
    }
    for (const name of [...addedImages.keys()]) {
      if (!(name in styleImages)) {
        addedImages.delete(name);
        if (!map._removed && map.hasImage(name)) {
          map.removeImage(name);
        }
      }
    }
  }, [map, styleGeneration, styleImages]);

  useEffect(() => {
    if (!map) {
      return;
    }
    const onMissing = ({ id }: { id: string }) => {
      // Images still loading are reported missing by the map, but not by native
      if (!(id in latest.current.styleImages)) {
        latest.current.onImageMissing?.(id);
      }
    };
    map.on('styleimagemissing', onMissing);
    return () => {
      map.off('styleimagemissing', onMissing);
    };
  }, [map]);

  useEffect(() => {
    const addedImages = added.current;
    return () => {
      if (!map || map._removed) {
        return;
      }
      for (const name of addedImages.keys()) {
        if (map.hasImage(name)) {
          map.removeImage(name);
        }
      }
    };
  }, [map]);

  return <>{children}</>;
}

export default Images;
