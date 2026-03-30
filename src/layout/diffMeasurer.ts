/**
 * Measures line heights using @chenglou/pretext for predictive text measurement.
 * This avoids DOM measurement and enables virtualization of 100K+ line diffs.
 */

interface MeasurerOptions {
  font: string;
  lineHeight: number;
  containerWidth: number;
  wordWrap: boolean;
}

/**
 * Measure the rendered height of a single text line.
 * With word-wrap disabled, every line has the same height.
 * With word-wrap enabled, pretext predicts how many visual lines the text wraps into.
 */
export function measureLineHeight(
  text: string,
  options: MeasurerOptions,
  pretextMeasure?: (text: string, font: string, maxWidth: number) => { width: number }
): number {
  if (!options.wordWrap || !pretextMeasure) {
    return options.lineHeight;
  }

  const measured = pretextMeasure(text, options.font, options.containerWidth);
  if (measured.width <= options.containerWidth) {
    return options.lineHeight;
  }

  // Number of visual lines = ceil(measured width / container width)
  const wrappedLines = Math.ceil(measured.width / options.containerWidth);
  return wrappedLines * options.lineHeight;
}

/**
 * Batch-measure all line heights for an array of text strings.
 * Returns a Float64Array for cache-friendly access during scroll.
 */
export function measureAllHeights(
  lines: string[],
  options: MeasurerOptions,
  pretextMeasure?: (text: string, font: string, maxWidth: number) => { width: number }
): Float64Array {
  const heights = new Float64Array(lines.length);

  if (!options.wordWrap || !pretextMeasure) {
    heights.fill(options.lineHeight);
    return heights;
  }

  for (let i = 0; i < lines.length; i++) {
    heights[i] = measureLineHeight(lines[i], options, pretextMeasure);
  }

  return heights;
}

/**
 * Build a prefix-sum array for O(1) offset lookups.
 * prefixSums[i] = total height of lines 0..i-1
 */
export function buildPrefixSums(heights: Float64Array): Float64Array {
  const sums = new Float64Array(heights.length + 1);
  for (let i = 0; i < heights.length; i++) {
    sums[i + 1] = sums[i] + heights[i];
  }
  return sums;
}
