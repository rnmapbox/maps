import { AllLayerStyleProps } from './MapboxStyles';
declare type StyleValueArray = {
    type: 'array';
    value: [any];
};
declare type StyleValueNumber = {
    type: 'number';
    value: number;
};
declare type StyleValueString = {
    type: 'string';
    value: string;
};
export declare type StyleValue = {
    styletype: string;
    stylevalue: StyleValueArray | StyleValueNumber | StyleValueString;
};
export declare function transformStyle(style: AllLayerStyleProps): undefined | {
    [key: string]: StyleValue;
};
export {};
//# sourceMappingURL=StyleValue.d.ts.map