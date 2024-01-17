import { Position } from '../types/Position';
import NativeRNMBXMovePointShapeAnimatorModule from '../specs/NativeRNMBXMovePointShapeAnimatorModule';

import ShapeAnimatorManager from './ShapeAnimatorManager';

import { ShapeAnimatorInterface } from '.';

export default class MovePointShapeAnimator implements ShapeAnimatorInterface {
  __nativeTag: number;

  constructor(startCoordinate: Position) {
    const tag = ShapeAnimatorManager.nextTag();
    NativeRNMBXMovePointShapeAnimatorModule.create(tag, [
      startCoordinate[0],
      startCoordinate[1],
    ]);
    this.__nativeTag = tag;
  }

  moveTo(args: { coordinate: Position; durationMs: number }) {
    NativeRNMBXMovePointShapeAnimatorModule.moveTo(
      this.__nativeTag,
      args.coordinate,
      args.durationMs,
    );
  }
}
