import env from '../../env.json';

class Config {
  // @ts-ignore - Parameter type requires TypeScript annotation
  get(key) {
    return env[key];
  }
}

const config = new Config();
export default config;
