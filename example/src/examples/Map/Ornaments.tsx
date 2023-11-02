import React, { useState } from 'react';
import { MapView, Camera, Images } from '@rnmapbox/maps';
import { Button, StyleSheet, Text, ImageSourcePropType } from 'react-native';
import { Divider } from '@rneui/base';

import Bubble from '../common/Bubble';
import { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

type CompassImage = 'compass1' | 'compass2';
const images: Record<CompassImage, ImageSourcePropType> = {
  compass1: require('../../assets/compass1.png'),
  compass2: require('../../assets/compass2.png'),
};

enum OrnamentType {
  Logo = 'logo',
  Attribution = 'attribution',
  Compass = 'compass',
  ScaleBar = 'scaleBar',
}

enum OrnamentPosition {
  TopLeft = 'topLeft',
  TopRight = 'topRight',
  BottomRight = 'bottomRight',
  BottomLeft = 'bottomLeft',
}

const POSITIONS = {
  [OrnamentPosition.TopLeft]: { top: 8, left: 8 },
  [OrnamentPosition.TopRight]: { top: 8, right: 8 },
  [OrnamentPosition.BottomRight]: { bottom: 8, right: 8 },
  [OrnamentPosition.BottomLeft]: { bottom: 8, left: 8 },
};

type OrnamentButtonsProps = {
  ornamentType: OrnamentType;
  visibility: Record<OrnamentType, true | false | undefined>;
  position: Record<OrnamentType, OrnamentPosition>;
  onPressVisibility: (ornamentType: OrnamentType) => void;
  onPressPosition: (ornamentType: OrnamentType) => void;
};

const OrnamentButtons = ({
  ornamentType,
  visibility,
  position,
  onPressVisibility,
  onPressPosition,
}: OrnamentButtonsProps) => (
  <>
    <Button
      title={'Visiblity: ' + visibility[ornamentType]}
      onPress={(): void => onPressVisibility(ornamentType)}
    />
    <Button
      title={'Position: ' + position[ornamentType]}
      onPress={(): void => onPressPosition(ornamentType)}
    />
  </>
);

const Ornaments = () => {
  const [visibility, setVisibility] = useState({
    [OrnamentType.Logo]: undefined,
    [OrnamentType.Attribution]: undefined,
    [OrnamentType.Compass]: undefined,
    [OrnamentType.ScaleBar]: undefined,
  });

  const [position, setPosition] = useState({
    [OrnamentType.Logo]: OrnamentPosition.BottomLeft,
    [OrnamentType.Attribution]: OrnamentPosition.BottomRight,
    [OrnamentType.Compass]: OrnamentPosition.TopRight,
    [OrnamentType.ScaleBar]: OrnamentPosition.TopLeft,
  });

  const [compassImage, setCompassImage] = useState<CompassImage | undefined>();
  const [compassFadeWhenNorth, setCompassFadeWhenNorth] = useState<
    boolean | undefined
  >(undefined);

  const handlePressVisibility = (ornamentType: OrnamentType): void => {
    setVisibility((prevState) => {
      let newValue;

      if (prevState[ornamentType] === undefined) {
        newValue = true;
      } else if (prevState[ornamentType] === true) {
        newValue = false;
      } else if (prevState[ornamentType] === false) {
        newValue = undefined;
      }

      return { ...prevState, [ornamentType]: newValue };
    });
  };

  const handlePressPosition = (ornamentType: OrnamentType): void => {
    setPosition((prevState) => {
      let newValue;

      if (prevState[ornamentType] === OrnamentPosition.TopLeft) {
        newValue = OrnamentPosition.TopRight;
      } else if (prevState[ornamentType] === OrnamentPosition.TopRight) {
        newValue = OrnamentPosition.BottomRight;
      } else if (prevState[ornamentType] === OrnamentPosition.BottomRight) {
        newValue = OrnamentPosition.BottomLeft;
      } else if (prevState[ornamentType] === OrnamentPosition.BottomLeft) {
        newValue = OrnamentPosition.TopLeft;
      }

      return { ...prevState, [ornamentType]: newValue };
    });
  };

  return (
    <>
      <MapView
        style={styles.matchParent}
        logoEnabled={visibility[OrnamentType.Logo]}
        logoPosition={POSITIONS[position[OrnamentType.Logo]]}
        attributionEnabled={visibility[OrnamentType.Attribution]}
        attributionPosition={POSITIONS[position[OrnamentType.Attribution]]}
        compassEnabled={visibility[OrnamentType.Compass]}
        compassPosition={POSITIONS[position[OrnamentType.Compass]]}
        compassImage={compassImage}
        compassFadeWhenNorth={compassFadeWhenNorth}
        scaleBarEnabled={visibility[OrnamentType.ScaleBar]}
        scaleBarPosition={POSITIONS[position[OrnamentType.ScaleBar]]}
      >
        <Images images={images} />
        <Camera />
      </MapView>

      <Bubble style={styles.bubble}>
        <Text>Logo</Text>
        <OrnamentButtons
          ornamentType={OrnamentType.Logo}
          visibility={visibility}
          position={position}
          onPressVisibility={handlePressVisibility}
          onPressPosition={handlePressPosition}
        />

        <Divider style={styles.divider} />

        <Text>Attribution</Text>
        <OrnamentButtons
          ornamentType={OrnamentType.Attribution}
          visibility={visibility}
          position={position}
          onPressVisibility={handlePressVisibility}
          onPressPosition={handlePressPosition}
        />

        <Divider style={styles.divider} />

        <Text>Compass</Text>
        <OrnamentButtons
          ornamentType={OrnamentType.Compass}
          visibility={visibility}
          position={position}
          onPressVisibility={handlePressVisibility}
          onPressPosition={handlePressPosition}
        />
        <Button
          title={'Image: ' + compassImage}
          onPress={() => {
            if (!compassImage) {
              setCompassImage('compass1');
            } else if (compassImage === 'compass1') {
              setCompassImage('compass2');
            } else {
              setCompassImage(undefined);
            }
          }}
        />
        <Button
          title={'Fade when north: ' + compassFadeWhenNorth}
          onPress={() => {
            if (compassFadeWhenNorth === undefined) {
              setCompassFadeWhenNorth(true);
            } else if (compassFadeWhenNorth) {
              setCompassFadeWhenNorth(false);
            } else {
              setCompassFadeWhenNorth(undefined);
            }
          }}
        />

        <Divider style={styles.divider} />

        <Text>ScaleBar</Text>
        <OrnamentButtons
          ornamentType={OrnamentType.ScaleBar}
          visibility={visibility}
          position={position}
          onPressVisibility={handlePressVisibility}
          onPressPosition={handlePressPosition}
        />
      </Bubble>
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    marginTop: 5,
    marginBottom: 10,
  },
  bubble: {
    flex: 0,
    alignItems: 'flex-start',
    padding: 10,
    marginBottom: 96,
  },
  matchParent: {
    flex: 1,
  },
});

export default Ornaments;

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Ornaments',
  tags: [
    'MapView#logoEnabled',
    'MapView#logoPosition',
    'MapView#attributionEnabled',
    'MapView#attributionPosition',
    'MapView#compassEnabled',
    'MapView#compassPosition',
    'MapView#compassImage',
    'MapView#compassFadeWhenNorth',
    'MapView#scaleBarEnabled',
    'MapView#scaleBarPosition',
  ],
  docs: `
Customize ornaments of the map(logo, compass, scalebar, attribution)
`,
};
Ornaments.metadata = metadata;
