import { describe, expect, it } from 'vitest';
import { calculateDDay, getPriorityColor, getPriorityLabel, isStrongPassword } from './utils';

describe('utils', () => {
  it('우선순위 라벨과 색상을 반환한다', () => {
    expect(getPriorityLabel('HIGH')).toBe('높음');
    expect(getPriorityColor('HIGH')).toBe('danger');
  });

  it('강한 비밀번호를 판별한다', () => {
    expect(isStrongPassword('abc12345')).toBe(true);
    expect(isStrongPassword('12345678')).toBe(false);
  });

  it('D-Day 형식을 계산한다', () => {
    const today = new Date();
    const todayText = calculateDDay(today.toISOString());
    expect(todayText).toBe('D-Day');
  });
});
