import { useMemo } from 'react';
import type { Layout } from '../types';

interface Params {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isFullscreen: boolean;
}

export function useBoardLayout({
  width,
  height,
  isMobile,
  isTablet,
  isFullscreen,
}: Params): Layout {
  return useMemo(() => {
    const outerPad = isMobile ? 16 : 24;
    const gap = 16;
    const availW = Math.max(0, width - outerPad * 2);
    const availH = Math.max(0, height - outerPad * 2);

    if (!width || !height) {
      return {
        size: 320,
        horizontal: false,
        sideWidth: 0,
        outerPad,
        boardPad: 8,
        gap: 6,
        showHint: false,
        scoreSize: 'md',
      };
    }

    const isLandscape = width > height;
    const sideWidth = isMobile ? 150 : 170;
    const canHorizontal =
      (isMobile || isTablet) &&
      isLandscape &&
      availW - sideWidth - gap >= 220 &&
      availH >= 180;

    if (canHorizontal) {
      const size = Math.min(availH, availW - sideWidth - gap);
      return {
        size,
        horizontal: true,
        sideWidth,
        outerPad,
        boardPad: 6,
        gap: 5,
        showHint: true,
        scoreSize: 'sm',
      };
    }

    const size = Math.max(
      200,
      Math.min(
        availW,
        availH - (isMobile ? 120 : 140) - (height < 720 ? 0 : 40),
        isFullscreen ? 900 : isMobile ? 520 : isTablet ? 600 : 540,
      ),
    );

    return {
      size,
      horizontal: false,
      sideWidth: 0,
      outerPad,
      boardPad: isMobile ? 8 : 10,
      gap: isMobile ? 6 : 8,
      showHint: height >= 720,
      scoreSize: isMobile && size < 340 ? 'sm' : 'md',
    };
  }, [width, height, isMobile, isTablet, isFullscreen]);
}