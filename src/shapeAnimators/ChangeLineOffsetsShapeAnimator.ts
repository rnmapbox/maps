import { Position } from '@turf/helpers';

import NativeRNMBXChangeLineOffsetsShapeAnimatorModule from '../specs/NativeRNMBXChangeLineOffsetsShapeAnimatorModule';

import ShapeAnimatorManager from './ShapeAnimatorManager';

import { ShapeAnimatorInterface } from '.';

export default class ChangeLineOffsetsShapeAnimator
  implements ShapeAnimatorInterface
{
  __nativeTag: number;

  constructor(args: {
    coordinates: Position[];
    startOffset: number;
    endOffset: number;
  }) {
    const tag = ShapeAnimatorManager.nextTag();
    NativeRNMBXChangeLineOffsetsShapeAnimatorModule.create(
      tag,
      args.coordinates,
      args.startOffset,
      args.endOffset,
    );
    this.__nativeTag = tag;
  }

  setLineString(args: {
    coordinates: Position[];
    startOffset?: number;
    endOffset?: number;
  }) {
    NativeRNMBXChangeLineOffsetsShapeAnimatorModule.setLineString(
      this.__nativeTag,
      args.coordinates,
      args.startOffset ?? -1,
      args.endOffset ?? -1,
    );
  }

  setStartOffset(args: { offset: number; durationMs: number }) {
    NativeRNMBXChangeLineOffsetsShapeAnimatorModule.setStartOffset(
      this.__nativeTag,
      args.offset,
      args.durationMs,
    );
  }

  setEndOffset(args: { offset: number; durationMs: number }) {
    NativeRNMBXChangeLineOffsetsShapeAnimatorModule.setEndOffset(
      this.__nativeTag,
      args.offset,
      args.durationMs,
    );
  }
}
