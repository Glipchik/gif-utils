import { ParsedGif } from './types';

export const changeGifSpeed = (parsed: ParsedGif, speedMultiplier: number): ParsedGif => {
  const frames = parsed.frames.map((frame) => ({
    ...frame,
    gce: {
      ...frame.gce,
      delayTime: Math.round(frame.gce.delayTime * speedMultiplier),
    },
  }));
  return { ...parsed, frames };
};
