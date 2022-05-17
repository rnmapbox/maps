import { Component } from 'react';

import OfflineCreatePackOptions from './OfflineCreatePackOptions';
import OfflinePack from './OfflinePack';

import { OfflineProgressStatus, OfflineProgressError } from '.';

export class OfflineManager extends Component {
  createPack(
    options: OfflineCreatePackOptions,
    progressListener?: (
      pack: OfflinePack,
      status: OfflineProgressStatus,
    ) => void,
    errorListener?: (pack: OfflinePack, err: OfflineProgressError) => void,
  ): Promise<void>;
  deletePack(name: string): Promise<void>;
  invalidatePack(name: string): Promise<void>;
  getPacks(): Promise<Array<OfflinePack>>;
  getPack(name: string): Promise<OfflinePack | undefined>;
  invalidateAmbientCache(): Promise<void>;
  clearAmbientCache(): Promise<void>;
  setMaximumAmbientCacheSize(size: number): Promise<void>;
  resetDatabase(): Promise<void>;
  setTileCountLimit(limit: number): void;
  setProgressEventThrottle(throttleValue: number): void;
  subscribe(
    packName: string,
    progressListener: (pack: OfflinePack, status: object) => void,
    errorListener?: (pack: OfflinePack, err: object) => void,
  ): void;
  unsubscribe(packName: string): void;
}
