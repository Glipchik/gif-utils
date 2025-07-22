import * as fs from 'fs';
import * as path from 'path';

import { parseGif } from '../src/parseGif';
import { ParsedGif } from '../src/types';
import { createMinimalGif89a, createGif89aWithGlobalColorTable, createGif89aWithOneFrame } from './fixtures/gifFixtures';

test('Parses header correctly for minimal GIF89a', () => {
  const buffer = createMinimalGif89a().buffer;
  const parsed: ParsedGif = parseGif(buffer);

  expect(parsed.header.signature).toBe('GIF');
  expect(parsed.header.version).toBe('89a');
});

test('Parses logical screen descriptor correctly for minimal GIF89a', () => {
  const buffer = createMinimalGif89a().buffer;
  const parsed: ParsedGif = parseGif(buffer);

  expect(parsed.logicalScreenDescriptor.width).toBe(1);
  expect(parsed.logicalScreenDescriptor.height).toBe(1);
  expect(parsed.logicalScreenDescriptor.globalColorTableFlag).toBe(false);
  expect(parsed.logicalScreenDescriptor.colorResolution).toBe(1);
  expect(parsed.logicalScreenDescriptor.sortFlag).toBe(false);
  expect(parsed.logicalScreenDescriptor.sizeOfGlobalColorTable).toBe(0);
  expect(parsed.logicalScreenDescriptor.backgroundColorIndex).toBe(0);
  expect(parsed.logicalScreenDescriptor.pixelAspectRatio).toBe(0);
});

test('Parses logical screen descriptor correctly for GIF89a with Global Color Table', () => {
  const buffer = createGif89aWithGlobalColorTable().buffer;
  const parsed: ParsedGif = parseGif(buffer);

  expect(parsed.logicalScreenDescriptor.width).toBe(1);
  expect(parsed.logicalScreenDescriptor.height).toBe(1);
  expect(parsed.logicalScreenDescriptor.globalColorTableFlag).toBe(true);
  expect(parsed.logicalScreenDescriptor.colorResolution).toBe(1);
  expect(parsed.logicalScreenDescriptor.sortFlag).toBe(false);
  expect(parsed.logicalScreenDescriptor.sizeOfGlobalColorTable).toBe(2);
  expect(parsed.logicalScreenDescriptor.backgroundColorIndex).toBe(0);
  expect(parsed.logicalScreenDescriptor.pixelAspectRatio).toBe(0);

  expect(parsed.globalColorTable).toBeDefined();
  expect(parsed.globalColorTable?.length).toBe(6);

  // First color: Black (R=0,G=0,B=0)
  expect(parsed.globalColorTable?.[0]).toBe(0);
  expect(parsed.globalColorTable?.[1]).toBe(0);
  expect(parsed.globalColorTable?.[2]).toBe(0);

  // Second color: White (R=255,G=255,B=255)
  expect(parsed.globalColorTable?.[3]).toBe(255);
  expect(parsed.globalColorTable?.[4]).toBe(255);
  expect(parsed.globalColorTable?.[5]).toBe(255);
});

test('Parses graphic control extension correctly for GIF89a', () => {
  const buffer = createGif89aWithOneFrame().buffer;
  const parsed: ParsedGif = parseGif(buffer);

  expect(parsed.frames[0].gce).toBeDefined();
  expect(parsed.frames[0].gce?.disposalMethod).toBe(0);
  expect(parsed.frames[0].gce?.userInputFlag).toBe(false);
  expect(parsed.frames[0].gce?.transparencyFlag).toBe(true);
  expect(parsed.frames[0].gce?.delayTime).toBe(10);
  expect(parsed.frames[0].gce?.transparentColorIndex).toBe(0);
});

test('Parses image descriptor correctly for GIF89a', () => {
  const buffer = createGif89aWithOneFrame().buffer;
  const parsed: ParsedGif = parseGif(buffer);

  expect(parsed.frames[0].left).toBe(0);
  expect(parsed.frames[0].top).toBe(0);
  expect(parsed.frames[0].width).toBe(2);
  expect(parsed.frames[0].height).toBe(2);
  expect(parsed.frames[0].imageData).toBeDefined();
  expect(parsed.frames[0].imageData?.length).toBe(9);
});

// parse test gif files

test('Parses traffic light gif', () => {
  const fileBuffer = fs.readFileSync(path.join(__dirname, 'test-gifs', 'traffic-light.gif'));
  const buffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
  const parsed: ParsedGif = parseGif(buffer);

  // global color table
  expect(parsed.globalColorTable).toBeDefined();
  expect(parsed.globalColorTable?.length).toBe(24);
  expect(parsed.globalColorTable?.[0]).toBe(255);
  expect(parsed.globalColorTable?.[1]).toBe(0);
  expect(parsed.globalColorTable?.[2]).toBe(0);
  expect(parsed.globalColorTable?.[3]).toBe(0);
  expect(parsed.globalColorTable?.[4]).toBe(255);
  expect(parsed.globalColorTable?.[5]).toBe(0);
  expect(parsed.globalColorTable?.[6]).toBe(255);
  expect(parsed.globalColorTable?.[7]).toBe(255);
  expect(parsed.globalColorTable?.[8]).toBe(0);

  // frame 1
  expect(parsed.frames[0].gce).toBeDefined();
  expect(parsed.frames[0].gce?.disposalMethod).toBe(1);
  expect(parsed.frames[0].gce?.userInputFlag).toBe(false);
  expect(parsed.frames[0].gce?.transparencyFlag).toBe(false);
  expect(parsed.frames[0].gce?.delayTime).toBe(100);
  expect(parsed.frames[0].gce?.transparentColorIndex).toBe(0);
  expect(parsed.frames[0].left).toBe(0);
  expect(parsed.frames[0].top).toBe(0);
  expect(parsed.frames[0].width).toBe(11);
  expect(parsed.frames[0].height).toBe(29);
  expect(parsed.frames[0].imageData).toBeDefined();
  expect(parsed.frames[0].imageData?.length).toBe(51);

  // frame 2
  expect(parsed.frames[1].gce).toBeDefined();
  expect(parsed.frames[1].gce?.disposalMethod).toBe(1);
  expect(parsed.frames[1].gce?.userInputFlag).toBe(false);
  expect(parsed.frames[1].gce?.transparencyFlag).toBe(false);
  expect(parsed.frames[1].gce?.delayTime).toBe(50);
  expect(parsed.frames[1].gce?.transparentColorIndex).toBe(0);
  expect(parsed.frames[1].left).toBe(2);
  expect(parsed.frames[1].top).toBe(11);
  expect(parsed.frames[1].width).toBe(7);
  expect(parsed.frames[1].height).toBe(16);
  expect(parsed.frames[1].imageData).toBeDefined();
  expect(parsed.frames[1].imageData?.length).toBe(28);

  // frame 3
  expect(parsed.frames[2].gce).toBeDefined();
  expect(parsed.frames[2].gce?.disposalMethod).toBe(1);
  expect(parsed.frames[2].gce?.userInputFlag).toBe(false);
  expect(parsed.frames[2].gce?.transparencyFlag).toBe(false);
  expect(parsed.frames[2].gce?.delayTime).toBe(100);
  expect(parsed.frames[2].gce?.transparentColorIndex).toBe(0);
  expect(parsed.frames[2].left).toBe(2);
  expect(parsed.frames[2].top).toBe(2);
  expect(parsed.frames[2].width).toBe(7);
  expect(parsed.frames[2].height).toBe(16);
  expect(parsed.frames[2].imageData).toBeDefined();
  expect(parsed.frames[2].imageData?.length).toBe(28);
});