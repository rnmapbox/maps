import mapboxglCss from './mapboxglCss';

const styleElementId = 'rnmapbox-mapbox-gl-css';

// Same check mapbox-gl uses to warn about missing CSS: its stylesheet colors .mapboxgl-canary salmon
function hasMapboxGLStyles() {
  const canary = document.createElement('div');
  canary.className = 'mapboxgl-canary';
  document.body.appendChild(canary);
  const present =
    getComputedStyle(canary).backgroundColor === 'rgb(250, 128, 114)';
  canary.remove();
  return present;
}

export function injectMapboxGLStyles() {
  if (document.getElementById(styleElementId) || hasMapboxGLStyles()) {
    return;
  }
  const style = document.createElement('style');
  style.id = styleElementId;
  style.textContent = mapboxglCss;
  // First in <head>, so app stylesheets still override mapbox-gl's defaults
  document.head.prepend(style);
}
