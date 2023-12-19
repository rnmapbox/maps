import { Position } from '../types/Position';
import NativeRNMBXMovePointShapeAnimatorModule from '../specs/NativeRNMBXMovePointShapeAnimatorModule';
import { ShapeAnimatorInterface } from '..';

import ShapeAnimatorManager from './ShapeAnimatorManager';

export default class MovePointShapeAnimator implements ShapeAnimatorInterface {
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

  moveTo(args: { coordinate: Position; durationMs: number }) {
    NativeRNMBXMovePointShapeAnimatorModule.moveTo(
      this.__nativeTag,
      args.coordinate,
      args.durationMs,
    );
  }
}
