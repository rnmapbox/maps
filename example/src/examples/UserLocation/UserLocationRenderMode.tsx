import React, { ReactNode, useState } from 'react';
import MapboxGL, {
  CircleLayer,
  UserLocationRenderMode as UserLocationRenderModeType,
  UserTrackingMode,
  UserLocationAndroidRenderMode,
} from '@rnmapbox/maps';
import { Button, Platform, View } from 'react-native';
import { ButtonGroup, Text } from '@rneui/base';

import sheet from '../../styles/sheet';
import TabBarPage from '../common/TabBarPage';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';
import { DEFAULT_CENTER_COORDINATE } from '../../utils';

const SettingsGroup = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => (
  <View>
    <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{label}</Text>
    {children}
  </View>
);

enum ExampleRenderMode {
  Normal = 'normal',
  Native = 'native',
  CustomChildren = 'customChildren',
  Hidden = 'hidden',
}

const UserLocationRenderMode = (props: BaseExampleProps) => {
  const [renderMode, setRenderMode] = useState<ExampleRenderMode>(
    ExampleRenderMode.Normal,
  );
  const [followUserLocation, setFollowUserLocation] = useState(true);
  const [followUserMode, setFollowUserMode] = useState(UserTrackingMode.Follow);
  const [showsUserHeadingIndicator, setShowsUserHeadingIndicator] =
    useState(false);
  const [androidRenderMode, setAndroidRenderMode] = useState(
    UserLocationAndroidRenderMode.Normal,
  );

  return (
    <TabBarPage
      {...props}
      initialIndex={0}
      options={[
        { label: 'Normal', data: ExampleRenderMode.Normal },
        { label: 'Native', data: ExampleRenderMode.Native },
        { label: 'Custom Children', data: ExampleRenderMode.CustomChildren },
        { label: 'Hidden', data: ExampleRenderMode.Hidden },
      ]}
      onOptionPress={(index, value) => setRenderMode(value)}
    >
      <View>
        <Button
          title={
            followUserLocation
              ? 'Don`t follow User Location'
              : 'Follow user location'
          }
          onPress={() => setFollowUserLocation((prevState) => !prevState)}
        />
        <Button
          title={
            showsUserHeadingIndicator
              ? 'Hide user heading indicator'
              : 'Show user heading indicator'
          }
          onPress={() =>
            setShowsUserHeadingIndicator((prevState) => !prevState)
          }
        />

        <SettingsGroup label="Follow User Mode">
          <ButtonGroup
            buttons={Object.values(UserTrackingMode)}
            selectedIndex={Object.values(UserTrackingMode).indexOf(
              followUserMode,
            )}
            onPress={(index) => {
              setFollowUserMode(Object.values(UserTrackingMode)[index]);
            }}
          />
        </SettingsGroup>

        {Platform.OS === 'android' && (
          <SettingsGroup label="Android Render Mode">
            <ButtonGroup
              disabled={renderMode !== ExampleRenderMode.Native}
              buttons={Object.values(UserLocationAndroidRenderMode)}
              selectedIndex={Object.values(
                UserLocationAndroidRenderMode,
              ).indexOf(androidRenderMode)}
              onPress={(index) => {
                setAndroidRenderMode(
                  Object.values(UserLocationAndroidRenderMode)[index],
                );
              }}
            />
          </SettingsGroup>
        )}
      </View>
      <MapboxGL.MapView style={sheet.matchParent} tintColor={'red'}>
        <MapboxGL.Camera
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER_COORDINATE,
            zoomLevel: 18,
          }}
          followUserLocation={followUserLocation}
          followUserMode={followUserMode}
          followZoomLevel={18}
          onUserTrackingModeChange={(event) => {
            if (!event.nativeEvent.payload.followUserLocation) {
              setFollowUserLocation(false);
            }
          }}
        />
        <MapboxGL.UserLocation
          visible={renderMode !== ExampleRenderMode.Hidden}
          renderMode={
            renderMode === ExampleRenderMode.Native
              ? UserLocationRenderModeType.Native
              : UserLocationRenderModeType.Normal
          }
          showsUserHeadingIndicator={showsUserHeadingIndicator}
          androidRenderMode={androidRenderMode}
        >
          {renderMode === ExampleRenderMode.CustomChildren
            ? [
                <CircleLayer
                  key="customer-user-location-children-red"
                  id="customer-user-location-children-red"
                  style={{ circleColor: 'red', circleRadius: 8 }}
                />,
                <CircleLayer
                  key="customer-user-location-children-white"
                  id="customer-user-location-children-white"
                  style={{ circleColor: 'white', circleRadius: 4 }}
                />,
              ]
            : undefined}
        </MapboxGL.UserLocation>
      </MapboxGL.MapView>
    </TabBarPage>
  );
};

export default UserLocationRenderMode;
