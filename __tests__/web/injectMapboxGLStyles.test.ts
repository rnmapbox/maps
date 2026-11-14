/**
 * @jest-environment jsdom
 */
import { injectMapboxGLStyles } from '../../src/web/injectMapboxGLStyles';
import mapboxglCss from '../../src/web/mapboxglCss';

const injectedStyles = () =>
  document.querySelectorAll('style#rnmapbox-mapbox-gl-css');

describe('injectMapboxGLStyles', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  test('injects the mapbox-gl CSS once', () => {
    injectMapboxGLStyles();
    injectMapboxGLStyles();

    expect(injectedStyles()).toHaveLength(1);
    expect(injectedStyles()[0]!.textContent).toBe(mapboxglCss);
  });

  test('injects before existing stylesheets', () => {
    document.head.innerHTML = '<style id="app">.app{}</style>';

    injectMapboxGLStyles();

    expect(document.head.firstElementChild!.id).toBe('rnmapbox-mapbox-gl-css');
  });

  test('skips injection when the app already loads the mapbox-gl CSS', () => {
    document.head.innerHTML =
      '<style>.mapboxgl-canary{background-color:rgb(250, 128, 114)}</style>';

    injectMapboxGLStyles();

    expect(injectedStyles()).toHaveLength(0);
    expect(document.querySelector('.mapboxgl-canary')).toBeNull();
  });
});
