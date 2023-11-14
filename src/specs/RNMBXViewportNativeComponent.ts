import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

export type FollowPuckOptionsNative = {
  zoom?: number | 'keep';
  pitch?: number | 'keep';
  bearing?: 'course' | 'heading' | number | 'keep';
  padding?:
    | {
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
      }
    | 'keep';
};

export type ViewportStateNative =
  | {
      kind: 'followPuck';
      options?: FollowPuckOptionsNative;
    }
  | {
      kind: 'overview';
    };

type ViewportStatus =
  | {
      kind: 'idle';
    }
  | {
      kind: 'transition';
      toState: ViewportStateNative;
      transition: ViewportTransition;
    };

type ViewportTransition =
  | {
      kind: 'immediate';
    }
  | {
      kind: 'default';
      maxDurationMs?: number;
    };

type ViewportStatusChangeReason =
  | 'TransitionStarted'
  | 'TransitionSucceeded'
  | 'IdleRequested'
  | 'UserInteraction';

//type OnStatusChangedEventType = { __fabric_todo: string };

/*
type OnStatusChangedEventTypeOk = {
  from: {
    kind: string;
    toState?: {
      kind: string;
    };
    transition?: {
      kind: string;
      maxDurationMs?: number;
    };
  };
  to: {
    kind: string;
    toState?: {
      kind: string;
    };
    transition?: {
      kind: string;
      maxDurationMs?: number;
    };
  };
  reason: string;
};*/

export type OnStatusChangedEventPayload = {
  from: ViewportStatus;
  to: ViewportStatus;
  reason: ViewportStatusChangeReason;
};

type OnStatusChangedEventType = {
  type: string;
  payload: string;
  // RN 0.73+:
  //payload: UnsafeMixed<OnStatusChangedEventPayload>;
};

export type OnStatusChangedEventTypeReal = {
  type: 'statuschanged';
  payload: UnsafeMixed<OnStatusChangedEventPayload>;
};

export interface NativeProps extends ViewProps {
  transitionsToIdleUponUserInteraction?: OptionalProp<boolean>;
  hasStatusChanged: boolean;
  onStatusChanged?: DirectEventHandler<OnStatusChangedEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXViewport',
) as HostComponent<NativeProps>;

export type NativeViewportReal = HostComponent<
  Omit<NativeProps, 'onStatusChanged'> & {
    onStatusChanged?: DirectEventHandler<OnStatusChangedEventTypeReal>;
  }
>;
