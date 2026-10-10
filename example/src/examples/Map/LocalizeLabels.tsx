import { useState } from 'react';
import { ButtonGroup } from '@rneui/base';
import { Camera, MapView, StyleURL } from '@rnmapbox/maps';

const CENTER_COORD = [10.4515, 51.1657];

const LOCALES = ['es', 'nl', 'pl', 'el', 'current'];
const STYLES = [
  { label: 'Standard', url: 'mapbox://styles/mapbox/standard' },
  { label: 'Street', url: StyleURL.Street },
];

import { type ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

const LocalizeLabels = () => {
  const [localeIndex, setLocaleIndex] = useState(0);
  const [styleIndex, setStyleIndex] = useState(0);

  return (
    <>
      <ButtonGroup
        buttons={LOCALES}
        selectedIndex={localeIndex}
        onPress={setLocaleIndex}
      />
      <ButtonGroup
        buttons={STYLES.map((style) => style.label)}
        selectedIndex={styleIndex}
        onPress={setStyleIndex}
      />
      <MapView
        style={{ flex: 1 }}
        styleURL={STYLES[styleIndex]?.url}
        localizeLabels={{ locale: LOCALES[localeIndex] ?? 'current' }}
      >
        <Camera
          defaultSettings={{ centerCoordinate: CENTER_COORD, zoomLevel: 4 }}
        />
      </MapView>
    </>
  );
};

export default LocalizeLabels;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Localize Labels',
  tags: ['MapView#localizeLabels'],
  docs: `
Localize labels to a specific locale (Spanish, Dutch, Polish, Greek) or to the device's preferred languages, with the Standard and Street styles.
`,
};
LocalizeLabels.metadata = metadata;
