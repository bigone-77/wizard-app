import { queryClient } from '@/lib/query-client';

describe('QueryClient 기본값', () => {
  it('쓰기(mutation)는 자동 재시도하지 않는다. 재시도는 기능별로 같은 ID와 함께 (16-architecture 5장)', () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(0);
  });

  it('읽기는 두 번까지 다시 시도한다', () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(2);
  });
});
