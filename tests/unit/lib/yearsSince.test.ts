import { describe, expect, it } from 'vitest';
import { CAREER_START, yearsSince } from '../../../src/lib/yearsSince';

describe('yearsSince', () => {
  it('counts only completed years (day before anniversary)', () => {
    expect(yearsSince(new Date(2016, 7, 1), new Date(2026, 6, 31))).toBe(9);
  });

  it('counts the year on the anniversary itself', () => {
    expect(yearsSince(new Date(2016, 7, 1), new Date(2026, 7, 1))).toBe(10);
  });

  it('is 0 within the first year and never negative', () => {
    expect(yearsSince(new Date(2016, 7, 1), new Date(2017, 6, 31))).toBe(0);
    expect(yearsSince(new Date(2016, 7, 1), new Date(2015, 0, 1))).toBe(0);
  });

  it('career starts 2016-08-01', () => {
    expect(CAREER_START.getFullYear()).toBe(2016);
    expect(CAREER_START.getMonth()).toBe(7);
    expect(CAREER_START.getDate()).toBe(1);
  });
});
