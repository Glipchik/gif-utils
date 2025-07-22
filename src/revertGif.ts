import { ParsedGif } from './types';

export const revertGif = (parsed: ParsedGif): ParsedGif => {
  return {
    ...parsed,
    frames: [...parsed.frames].reverse(),
  };
};
