const proMid = require('./index')
const prometheus = require('prom-client')
const { normalizePath, normalizeStatusCode } = require('./normalizers')
const {
  requestCountGenerator,
  requestDurationGenerator,
  requestLengthGenerator,
  responseLengthGenerator
} = require('./metrics')

jest.mock('./normalizers')
jest.mock('./metrics')
jest.mock('prom-client')

const createMockCounter = function () {
  return {
    inc: jest.fn()
  }
}

const createMockHistogram = function () {
  return {
    observe: jest.fn()
  }
}

describe('index', () => {
  const req = {
    originalUrl: '/foo',
    method: 'POST',
    get: jest.fn()
  }
  const contentLength = 123
  const res = {
    get: jest.fn(),
    writeHead: jest.fn()
  }
  const status = '200'
  const next = function () {
    res.writeHead(status)
  }
  const requestCount = createMockCounter()
  const requestDuration = createMockHistogram()

  beforeEach(() => {
    normalizePath.mockImplementation((path) => path)
    normalizeStatusCode.mockImplementation((statusCode) => statusCode)
    requestCountGenerator.mockReturnValue(requestCount)
    requestDurationGenerator.mockReturnValue(requestDuration)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should count request', () => {
    // Given
    const middleware = proMid()

    // When
    middleware(req, res, next)

    // Then
    expect(requestCount.inc).toHaveBeenCalledTimes(1)
    expect(requestCount.inc.mock.calls[0][0]).toEqual({
      route: req.originalUrl,
      method: req.method,
      status: status
    })
  })

  it('should record request duration', () => {
    // Given
    const middleware = proMid()

    // When
    middleware(req, res, next)

    // Then
    expect(requestDuration.observe).toHaveBeenCalledTimes(1)
    expect(requestDuration.observe.mock.calls[0][0]).toEqual({
      route: req.originalUrl,
      method: req.method,
      status: status
    })
    expect(requestDuration.observe.mock.calls[0][1]).toBeGreaterThan(0)
  })

  it('should record request length if request content', () => {
    // Given
    req.get.mockReturnValue(contentLength)
    const requestLength = createMockHistogram()
    requestLengthGenerator.mockReturnValue(requestLength)
    const middleware = proMid({ requestLengthBuckets: [0.1, 0.5, 1] })

    // When
    middleware(req, res, next)

    // Then
    expect(requestLength.observe).toHaveBeenCalledTimes(1)
    expect(requestLength.observe.mock.calls[0][0]).toEqual({
      route: req.originalUrl,
      method: req.method,
      status: status
    })
    expect(requestLength.observe.mock.calls[0][1]).toEqual(contentLength)
  })

  it('should not record request length if no request content', () => {
    // Given
    const requestLength = createMockHistogram()
    requestLengthGenerator.mockReturnValue(requestLength)
    const middleware = proMid({ requestLengthBuckets: [0.1, 0.5, 1] })

    // When
    middleware(req, res, next)

    // Then
    expect(requestLength.observe).not.toHaveBeenCalled()
  })

  it('should record response length if response content', () => {
    // Given
    res.get.mockReturnValue(contentLength)
    const responseLength = createMockHistogram()
    responseLengthGenerator.mockReturnValue(responseLength)
    const middleware = proMid({ responseLengthBuckets: [0.1, 0.5, 1] })

    // When
    middleware(req, res, next)

    // Then
    expect(responseLength.observe).toHaveBeenCalledTimes(1)
    expect(responseLength.observe.mock.calls[0][0]).toEqual({
      route: req.originalUrl,
      method: req.method,
      status: status
    })
    expect(responseLength.observe.mock.calls[0][1]).toEqual(contentLength)
  })

  it('should not record response length if no response content', () => {
    // Given
    const responseLength = createMockHistogram()
    responseLengthGenerator.mockReturnValue(responseLength)
    const middleware = proMid({ responseLengthBuckets: [0.1, 0.5, 1] })

    // When
    middleware(req, res, next)

    // Then
    expect(responseLength.observe).not.toHaveBeenCalled()
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
      status: status
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
