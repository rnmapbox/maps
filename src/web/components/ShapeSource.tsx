import { type ReactNode, useContext } from 'react';
import type { GeoJSONSource, GeoJSONSourceSpecification } from 'mapbox-gl';

import MapContext from '../MapContext';
import { useOnChange } from '../useOnChange';
import { Source } from './Source';

type Props = {
  id: string;
  url?: string;
  shape?: GeoJSON.GeoJSON | string;
  cluster?: boolean;
  clusterRadius?: number;
  clusterMaxZoomLevel?: number;
  clusterProperties?: object;
  maxZoomLevel?: number;
  buffer?: number;
  tolerance?: number;
  lineMetrics?: boolean;
  children?: ReactNode;
};

const emptyCollection: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

function sourceData({ url, shape }: Props): string | GeoJSON.GeoJSON {
  return url ?? shape ?? emptyCollection;
}

export function ShapeSource(props: Props) {
  const { map } = useContext(MapContext);

  useOnChange(props.shape ?? props.url, () => {
    (map?.getSource(props.id) as GeoJSONSource | undefined)?.setData(
      sourceData(props),
    );
  });

  return (
    <Source
      id={props.id}
      specification={{
        type: 'geojson',
        data: sourceData(props) as GeoJSONSourceSpecification['data'],
        cluster: props.cluster,
        clusterRadius: props.clusterRadius,
        clusterMaxZoom: props.clusterMaxZoomLevel,
        clusterProperties: props.clusterProperties,
        maxzoom: props.maxZoomLevel,
        buffer: props.buffer,
        tolerance: props.tolerance,
        lineMetrics: props.lineMetrics,
      }}
      recreateOn={[
        props.cluster,
        props.clusterRadius,
        props.clusterMaxZoomLevel,
      ]}
    >
      {props.children}
    </Source>
  );
}

export default ShapeSource;
