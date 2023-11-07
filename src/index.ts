import Prometheus from 'prom-client'
import responseTime from 'response-time'
import { Request, Response, RequestHandler } from 'express'

import {
  requestCountGenerator,
  requestDurationGenerator,
  requestLengthGenerator,
  responseLengthGenerator
} from './metrics'

import {
  normalizeStatusCode,
  normalizePath
} from './normalizers'

export interface Label {
  route: string
  method: string
  status: string
  [k: string]: string | undefined
}

export interface Options {
  collectDefaultMetrics: boolean
  requestDurationBuckets: number[]
  requestLengthBuckets: number[]
  responseLengthBuckets: number[]
  extraMasks: string[]
  customLabels: string[]
  transformLabels: (labels: Label, req: Request, res: Response<Request>) => void
  normalizeStatus: boolean
  prefix: string
}

const defaultOptions: Options = {
  collectDefaultMetrics: true,
  // buckets for response time from 0.05s to 2.5s
  // these are arbitrary values since i dont know any better ¯\_(ツ)_/¯
  requestDurationBuckets: Prometheus.exponentialBuckets(0.05, 1.75, 8),
  requestLengthBuckets: [],
  responseLengthBuckets: [],
  extraMasks: [],
  customLabels: [],
  transformLabels: (_labels, _req, _res) => {},
  normalizeStatus: true,
  prefix: ''
}

export default function metricsCollector (userOptions: Partial<Options> = defaultOptions): RequestHandler {
  const options: Options = { ...defaultOptions, ...userOptions }
  const originalLabels = ['route', 'method', 'status']
  const allLabels = Array.from(new Set([...originalLabels, ...options.customLabels]))

  const requestDuration = requestDurationGenerator(
    allLabels,
    options.requestDurationBuckets,
    options.prefix
  )
  const requestCount = requestCountGenerator(
    allLabels,
    options.prefix
  )
  const requestLength = requestLengthGenerator(
    allLabels,
    options.requestLengthBuckets,
    options.prefix
  )
  const responseLength = responseLengthGenerator(
    allLabels,
    options.responseLengthBuckets,
    options.prefix
  )

  /**
   * Corresponds to the R(equest rate), E(error rate), and D(uration of requests),
   * of the RED metrics.
   */
  const redMiddleware = responseTime((req: Request, res: Response<Request>, time: number) => {
    const { originalUrl, method } = req
    // will replace ids from the route with `#val` placeholder this serves to
    // measure the same routes, e.g., /image/id1, and /image/id2, will be
    // treated as the same route
    const route = normalizePath(originalUrl, options.extraMasks)

    const status = options.normalizeStatus
      ? normalizeStatusCode(res.statusCode)
      : res.statusCode.toString()

    const labels = { route, method, status }

    options.transformLabels(labels, req, res)

    requestCount.inc(labels)

    // observe normalizing to seconds
    requestDuration.observe(labels, time / 1000)

    // observe request length
    if (options.requestLengthBuckets.length > 0) {
      const reqLength = req.get('Content-Length')
      if (reqLength != null && reqLength !== '0') {
        requestLength.observe(labels, Number(reqLength))
      }
    }

    // observe response length
    if (options.responseLengthBuckets.length > 0) {
      const resLength = res.get('Content-Length')
      if (resLength != null && resLength !== '0') {
        responseLength.observe(labels, Number(resLength))
      }
    }
  })

  if (options.collectDefaultMetrics) {
    // when this file is required, we will start to collect automatically
    // default metrics include common cpu and head usage metrics that can be
    // used to calculate saturation of the service
    Prometheus.collectDefaultMetrics({
      prefix: options.prefix
    })
  }

  return redMiddleware
}
