import { Position } from '../types/Position';
import NativeRNMBXMovePointShapeAnimatorModule from '../specs/NativeRNMBXMovePointShapeAnimatorModule';

import ShapeAnimatorManager from './ShapeAnimatorManager';

import { ShapeAnimatorInterface } from '.';

export default class MovePointShapeAnimator implements ShapeAnimatorInterface {
  __nativeTag: number;

  constructor(start: Position) {
    const tag = ShapeAnimatorManager.nextTag();
    NativeRNMBXMovePointShapeAnimatorModule.create(tag, [start[0], start[1]]);
    this.__nativeTag = tag;
  }

  start() {
    NativeRNMBXMovePointShapeAnimatorModule.start(this.__nativeTag);
  }

  moveTo(args: { start: Position; durationMs: number }) {
    NativeRNMBXMovePointShapeAnimatorModule.moveTo(
      this.__nativeTag,
      args.start,
      args.durationMs,
    );
  }
}
