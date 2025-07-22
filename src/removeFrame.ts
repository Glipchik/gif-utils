import { ParsedGif } from './types';

export const removeFrame = (parsed: ParsedGif, index: number): ParsedGif => {
  const frames = parsed.frames.filter((_, i) => i !== index);
  return { ...parsed, frames };
};

// ToDo: add overloads for accepting an array of indices
