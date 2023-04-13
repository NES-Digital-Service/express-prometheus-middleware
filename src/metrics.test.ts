import { Registry } from 'prom-client'
import {
  requestCountGenerator,
  requestDurationGenerator,
  requestLengthGenerator,
  responseLengthGenerator
} from './metrics'

describe('metrics', () => {
  let registry: Registry

  beforeEach(() => {
    registry = new Registry()
  })

  describe('requestCountGenerator', () => {
    it('should return a Prometheus Count metric', async () => {
      // Given
      const labelNames = ['foo']

      // When
      const metric = requestCountGenerator(labelNames)
      registry.registerMetric(metric)
      const metrics = await registry.metrics()

      // Then
      expect(metrics).toEqual(`# HELP http_requests_total Counter for total requests received
# TYPE http_requests_total counter
`)
    })

    it('should return a Prometheus Count metric with a custom prefix', async () => {
      // Given
      const prefix = 'bar_'
      const labelNames = ['foo']

      // When
      const metric = requestCountGenerator(labelNames, prefix)
      registry.registerMetric(metric)
      const metrics = await registry.metrics()

      // Then
      expect(metrics).toEqual(`# HELP bar_http_requests_total Counter for total requests received
# TYPE bar_http_requests_total counter
`)
    })
  })

  describe('requestDurationGenerator', () => {
    it('should return a Prometheus Histogram metric', async () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]

      // When
      const metric = requestDurationGenerator(labelNames, buckets)
      registry.registerMetric(metric)
      const metrics = await registry.metrics()

      // Then
      expect(metrics).toEqual(`# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
`)
    })

    it('should return a Prometheus Histogram metric with a custom prefix', async () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]
      const prefix = 'bar_'

      // When
      const metric = requestDurationGenerator(labelNames, buckets, prefix)
      registry.registerMetric(metric)
      const metrics = await registry.metrics()

      // Then
      expect(metrics).toEqual(`# HELP bar_http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE bar_http_request_duration_seconds histogram
`)
    })
  })

  describe('requestLengthGenerator', () => {
    it('should return a Prometheus Histogram metric', async () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]

      // When
      const metric = requestLengthGenerator(labelNames, buckets)
      registry.registerMetric(metric)
      const metrics = await registry.metrics()

      // Then
      expect(metrics).toEqual(`# HELP http_request_length_bytes Content-Length of HTTP request
# TYPE http_request_length_bytes histogram
`)
    })

    it('should return a Prometheus Histogram metric with a custom prefix', async () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]
      const prefix = 'bar_'

      // When
      const metric = requestLengthGenerator(labelNames, buckets, prefix)
      registry.registerMetric(metric)
      const metrics = await registry.metrics()

      // Then
      expect(metrics).toEqual(`# HELP bar_http_request_length_bytes Content-Length of HTTP request
# TYPE bar_http_request_length_bytes histogram
`)
    })
  })

  describe('responseLengthGenerator', () => {
    it('should return a Prometheus Histogram metric', async () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]

      // When
      const metric = responseLengthGenerator(labelNames, buckets)
      registry.registerMetric(metric)
      const metrics = await registry.metrics()

      // Then
      expect(metrics).toEqual(`# HELP http_response_length_bytes Content-Length of HTTP response
# TYPE http_response_length_bytes histogram
`)
    })

    it('should return a Prometheus Histogram metric with a custom prefix', async () => {
      // Given
      const labelNames = ['foo']
      const buckets = [0.1, 0.5, 1]
      const prefix = 'bar_'

      // When
      const metric = responseLengthGenerator(labelNames, buckets, prefix)
      registry.registerMetric(metric)
      const metrics = await registry.metrics()

      // Then
      expect(metrics).toEqual(`# HELP bar_http_response_length_bytes Content-Length of HTTP response
# TYPE bar_http_response_length_bytes histogram
`)
    })
  })
})
