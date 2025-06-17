import { cn } from '../utils';

test('cn merges class names', () => {
  expect(cn('p-2', false && 'hidden')).toBe('p-2');
  expect(cn('p-2', 'm-1')).toBe('p-2 m-1');
});
