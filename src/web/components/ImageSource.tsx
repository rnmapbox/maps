import { type ReactNode, useContext } from 'react';
import type { ImageSource as GLImageSource } from 'mapbox-gl';

import MapContext from '../MapContext';
import { useOnChange } from '../useOnChange';
import { assetUri } from '../utils/assetUri';
import { Source } from './Source';

type Position = [number, number];
type Coordinates = [Position, Position, Position, Position];

type Props = {
  id: string;
  url?: number | string | { uri: string };
  coordinates?: Coordinates;
  children?: ReactNode;
};

export function ImageSource(props: Props) {
  const { map } = useContext(MapContext);
  const url = assetUri(props.url);
  const { coordinates } = props;

  useOnChange(`${url} ${JSON.stringify(coordinates)}`, () => {
    if (url && coordinates) {
      (map?.getSource(props.id) as GLImageSource | undefined)?.updateImage({
        url,
        coordinates,
      });
    }
  });

  return (
    <Source
      id={props.id}
      specification={
        url && coordinates ? { type: 'image', url, coordinates } : undefined
      }
      recreateOn={[]}
    >
      {props.children}
    </Source>
  );
}

export default ImageSource;
