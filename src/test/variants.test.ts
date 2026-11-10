import { describe, expect, it } from 'vitest';
import { parseVariants, selectedPrice } from '@/lib/variants';

describe('catalog variation prices', () => {
  it.each(['produto físico', 'serviço', 'produto digital'])('preserves different prices for %s', () => {
    const options = parseVariants([{ id: 'basic', name: 'Básico', price: '25,50' }, { id: 'complete', name: 'Completo', price: '75' }]);
    expect(selectedPrice(1000, options, 'basic')).toBe(2550);
    expect(selectedPrice(1000, options, 'complete')).toBe(7500);
  });
  it('requires an existing option when variations exist', () => {
    expect(selectedPrice(1000, [{ id: 'valid', name: 'A', price_cents: 2500 }], '')).toBeNull();
    expect(selectedPrice(1000, [{ id: 'valid', name: 'A', price_cents: 2500 }], 'other-item')).toBeNull();
  });
  it('preserves base prices for items without variations', () => expect(selectedPrice(1000, [], '')).toBe(1000));
  it('rejects invalid variation prices', () => expect(() => parseVariants([{ id: 'a', name: 'A', price: '-1' }])).toThrow());
});