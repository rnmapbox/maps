import { Position } from '../types/Position';
import NativeRNMBXMovePointShapeAnimatorModule from '../specs/NativeRNMBXMovePointShapeAnimatorModule';

import ShapeAnimatorManager from './ShapeAnimatorManager';

export default class MovePointShapeAnimator {
  __nativeTag: number;

  constructor(coordinate: Position) {
    const tag = ShapeAnimatorManager.nextTag();
    NativeRNMBXMovePointShapeAnimatorModule.create(tag, [
      coordinate[0],
      coordinate[1],
    ]);
    this.__nativeTag = tag;
  }

  start() {
    NativeRNMBXMovePointShapeAnimatorModule.start(this.__nativeTag);
  }

  moveTo(coordinate: Position) {
    NativeRNMBXMovePointShapeAnimatorModule.moveTo(
      this.__nativeTag,
      coordinate,
    );
  }
}
