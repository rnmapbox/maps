import { NativeModules } from 'react-native';

import { Position } from '../types/Position';

import ShapeAnimatorManager from './ShapeAnimatorManager';

export default class DummyShapeAnimator {
  __nativeTag: number;

  constructor(from: Position) {
    const tag = ShapeAnimatorManager.nextTag();
    NativeModules[NATIVE_MODULE_NAME].create(tag, from);
    this.__nativeTag = tag;
  }

  start() {
    NativeModules[NATIVE_MODULE_NAME].start(this.__nativeTag);
  }
}

export const NATIVE_MODULE_NAME = 'RNDummyShapeAnimatorModule';
