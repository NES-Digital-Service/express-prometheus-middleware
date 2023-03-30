import proMid from './index'

import prometheus, { Counter, Histogram } from 'prom-client'
import { Request, Response } from 'express'

import { normalizeStatusCode } from './normalizers'
import {
  requestCountGenerator,
  requestDurationGenerator,
  requestLengthGenerator,
  responseLengthGenerator
} from './metrics'

jest.mock('./normalizers', () => ({
  normalizePath: jest.fn().mockImplementation((path) => path),
  normalizeStatusCode: jest.fn().mockImplementation((statusCode) => statusCode)
}))
jest.mock('./metrics')
jest.mock('prom-client')

function createMockCounter (): jest.Mocked<Counter<string>> {
  return {
    inc: jest.fn(),
    labels: jest.fn(),
    reset: jest.fn(),
    remove: jest.fn()
  }
}

function createMockHistogram (): jest.Mocked<Histogram<string>> {
  return {
    observe: jest.fn(),
    startTimer: jest.fn(),
    labels: jest.fn(),
    reset: jest.fn(),
    remove: jest.fn(),
    zero: jest.fn()
  }
}

const req = {
  originalUrl: '/foo',
  method: 'POST',
  get: jest.fn()
} as unknown as Request
const contentLength = 123
const res = {
  get: jest.fn(),
  writeHead: jest.fn()
} as unknown as Response
const status = 200
const next = function (): void {
  res.writeHead(status)
}

describe('index', () => {
  const mockCounter = createMockCounter()
  const mockRequestDuration = createMockHistogram()
  const mockRequestLengthDuration = createMockHistogram()
  const mockResponseLenghtDuration = createMockHistogram()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(requestCountGenerator).mockReturnValue(mockCounter)
    jest.mocked(requestDurationGenerator).mockReturnValue(mockRequestDuration)
    jest.mocked(requestLengthGenerator).mockReturnValue(mockRequestLengthDuration)
    jest.mocked(responseLengthGenerator).mockReturnValue(mockResponseLenghtDuration)
  })

  it('should count request', () => {
    // Given
    const middleware = proMid()

    // When
    middleware(req, res, next)

    // Then
    expect(mockCounter.inc).toHaveBeenCalledTimes(1)
    expect(mockCounter.inc).toHaveBeenCalledWith({
      route: req.originalUrl,
      method: req.method,
      status
    })
  })

  it('should record request duration', () => {
    // Given
    const middleware = proMid()

    // When
    middleware(req, res, next)

    // Then
    expect(mockRequestDuration.observe).toHaveBeenCalledTimes(1)
    expect(mockRequestDuration.observe.mock.calls[0][0]).toEqual({
      route: req.originalUrl,
      method: req.method,
      status
    })
    expect(mockRequestDuration.observe.mock.calls[0][1]).toBeGreaterThan(0)
  })

  it('should record request length if request content', () => {
    // Given
    jest.mocked(req.get).mockReturnValueOnce(String(contentLength))
    const middleware = proMid({ requestLengthBuckets: [0.1, 0.5, 1] })

    // When
    middleware(req, res, next)

    // Then
    expect(mockRequestLengthDuration.observe).toHaveBeenCalledTimes(1)
    expect(mockRequestLengthDuration.observe).toHaveBeenCalledWith({
      route: req.originalUrl,
      method: req.method,
      status
    }, contentLength)
  })

  it('should not record request length if no request content', () => {
    // Given
    const middleware = proMid({ requestLengthBuckets: [0.1, 0.5, 1] })

    // When
    middleware(req, res, next)

    // Then
    expect(mockRequestLengthDuration.observe).not.toHaveBeenCalled()
  })

  it('should record response length if response content', () => {
    // Given
    jest.mocked(res.get).mockReturnValueOnce(String(contentLength))

    const middleware = proMid({ responseLengthBuckets: [0.1, 0.5, 1] })

    // When
    middleware(req, res, next)

    // Then
    expect(mockResponseLenghtDuration.observe).toHaveBeenCalledTimes(1)
    expect(mockResponseLenghtDuration.observe).toHaveBeenCalledWith({
      route: req.originalUrl,
      method: req.method,
      status
    }, contentLength)
  })

  it('should not record response length if no response content', () => {
    // Given
    const middleware = proMid({ responseLengthBuckets: [0.1, 0.5, 1] })

    // When
    middleware(req, res, next)

    // Then
    expect(mockResponseLenghtDuration.observe).not.toHaveBeenCalled()
  })

  it('should collect default metrics with prefix', () => {
    // Given
    const options = {
      prefix: 'foo'
    }
    const middleware = proMid(options)

    // When
    middleware(req, res, next)

    // Then
    expect(prometheus.collectDefaultMetrics).toHaveBeenCalledTimes(1)
    expect(prometheus.collectDefaultMetrics).toHaveBeenCalledWith(options)
  })

  it('should allow labels to be transformed', () => {
    // Given
    const options = {
      transformLabels: jest.fn()
    }
    const middleware = proMid(options)

    // When
    middleware(req, res, next)

    // Then
    expect(options.transformLabels).toHaveBeenCalledTimes(1)
    expect(options.transformLabels).toHaveBeenCalledWith({
      route: req.originalUrl,
      method: req.method,
      status
    }, req, res)
  })

  it('should prevent status normalization', () => {
    // Given
    const options = {
      normalizeStatus: false
    }
    const middleware = proMid(options)

    // When
    middleware(req, res, next)

    // Then
    expect(normalizeStatusCode).not.toHaveBeenCalled()
  })

  it('should prevent default metrics collection', () => {
    // Given
    const options = {
      collectDefaultMetrics: false
    }
    const middleware = proMid(options)

    // When
    middleware(req, res, next)

    // Then
    expect(prometheus.collectDefaultMetrics).not.toHaveBeenCalled()
  })
})
