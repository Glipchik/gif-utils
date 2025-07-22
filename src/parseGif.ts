import { GifFrame, GraphicControlExtension, ParsedGif } from './types';

export const parseGif = (buffer: ArrayBuffer): ParsedGif => {
  const view = new DataView(buffer);

  const header = parseHeader(view, 0);

  const logicalScreenDescriptor = parseLogicalScreenDescriptor(view, 6);

  const headerAndLogicalScreenDescriptorSize = 6 + 7;

  const globalColorTable = parseColorTable(
    view,
    logicalScreenDescriptor.globalColorTableFlag,
    logicalScreenDescriptor.sizeOfGlobalColorTable,
    headerAndLogicalScreenDescriptorSize
  );

  const offset = headerAndLogicalScreenDescriptorSize + (globalColorTable?.length ?? 0);

  const frames = parseFrames(view, buffer.byteLength, offset);

  return {
    header,
    logicalScreenDescriptor,
    globalColorTable,
    frames,
  };
};

const parseHeader = (view: DataView, offset: number = 0) => {
  const signature = String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2)
  );
  const version = String.fromCharCode(
    view.getUint8(offset + 3),
    view.getUint8(offset + 4),
    view.getUint8(offset + 5)
  );

  if (signature !== 'GIF') {
    throw new Error('Not a GIF file');
  }

  return {
    signature,
    version,
  };
};

const parseLogicalScreenDescriptor = (view: DataView, offset: number = 6) => {
  const width = view.getUint16(offset, true);
  const height = view.getUint16(offset + 2, true);
  const packedFields = view.getUint8(offset + 4);

  const globalColorTableFlag = (packedFields & 0b10000000) !== 0;
  const colorResolution = ((packedFields & 0b01110000) >> 4) + 1;
  const sortFlag = (packedFields & 0b00001000) !== 0;
  const sizeOfGlobalColorTable = globalColorTableFlag ? 2 ** ((packedFields & 0b00000111) + 1) : 0;

  const backgroundColorIndex = view.getUint8(offset + 5);
  const pixelAspectRatio = view.getUint8(offset + 6);

  return {
    width,
    height,
    globalColorTableFlag,
    colorResolution,
    sortFlag,
    sizeOfGlobalColorTable,
    backgroundColorIndex,
    pixelAspectRatio,
  };
};

const parseColorTable = (
  view: DataView,
  colorTableFlag?: boolean,
  sizeOfColorTable?: number,
  offset: number = 13 // todo: check if this is correct
) => {
  colorTableFlag ??= (view.getUint8(offset - 1) & 0b10000000) !== 0;

  sizeOfColorTable ??= 2 ** ((view.getUint8(offset - 1) & 0b00000111) + 1);

  if (!colorTableFlag || sizeOfColorTable === 0) {
    return undefined;
  }

  const colorTable: Uint8Array = new Uint8Array(sizeOfColorTable * 3);

  for (let i = 0; i < sizeOfColorTable; i++) {
    const red = view.getUint8(offset + i * 3);
    const green = view.getUint8(offset + 1 + i * 3);
    const blue = view.getUint8(offset + 2 + i * 3);
    colorTable[i * 3] = red;
    colorTable[i * 3 + 1] = green;
    colorTable[i * 3 + 2] = blue;
  }

  return colorTable;
};

const parseFrames = (view: DataView, bufferLength: number, offset: number): GifFrame[] => { // todo: refactor this function to correctly create, store and assign frames 
  const frames: GifFrame[] = [];
  let currentGCE: GraphicControlExtension | undefined; // Keep track of the last seen GCE

  while (offset < bufferLength) {
    let blockType = view.getUint8(offset);

    if (blockType === 0x21) {
      let label = view.getUint8(offset + 1);
      switch (label) {
        case 0xf9: {
          const gceResult = parseGraphicControlExtension(view, offset);
          currentGCE = gceResult.gce;
          offset = gceResult.nextOffset;
          break;
        }
        default: { // todo: implement other extension blocks
          // Skip unknown extension blocks for now
          offset = skipExtensionBlock(view, offset);
          break;
        }
      }
    } else if (blockType === 0x2c) {
      const frame: GifFrame = {
        gce: currentGCE || {
          disposalMethod: 0,
          userInputFlag: false,
          transparencyFlag: false,
          delayTime: 0,
          transparentColorIndex: 0,
        },
        imageData: new Uint8Array(),
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };

      const imageContentResult = parseImageContent(view, offset);
      Object.assign(frame, imageContentResult.imageContent);
      offset = imageContentResult.nextOffset;
      
      frames.push(frame);
    } else if (blockType === 0x3b) {
      break;
    } else {
      throw new Error(`Unknown block type at offset ${offset}: ${blockType}`);
    }
  }

  return frames;
};

const parseGraphicControlExtension = (
  view: DataView,
  offset: number
): { gce: GraphicControlExtension; nextOffset: number } => {
  const blockSize = view.getUint8(offset + 2);
  if (blockSize !== 4) {
    throw new Error('Invalid GCE block size');
  }

  const packed = view.getUint8(offset + 3);
  const disposalMethod = (packed >> 2) & 0b00000111;
  const userInputFlag = (packed & 0b10) !== 0;
  const transparencyFlag = (packed & 0b1) !== 0;

  const delayTime = view.getUint16(offset + 4, true);
  const transparentColorIndex = view.getUint8(offset + 6);
  const blockTerminator = view.getUint8(offset + 7); 

  if (blockTerminator !== 0x00) {
    throw new Error('Invalid GCE block terminator');
  }

  const gce: GraphicControlExtension = {
    disposalMethod,
    userInputFlag,
    transparencyFlag,
    delayTime,
    transparentColorIndex,
  };

  return {
    gce,
    nextOffset: offset + 8,
  };
};

const parseImageContent = (
  view: DataView,
  offset: number
): { imageContent: Omit<GifFrame, 'gce'>; nextOffset: number } => {
  if (view.getUint8(offset) !== 0x2C) {
    throw new Error('Invalid Image Descriptor introducer');
  }

  const left = view.getUint16(offset + 1, true);
  const top = view.getUint16(offset + 3, true);
  const width = view.getUint16(offset + 5, true);
  const height = view.getUint16(offset + 7, true);

  const packed = view.getUint8(offset + 9);
  const localColorTableFlag = (packed & 0b10000000) !== 0;
  const interlaceFlag = (packed & 0b01000000) !== 0;
  const sortFlag = (packed & 0b00100000) !== 0;
  const sizeOfLocalColorTable = localColorTableFlag ? 2 ** ((packed & 0b00000111) + 1) : 0;

  let ptr = offset + 10;

  let localColorTable: Uint8Array | undefined;
  if (localColorTableFlag) {
    localColorTable = parseColorTable(view, localColorTableFlag, sizeOfLocalColorTable, ptr);
    ptr += sizeOfLocalColorTable * 3;
  }
  const imageDataChunks: number[] = [];

  const lzwMinCodeSize = view.getUint8(ptr);
  imageDataChunks.push(lzwMinCodeSize);
  ptr += 1;

  while (true) {
    const blockSize = view.getUint8(ptr);
    imageDataChunks.push(blockSize);
    ptr += 1;
    if (blockSize === 0) {
      break;
    }
    for (let i = 0; i < blockSize; i++) {
      imageDataChunks.push(view.getUint8(ptr + i));
    }
    ptr += blockSize;
  }

  return {
    imageContent: {
      left,
      top,
      width,
      height,
      imageData: new Uint8Array(imageDataChunks),
      localColorTable
    },
    nextOffset: ptr
  };
};

const skipExtensionBlock = (view: DataView, offset: number): number => {
  let ptr = offset + 2;
  let blockSize: number;

  do {
    blockSize = view.getUint8(ptr);
    ptr += 1 + blockSize;
  } while (blockSize !== 0);

  return ptr;
};
