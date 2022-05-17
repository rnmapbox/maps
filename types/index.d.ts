import { Component } from 'react';

import { InterpolationMode, NamedStyles } from '..';

export function removeCustomHeader(headerName: string): void;
export function addCustomHeader(headerName: string, headerValue: string): void;
export function setAccessToken(accessToken: string | null): void;
export function getAccessToken(): Promise<string>;
export function setTelemetryEnabled(telemetryEnabled: boolean): void;
export function setConnected(connected: boolean): void;

export class StyleSheet extends Component {
  static create<T extends NamedStyles<T> | NamedStyles<any>>(styles: T): T;
  camera(
    stops: { [key: number]: string },
    interpolationMode?: InterpolationMode,
  ): void;
  source(
    stops: { [key: number]: string },
    attributeName: string,
    interpolationMode?: InterpolationMode,
  ): void;
  composite(
    stops: { [key: number]: string },
    attributeName: string,
    interpolationMode?: InterpolationMode,
  ): void;

  identity(attributeName: string): number;
}

export class OfflinePack extends Component {
  status(): void;
  resume(): void;
  pause(): void;
}
