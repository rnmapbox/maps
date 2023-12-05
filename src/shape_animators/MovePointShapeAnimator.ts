import { Position } from '../types/Position';
import NativeRNMBXMovePointShapeAnimatorModule from '../specs/NativeRNMBXMovePointShapeAnimatorModule';

import ShapeAnimatorManager from './ShapeAnimatorManager';

export default class MovePointShapeAnimator {
  __nativeTag: number;

  constructor(from: Position) {
    const tag = ShapeAnimatorManager.nextTag();
    NativeRNMBXMovePointShapeAnimatorModule.create(tag, [from[0], from[1]]);
    this.__nativeTag = tag;
  }

  start() {
    NativeRNMBXMovePointShapeAnimatorModule.start(this.__nativeTag);
  }
}
