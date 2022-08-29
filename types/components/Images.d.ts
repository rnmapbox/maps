export const NATIVE_MODULE_NAME: "RCTMGLImages";
export default Images;
/**
 * Images defines the images used in Symbol etc layers
 */
declare class Images extends React.Component<any, any, any> {
    static NATIVE_ASSETS_KEY: string;
    static propTypes: any;
    constructor(props: any);
    constructor(props: any, context: any);
    _getImages(): {
        images?: undefined;
        nativeImages?: undefined;
    } | {
        images: {};
        nativeImages: any;
    };
    _onImageMissing(event: any): void;
    render(): JSX.Element;
}
import React from "react";
//# sourceMappingURL=Images.d.ts.map