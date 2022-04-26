import { NativeModules } from 'react-native';

const MapboxGLOfflineManager = NativeModules.MGLOfflineModule;

class OfflinePack {
  constructor(pack) {
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

  status() {
    return MapboxGLOfflineManager.getPackStatus(this.name);
  }

  resume() {
    return MapboxGLOfflineManager.resumePackDownload(this.name);
  }

  pause() {
    return MapboxGLOfflineManager.pausePackDownload(this.name);
  }
}

export default OfflinePack;
