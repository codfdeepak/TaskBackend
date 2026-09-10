const { parsePagination } = require('../src/utils/pagination');

describe('parsePagination', () => {
  test('uses safe defaults', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  test('caps and normalizes values', () => {
    expect(parsePagination({ page: '2', limit: '500' })).toEqual({ page: 2, limit: 100, skip: 100 });
    expect(parsePagination({ page: '-4', limit: '0' })).toEqual({ page: 1, limit: 10, skip: 0 });
  });
});
