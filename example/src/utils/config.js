import env from '../../env.json';

class Config {
  get(key: string) {
    return env[key];
  }
}

const config = new Config();
export default config;
