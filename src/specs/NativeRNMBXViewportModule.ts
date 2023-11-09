import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

type StateInfo =
  | {
      kind: 'idle';
    }
  | {
      kind: 'state';
      status: string;
    }
  | {
      kind: 'transition';
      toState: string;
      transition: string;
    };

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
type ObjectOr<T> = Object;

type StateReal = { kind: 'followPuck' } /* | { kind: 'overview' } */;
type State = ObjectOr<StateReal>;
type TransitionReal =
  | { kind: 'immediate' }
  | { kind: 'default'; options: { maxDurationMs?: number } };
type Transition = ObjectOr<TransitionReal>;

type ViewRef = Int32 | null;

export interface Spec extends TurboModule {
  getState(viewRef: ViewRef): Promise<StateInfo>;
  transitionTo(
    viewRef: ViewRef,
    state: State,
    transition: Transition,
  ): Promise<void>;
  idle(viewRef: ViewRef): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXViewportModule');
