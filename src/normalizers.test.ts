import { normalizePath, normalizeStatusCode } from './normalizers'

describe('normalizers', () => {
  describe('normalizePath', () => {
    it('should not change path that has no path parameters', () => {
      // Given
      const path = '/example/path'

      // When
      const normalizedPath = normalizePath(path)

      // Then
      expect(normalizedPath).toEqual(path)
    })

    it('should replace numeric path parameters', () => {
      // Given
      const path = '/example/1'

      // When
      const normalizedPath = normalizePath(path)

      // Then
      expect(normalizedPath).toEqual('/example/#val')
    })

    it('should replace custom path parameters', () => {
      // Given
      const path = '/example/zzz'

      // When
      const normalizedPath = normalizePath(path, ['z{3}'])

      // Then
      expect(normalizedPath).toEqual('/example/#val')
    })

    it('should use supplied placeholder', () => {
      // Given
      const path = '/example/1'

      // When
      const normalizedPath = normalizePath(path, [], ':id')

      // Then
      expect(normalizedPath).toEqual('/example/:id')
    })
  })

  describe('normalizeStatus', () => {
    it.each([
      [200, '2XX'], [201, '2XX'], [202, '2XX'], [203, '2XX'], [204, '2XX'],
      [300, '3XX'], [301, '3XX'], [302, '3XX'], [303, '3XX'], [304, '3XX'],
      [400, '4XX'], [401, '4XX'], [402, '4XX'], [403, '4XX'], [404, '4XX'],
      [500, '5XX'], [501, '5XX'], [502, '5XX'], [503, '5XX'], [504, '5XX']
    ])('should normalize status code %i to %i', (statusCode, expectedNormalizedStatusCode) => {
      // When
      const normalizedStatusCode = normalizeStatusCode(statusCode)

      // Then
      expect(normalizedStatusCode).toEqual(expectedNormalizedStatusCode)
    })
  })
})
