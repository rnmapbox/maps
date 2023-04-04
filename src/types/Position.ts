declare const __brand: unique symbol;

type CreateBrandType<InputType, BrandName extends string> = InputType & {
  [__brand]?: BrandName;
};

type Longitude = CreateBrandType<number, 'Longitude'>;
type Latitude = CreateBrandType<number, 'Latitude'>;

export type Position = [Longitude, Latitude];
