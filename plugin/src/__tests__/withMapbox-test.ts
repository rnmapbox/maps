import { applyCocoaPodsModifications } from '../withMapbox';

import * as fixtures from './fixtures/cocoapodFiles';

describe(applyCocoaPodsModifications, () => {
  it('adds blocks to a react native template podfile', () => {
    expect(
      applyCocoaPodsModifications(fixtures.reactNativeTemplatePodfile, {}),
    ).toMatchSnapshot();
  });
  it('adds blocks to a expo prebuild template podfile', () => {
    expect(
      applyCocoaPodsModifications(fixtures.expoTemplatePodfile, {}),
    ).toMatchSnapshot();
  });
  it('adds blocks to a expo prebuild template podfile with custom modifications ', () => {
    expect(
      applyCocoaPodsModifications(fixtures.customExpoTemplatePodfile, {}),
    ).toMatchSnapshot();
  });
  it('fails to add blocks to a bare podfile', () => {
    expect(() =>
      applyCocoaPodsModifications(fixtures.blankTemplatePodfile, {}),
    ).toThrow('Failed to match');
    expect(() => applyCocoaPodsModifications('', {})).toThrow(
      'Failed to match',
    );
  });
  it('does not re add blocks to an applied template podfile', () => {
    const runOnce = applyCocoaPodsModifications(
      fixtures.reactNativeTemplatePodfile,
      {},
    );

    expect(applyCocoaPodsModifications(runOnce, {})).toMatch(runOnce);
  });
  it('works after revisions to blocks', () => {
    const runOnce = applyCocoaPodsModifications(
      fixtures.expoTemplateWithRevisions,
      {},
    );

    expect(runOnce).toMatchSnapshot();
  });
  // A known issue is that the regex won't work if the template
  // has a pre_install/post_install blocmk commented out, before the `use_react_native` function.
  it('does not work with revisions to blocks after comments', () => {
    const runOnce = applyCocoaPodsModifications(
      fixtures.expoTemplateWithRevisionsAfterComments,
      {},
    );

    expect(runOnce).toMatchSnapshot();
  });
});
