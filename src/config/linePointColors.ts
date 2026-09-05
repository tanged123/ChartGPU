import type { LineSeriesConfig, SeriesSampling } from './types';
import { getPointCount } from '../data/cartesianData';

/** Attributes are immutable and indexed by the unsampled source polyline. */
export function validateLinePointColors(series: LineSeriesConfig, sampling: SeriesSampling, animation: unknown): void {
  if (series.pointColors === undefined) return;
  if (!(series.pointColors instanceof Float32Array) || series.pointColors.length !== getPointCount(series.data) * 4)
    throw new Error('line pointColors must contain one RGBA tuple per data point');
  if (
    sampling !== 'none' ||
    series.connectNulls === true ||
    series.step ||
    series.areaStyle ||
    series.stack ||
    animation !== false
  )
    throw new Error('line pointColors requires sampling:none, animation:false and unmodified stroke geometry');
}
