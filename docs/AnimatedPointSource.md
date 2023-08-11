<!-- This file was autogenerated from AnimatedPointSource.tsx do not modify -->

```tsx
import { AnimatedPointSource } from '@rnmapbox/maps';

AnimatedPointSource
```
AnimatedPointSource is a map content source that supplies an animatable GeoJSON point to be shown on the map.

## props

  
### id

```tsx
string
```
A string that uniquely identifies the source.

  _defaults to:_ `MapboxGL.StyleSource.DefaultSourceID`

  
### point

```tsx
GeoJSON.Point
```
The point data.


  
### animationDuration

```tsx
number
```
The duration in milliseconds to animate the point. If `undefined` or `0`, changes are instantaneous.


  
### snapIfDistanceIsGreaterThan

```tsx
number
```
If the distance between the previous `point` and the new `point` is greater than this number in
meters, ignore `animationDuration` and move instantly to `point`. If `undefined`, always
animates according to `animationDuration`. If `0`, always moves instantly.


  
### children

```tsx
React.ReactElement | React.ReactElement[]
```
One or more components to render with the point data.


  





