export interface GifHeader {
  signature: string;
  version: string;
}

export interface LogicalScreenDescriptor {
  width: number;
  height: number;
  globalColorTableFlag: boolean;
  colorResolution: number;
  sortFlag: boolean;
  sizeOfGlobalColorTable: number;
  backgroundColorIndex: number;
  pixelAspectRatio: number;
}

export interface GraphicControlExtension {
  disposalMethod: number;
  userInputFlag: boolean;
  transparencyFlag: boolean;
  delayTime: number;
  transparentColorIndex: number;
}

export interface GifFrame {
  gce: GraphicControlExtension;
  imageData: Uint8Array;
  left: number;
  top: number;
  width: number;
  height: number;
  localColorTable?: Uint8Array;
}

export interface ParsedGif {
  header: GifHeader;
  logicalScreenDescriptor: LogicalScreenDescriptor;
  globalColorTable?: Uint8Array;
  frames: GifFrame[];
}
