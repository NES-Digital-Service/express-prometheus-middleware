import { Counter, Histogram } from 'prom-client'

/**
 * @param {Array<string>} labelNames - label names
 * @param {string} prefix - metrics name prefix request counter
 * @returns {Counter<string>} a counter
 */
function requestCountGenerator (labelNames: string[], prefix: string = ''): Counter<string> {
  return new Counter({
    name: `${prefix}http_requests_total`,
    help: 'Counter for total requests received',
    labelNames
  })
}

/**
 * @param {Array<string>} labelNames - label names
 * @param {!Array} buckets - array of numbers, representing the buckets for
 * @param {string} prefix - metrics name prefix request counter
 * @returns {Histogram<string>} a histogram
 */
function requestDurationGenerator (labelNames: string[], buckets: number[], prefix: string = ''): Histogram<string> {
  return new Histogram({
    name: `${prefix}http_request_duration_seconds`,
    help: 'Duration of HTTP requests in seconds',
    labelNames,
    buckets
  })
}

/**
 * @param {Array<string>} labelNames - label names
 * @param {!Array} buckets - array of numbers, representing the buckets for
 * @param {string} prefix - metrics name prefix request counter
 * @returns {Histogram<string>} a histogram
 */
function requestLengthGenerator (labelNames: string[], buckets: number[], prefix: string = ''): Histogram<string> {
  return new Histogram({
    name: `${prefix}http_request_length_bytes`,
    help: 'Content-Length of HTTP request',
    labelNames,
    buckets
  })
}

/**
 * @param {Array<string>} labelNames - label names
 * @param {!Array} buckets - array of numbers, representing the buckets for
 * @param {string} prefix - metrics name prefix request counter
 * @returns {Histogram<string>} a histogram
 */
function responseLengthGenerator (labelNames: string[], buckets: number[], prefix: string = ''): Histogram<string> {
  return new Histogram({
    name: `${prefix}http_response_length_bytes`,
    help: 'Content-Length of HTTP response',
    labelNames,
    buckets
  })
}

export {
  requestCountGenerator,
  requestDurationGenerator,
  requestLengthGenerator,
  responseLengthGenerator
}
