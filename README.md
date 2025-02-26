# Express Prometheus Middleware

A ready to use RED/USE prometheus metrics middleware for express applications.

The metrics exposed allows the calculation common RED (Request, Error rate, Duration of requests), and USE (Utilisation, Error rate, and Saturation), metrics

This is a fork of the original [express-prometheus-middleware by Joao Fontenele](https://github.com/joao-fontenele/express-prometheus-middleware) which is no
longer maintained.

## Install

Configure npm with the NES Digital Service GitHub packages repository:

```shell
echo "@nes-digital-service:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=<PERSONAL ACCESS TOKEN>" >> .npmrc
```

If you do not have a GitHub personal access token then generate one from your [GitHub Developer Settings](https://github.com/settings/tokens).
To install this package the personal access token must have the `read:packages` scope.

Install the module with npm:

``` bash
npm install --save @nes-digital-service/express-prometheus-middleware
```

## Usage

### Options

- `collectDefaultMetrics`: Whether or not to collect `prom-client` default metrics. These metrics are useful for collecting saturation metrics, for example.
  Default is `true`.
- `requestDurationBuckets`: Buckets for the request duration metrics (in seconds) histogram.
  Default uses `prom-client` utility: `Prometheus.exponentialBuckets(0.05, 1.75, 8)`.
- `requestLengthBuckets`: Buckets for the request length metrics (in bytes) histogram.
  Default is no buckets (The request length metrics are not collected): `[]`.
- `responseLengthBuckets`: Buckets for the response length metrics (in bytes) histogram.
  Default is no buckets (The response length metrics are not collected) `[]`.
- `extraMasks`: List of regexes to be used as argument to [url-value-parser](https://www.npmjs.com/package/url-value-parser), this will cause extra
  route params,  to be replaced with a `#val` placeholder. Default is no extra masks: `[]`
- `prefix`: Prefix for the metrics name. Default no prefix added.
- `customLabels`: Array containing extra labels, used together with `transformLabels`.
  Default is no extra labels: `[]`.
- `transformLabels`: `function(labels, req, res)` adds to the labels object dynamic values for each label in `customLabels`. Default is `null`.
- `normalizeStatus`: Optional parameter to disable normalization of the status code. Example of normalized and non-normalized status code respectively: 4xx and
  422. Default is `true`.

### Example

```js
const express = require('express')
const promMid = require('express-prometheus-middleware')
const promClient = require('prom-client')

const API_PORT = 8080
const TELEMETRY_PORT = 9090

const app = express()
app.use(promMid({
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}));

// curl -X GET localhost:8080/hello?name=Chuck%20Norris
app.get('/hello', (req, res) => {
  console.log('GET /hello')
  const { name = 'Anon' } = req.query
  res.json({ message: `Hello, ${name}!` })
});

app.listen(API_PORT, () => {
  console.log(`Example api is listening on http://localhost:${API_PORT}/hello`);
});

const telemetry = express()

// curl -X GET localhost:9090/metrics
telemetry.get('/metrics', async (req, res) => {
  console.log('GET /metrics')
  res.set('Content-Type', promClient.register.contentType)
  res.end(await promClient.register.metrics())
})

telemetry.listen(TELEMETRY_PORT, () => {
  console.log(`Telemetry is listening on http://localhost:${TELEMETRY_PORT}/metrics`);
});
```

### Metrics exposed

- Default metrics from [prom-client](https://github.com/siimon/prom-client)
- `http_requests_total`: Counter for total requests received, has labels `route`, `method`, `status`
- `http_request_duration_seconds`: - Duration of HTTP requests in seconds, has labels `route`, `method`, `status`

The labels `route` and `status` are normalized:

- `route`: will normalize ID like route params
- `status`: will normalize to status code family groups, like `2XX` or `4XX`.

### Example prometheus queries

In the examples below, Suppose you tagged your application as "myapp", in the prometheus scrapping config.

#### Running instances

```js
sum(up{app="myapp"})
```

#### Overall error rate

Rate of http status code 5XX responses

```js
sum(rate(http_requests_total{status="5XX", app="myapp"}[5m]))
```

#### 95% of requests served within seconds

```js
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{app="myapp"}[5m])) by (le))
```

#### 95% of request length

```js
histogram_quantile(0.95, sum(rate(http_request_length_bytes_bucket{app="myapp"}[5m])) by (le))
```

#### 95% of response length

```js
histogram_quantile(0.95, sum(rate(http_response_length_bytes_bucket{app="myapp"}[5m])) by (le))
```

#### Average response time in seconds

```js
sum(rate(http_request_duration_seconds_sum{app="myapp"}[5m])) by (instance) / sum(rate(http_request_duration_seconds_count{app="myapp"}[5m])) by (instance)
```

#### Overall Request rate

```js
sum(rate(http_requests_total{app="myapp"}[5m])) by (instance)
```

#### Request rate by route

In this example we are removing some health/status-check routes, replace them with your needs.

```js
sum(rate(http_requests_total{app="myapp", route!~"/|/healthz"}[5m])) by (instance, route)
```

#### CPU usage

```js
rate(process_cpu_system_seconds_total{app="myapp"}[5m])
rate(process_cpu_user_seconds_total{app="myapp"}[5m])
```

#### Memory usage

```js
nodejs_heap_size_total_bytes{app="myapp"}
nodejs_heap_size_used_bytes{app="myapp"}
```

## For Maintainers

### Testing

This library comes with a suite of unit tests. To execute the unit tests:

```shell
npm test
```

### Publishing

This package will be published to GitHub Packages when a release is performed.
The package version number will be the same as the release tag.

Note: The workflows depend on the PACKAGES_TOKEN Organization Secret, which expires every 90 days, if it does create a Personal Access Token with the
`read:packages` scope and update the secret.