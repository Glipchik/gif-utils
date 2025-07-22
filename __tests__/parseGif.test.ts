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
  expect(parsed.frames[0].imageData?.length).toBe(6);
});