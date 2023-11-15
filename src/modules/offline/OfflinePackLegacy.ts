import { NativeModules } from 'react-native';

import OfflineCreatePackOptions from './OfflineCreatePackOptions';

const MapboxGLOfflineManager = NativeModules.RNMBXOfflineModuleLegacy;

type OfflinePackStatus = {
  name: string;
  state: number;
  percentage: number;
  completedResourceCount: number;
  completedResourceSize: number;
  completedTileSize: number;
  completedTileCount: number;
  requiredResourceCount: number;
};

class OfflinePackLegacy {
  private pack: OfflineCreatePackOptions;
  private _metadata: any;
  constructor(pack: OfflineCreatePackOptions) {
    this.pack = pack;
    this._metadata = null;
  }

  get name() {
    const { metadata } = this;
    return metadata && metadata.name;
  }

  get bounds() {
    return this.pack.bounds;
  }

  get metadata() {
    if (!this._metadata && this.pack.metadata) {
      this._metadata = JSON.parse(this.pack.metadata);
    }
    return this._metadata;
  }

  status(): Promise<OfflinePackStatus> {
    return MapboxGLOfflineManager.getPackStatus(this.name);
  }

  resume(): Promise<void> {
    return MapboxGLOfflineManager.resumePackDownload(this.name);
  }

  pause(): Promise<void> {
    return MapboxGLOfflineManager.pausePackDownload(this.name);
  }
}

export default OfflinePackLegacy;
