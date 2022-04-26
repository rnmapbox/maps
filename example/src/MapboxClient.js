import MapboxDirectionsFactory from '@mapbox/mapbox-sdk/services/directions';

import config from './utils/config';

const clientOptions = { accessToken: config.get('accessToken') };
const directionsClient = MapboxDirectionsFactory(clientOptions);

export { directionsClient };
