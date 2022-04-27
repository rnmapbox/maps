import { NativeModules } from 'react-native';

import OfflinePack from '../../../javascript/modules/offline/OfflinePack';

describe('OfflinePack', () => {
  const fakeNativePack = {
    bounds: [
      [0, 1],
      [2, 3],
    ],
    metadata: '{"name":"test"}',
  };

  it('should contain a valid pack', () => {
    const offlinePack = new OfflinePack(fakeNativePack);
    expect(offlinePack.bounds).toEqual(fakeNativePack.bounds);
    expect(offlinePack.name).toEqual('test');
    expect(offlinePack.metadata).toEqual(JSON.parse(fakeNativePack.metadata));
  });

  it('should resume pack download', () => {
    const spy = jest.spyOn(
      NativeModules.MGLOfflineModule,
      'resumePackDownload',
    );
    const offlinePack = new OfflinePack(fakeNativePack);
    offlinePack.resume();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should pause pack download', () => {
    const spy = jest.spyOn(NativeModules.MGLOfflineModule, 'pausePackDownload');
    const offlinePack = new OfflinePack(fakeNativePack);
    offlinePack.pause();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should get pack status', () => {
    const spy = jest.spyOn(NativeModules.MGLOfflineModule, 'getPackStatus');
    const offlinePack = new OfflinePack(fakeNativePack);
    offlinePack.status();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
