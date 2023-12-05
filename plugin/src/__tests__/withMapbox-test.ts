import {
  applyCocoaPodsModifications,
  _addMapboxMavenRepo,
} from '../withMapbox';

import * as iosFixtures from './fixtures/cocoapodFiles';
import * as androidFixtures from './fixtures/buildGradleFiles';

describe('applyAndroidGradleModifications', () => {
  it(`adds the correct repo to build.gradle`, () => {
    const result = _addMapboxMavenRepo(androidFixtures.expoTemplateBuildGradle);
    expect(result).toMatchSnapshot();
  });

  it(`adds the correct maven repo under allProjects to build.gradle`, () => {
    const result = _addMapboxMavenRepo(
      androidFixtures.expoTemplateBuildGradleWithoutMavenLocal,
    );
    expect(result).toMatchSnapshot();
  });

  it(`adds the correct maven repo under allProjects to build.gradle with expo-camera`, () => {
    const result = _addMapboxMavenRepo(
      androidFixtures.expoTemplateBuildGradleWithExpoCamera,
    );
    expect(result).toMatchSnapshot();
  });
});

describe('applyCocoaPodsModifications', () => {
  it('adds blocks to a react native template podfile', () => {
    expect(
      applyCocoaPodsModifications(iosFixtures.reactNativeTemplatePodfile, {}),
    ).toMatchSnapshot();
  });
  it('adds blocks to a react native template podfile with params', () => {
    expect(
      applyCocoaPodsModifications(iosFixtures.reactNativeTemplatePodfile, {
        RNMapboxMapsUseV11: true,
        RNMapboxMapsVersion: '11.0.0.beta4',
        RNMapboxMapsDownloadToken: 'pk.123',
      }),
    ).toMatchSnapshot();
  });
  it('adds blocks to a expo prebuild template podfile', () => {
    expect(
      applyCocoaPodsModifications(iosFixtures.expoTemplatePodfile, {}),
    ).toMatchSnapshot();
  });
  it('adds blocks to a expo prebuild template podfile with custom modifications', () => {
    expect(
      applyCocoaPodsModifications(iosFixtures.customExpoTemplatePodfile, {}),
    ).toMatchSnapshot();
  });
  it('fails to add blocks to a bare podfile', () => {
    expect(() =>
      applyCocoaPodsModifications(iosFixtures.blankTemplatePodfile, {}),
    ).toThrow('Failed to match');
    expect(() => applyCocoaPodsModifications('', {})).toThrow(
      'Failed to match',
    );
  });
  it('does not re add blocks to an applied template podfile', () => {
    const runOnce = applyCocoaPodsModifications(
      iosFixtures.reactNativeTemplatePodfile,
      {},
    );

    expect(applyCocoaPodsModifications(runOnce, {})).toMatch(runOnce);
  });
  it('works after revisions to blocks', () => {
    const runOnce = applyCocoaPodsModifications(
      iosFixtures.expoTemplateWithRevisions,
      {},
    );

    expect(runOnce).toMatchSnapshot();
  });
  // A known issue is that the regex won't work if the template
  // has a pre_install/post_install blocmk commented out, before the `use_react_native` function.
  it('does not work with revisions to blocks after comments', () => {
    const runOnce = applyCocoaPodsModifications(
      iosFixtures.expoTemplateWithRevisionsAfterComments,
      {},
    );

    expect(runOnce).toMatchSnapshot();
  });
});
