const Prometheus = require('prom-client')
const {
  requestCountGenerator,
  requestDurationGenerator,
  requestLengthGenerator,
  responseLengthGenerator
} = require('./metrics')

describe('metrics', () => {
  describe('requestCountGenerator', () => {
    it('should return a Prometheus Count metric', () => {
      // Given
      const labelNames = ['foo']

      // When
      const metric = requestCountGenerator(labelNames)

      // Then
      expect(metric).toBeInstanceOf(Prometheus.Counter)
      expect(metric.name).toEqual('http_requests_total')
      expect(metric.help).toEqual('Counter for total requests received')
      expect(metric.labelNames).toEqual(labelNames)
    })

    it('should return a Prometheus Count metric with a custom prefix', () => {
      // Given
      const prefix = 'bar_'
      const labelNames = ['foo']

      // When
      const metric = requestCountGenerator(labelNames, prefix)

      // Then
      expect(metric).toBeInstanceOf(Prometheus.Counter)
      expect(metric.name).toEqual(prefix + 'http_requests_total')
      expect(metric.help).toEqual('Counter for total requests received')
      expect(metric.labelNames).toEqual(labelNames)
    })
  })

  describe('requestDurationGenerator', () => {
    it('should return a Prometheus Histogram metric', () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]

      // When
      const metric = requestDurationGenerator(labelNames, buckets)

      // Then
      expect(metric).toBeInstanceOf(Prometheus.Histogram)
      expect(metric.name).toEqual('http_request_duration_seconds')
      expect(metric.help).toEqual('Duration of HTTP requests in seconds')
      expect(metric.labelNames).toEqual(labelNames)
      expect(metric.buckets).toEqual(buckets)
    })

    it('should return a Prometheus Histogram metric with a custom prefix', () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]
      const prefix = 'bar'

      // When
      const metric = requestDurationGenerator(labelNames, buckets, prefix)

      // Then
      expect(metric).toBeInstanceOf(Prometheus.Histogram)
      expect(metric.name).toEqual(prefix + 'http_request_duration_seconds')
      expect(metric.help).toEqual('Duration of HTTP requests in seconds')
      expect(metric.labelNames).toEqual(labelNames)
      expect(metric.buckets).toEqual(buckets)
    })
  })

  describe('requestLengthGenerator', () => {
    it('should return a Prometheus Histogram metric', () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]

      // When
      const metric = requestLengthGenerator(labelNames, buckets)

      // Then
      expect(metric).toBeInstanceOf(Prometheus.Histogram)
      expect(metric.name).toEqual('http_request_length_bytes')
      expect(metric.help).toEqual('Content-Length of HTTP request')
      expect(metric.labelNames).toEqual(labelNames)
      expect(metric.buckets).toEqual(buckets)
    })

    it('should return a Prometheus Histogram metric with a custom prefix', () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]
      const prefix = 'bar'

      // When
      const metric = requestLengthGenerator(labelNames, buckets, prefix)

      // Then
      expect(metric).toBeInstanceOf(Prometheus.Histogram)
      expect(metric.name).toEqual(prefix + 'http_request_length_bytes')
      expect(metric.help).toEqual('Content-Length of HTTP request')
      expect(metric.labelNames).toEqual(labelNames)
      expect(metric.buckets).toEqual(buckets)
    })
  })

  describe('responseLengthGenerator', () => {
    it('should return a Prometheus Histogram metric', () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]

      // When
      const metric = responseLengthGenerator(labelNames, buckets)

      // Then
      expect(metric).toBeInstanceOf(Prometheus.Histogram)
      expect(metric.name).toEqual('http_response_length_bytes')
      expect(metric.help).toEqual('Content-Length of HTTP response')
      expect(metric.labelNames).toEqual(labelNames)
      expect(metric.buckets).toEqual(buckets)
    })

    it('should return a Prometheus Histogram metric with a custom prefix', () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]
      const prefix = 'bar'

      // When
      const metric = responseLengthGenerator(labelNames, buckets, prefix)

      // Then
      expect(metric).toBeInstanceOf(Prometheus.Histogram)
      expect(metric.name).toEqual(prefix + 'http_response_length_bytes')
      expect(metric.help).toEqual('Content-Length of HTTP response')
      expect(metric.labelNames).toEqual(labelNames)
      expect(metric.buckets).toEqual(buckets)
    })
  })
})
