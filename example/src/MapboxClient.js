import MapboxClient from 'mapbox';

import config from './utils/config';

const client = new MapboxClient(config.get('accessToken'));
export default client;
