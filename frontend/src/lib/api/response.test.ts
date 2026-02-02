import { describe, expect, it } from 'vitest';
import type { AxiosResponse } from 'axios';
import { unwrapApiResponse } from './response';

describe('unwrapApiResponse', () => {
  it('success=true면 data를 반환한다', () => {
    const response = {
      data: {
        success: true,
        data: { value: 1 },
      },
    } as AxiosResponse;

    expect(unwrapApiResponse<{ value: number }>(response)).toEqual({ value: 1 });
  });

  it('success=false면 에러를 던진다', () => {
    const response = {
      data: {
        success: false,
        message: '실패',
        data: null,
      },
    } as AxiosResponse;

    expect(() => unwrapApiResponse(response)).toThrow('실패');
  });
});
