import { useEffect, useState } from 'react';
import { ButtonGroup } from '@rneui/base';
import Mapbox, { Camera, MapView, normalizeLanguageTag } from '@rnmapbox/maps';

import { type ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

const CENTER_COORD = [10.4515, 51.1657];

// Device-style tags; normalizeLanguageTag turns e.g. zh-TW into the zh-Hant Mapbox localizes into
const LANGUAGES = [
  { label: 'Default', tag: null },
  { label: 'Dutch', tag: 'nl' },
  { label: 'Greek', tag: 'el' },
  { label: 'Chinese (TW)', tag: 'zh-TW' },
];

const SetLanguage = () => {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const tag = LANGUAGES[selected]?.tag;
    Mapbox.setLanguage(tag ? normalizeLanguageTag(tag) : null);
  }, [selected]);

  // The language is app-wide and persisted, so don't leave it set for other screens
  useEffect(
    () => () => {
      Mapbox.setLanguage(null);
    },
    [],
  );

  return (
    <>
      <ButtonGroup
        buttons={LANGUAGES.map(({ label }) => label)}
        selectedIndex={selected}
        onPress={setSelected}
      />
      <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/standard">
        <Camera
          defaultSettings={{ centerCoordinate: CENTER_COORD, zoomLevel: 4 }}
        />
      </MapView>
    </>
  );
};

export default SetLanguage;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Set Language',
  tags: ['Mapbox#setLanguage'],
  docs: `
Sets the label language for all maps in the app with \`Mapbox.setLanguage\`, which works with any language Mapbox supports and with the Standard style.
`,
};
SetLanguage.metadata = metadata;
