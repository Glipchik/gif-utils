import { ParsedGif, GifFrame } from './types';

export const addFrame = (parsed: ParsedGif, frame: GifFrame): ParsedGif => {
  return {
    ...parsed,
    frames: [...parsed.frames, frame],
  };
};

// ToDo: add overloads for accepting an array of frames
