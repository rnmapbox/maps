import { isBoolean, isNumber, isString } from './index';

const Types = {
  Array: 'array',
  Bool: 'boolean',
  Number: 'number',
  String: 'string',
  HashMap: 'hashmap',
};

export default class BridgeValue {
  constructor(rawValue) {
    this.rawValue = rawValue;
  }

  get type() {
    if (Array.isArray(this.rawValue)) {
      return Types.Array;
    }
    if (isBoolean(this.rawValue)) {
      return Types.Bool;
    }
    if (isNumber(this.rawValue)) {
      return Types.Number;
    }
    if (isString(this.rawValue)) {
      return Types.String;
    }
    if (this.rawValue && typeof this.rawValue === 'object') {
      return Types.HashMap;
    }
    throw new Error(
      `[type - ${this.rawValue}] BridgeValue must be a primitive/array/object`,
    );
  }

  get value() {
    const { type } = this;

    let value;

    if (type === Types.Array) {
      value = [];

      for (const innerRawValue of this.rawValue) {
        const bridgeValue = new BridgeValue(innerRawValue);
        value.push(bridgeValue.toJSON());
      }
    } else if (type === Types.HashMap) {
      value = [];

      const stringKeys = Object.keys(this.rawValue);
      for (const stringKey of stringKeys) {
        value.push([
          new BridgeValue(stringKey).toJSON(),
          new BridgeValue(this.rawValue[stringKey]).toJSON(),
        ]);
      }
    } else if (
      type === Types.Bool ||
      type === Types.Number ||
      type === Types.String
    ) {
      value = this.rawValue;
    } else {
      throw new Error(
        `[value - ${this.rawValue}] BridgeValue must be a primitive/array/object`,
      );
    }

    return value;
  }

  toJSON(formatter) {
    return {
      type: this.type,
      value:
        typeof formatter === 'function' ? formatter(this.value) : this.value,
    };
  }
}
