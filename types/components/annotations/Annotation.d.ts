export default Annotation;
declare class Annotation extends React.Component<any, any, any> {
    static propTypes: {
        id: PropTypes.Validator<string>;
        animated: PropTypes.Requireable<boolean>;
        animationDuration: PropTypes.Requireable<number>;
        animationEasingFunction: PropTypes.Requireable<(...args: any[]) => any>;
        coordinates: PropTypes.Requireable<(number | null | undefined)[]>;
        onPress: PropTypes.Requireable<(...args: any[]) => any>;
        children: PropTypes.Requireable<any>;
        style: PropTypes.Requireable<any>;
        icon: PropTypes.Requireable<NonNullable<string | number | object | null | undefined>>;
    };
    static defaultProps: {
        animated: boolean;
        animationDuration: number;
        animationEasingFunction: import("react-native").EasingFunction;
    };
    constructor(props: any);
    state: {
        shape: AnimatedMapPoint | {
            type: string;
            coordinates: any[];
        };
    };
    onPress(): void;
    componentDidUpdate(prevProps: any): void;
    _getShapeFromProps(props?: {}): {
        type: string;
        coordinates: any[];
    };
    get symbolStyle(): any;
    render(): JSX.Element | null;
}
import React from "react";
import AnimatedMapPoint from "../../utils/animated/AnimatedPoint";
import PropTypes from "prop-types";
//# sourceMappingURL=Annotation.d.ts.map