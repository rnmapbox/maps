import {NativeModules, NativeEventEmitter} from 'react-native';

const MapboxGL = NativeModules.MGLModule;
const MapboxGLLocationManager = NativeModules.MGLLocationModule;

export const LocationModuleEventEmitter = new NativeEventEmitter(
  MapboxGLLocationManager,
);

class LocationManager {
  constructor() {
    this._listeners = [];
    this._lastKnownLocation = null;
    this._isListening = false;
    this._isPaused = false;
    this.onUpdate = this.onUpdate.bind(this);
  }

  async getLastKnownLocation() {
    if (!this._lastKnownLocation) {
      const lastKnownLocation = await MapboxGLLocationManager.getLastKnownLocation();
      this._lastKnownLocation = lastKnownLocation;
    }
    return this._lastKnownLocation;
  }

  addListener(listener) {
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);

      if (this._lastKnownLocation) {
        listener(this._lastKnownLocation);
      }
    }
  }

  removeListener(listener) {
    this._listeners = this._listeners.filter(l => l !== listener);
  }

  removeAllListeners() {
    this._listeners = [];
  }

  start() {
    if (this._isPaused) {
      MapboxGLLocationManager.start();
      this._isPaused = false;
      return;
    }

    if (!this._isListening) {
      MapboxGLLocationManager.start();

      LocationModuleEventEmitter.addListener(
        MapboxGL.LocationCallbackName.Update,
        this.onUpdate,
      );

      this._isListening = true;
    }
  }

  pause() {
    if (!this._isPaused && this._isListening) {
      MapboxGLLocationManager.pause();
      this._isListening = false;
    }
  }

  dispose() {
    MapboxGLLocationManager.stop();

    if (this._isListening) {
      LocationModuleEventEmitter.removeListener(
        MapboxGL.LocationCallbackName.Update,
        this.onUpdate,
      );
    }

    this._isListening = false;
  }

  onUpdate(location) {
    this._lastKnownLocation = location;

    for (const listener of this._listeners) {
      listener(location);
    }
  }
}

export default new LocationManager();
