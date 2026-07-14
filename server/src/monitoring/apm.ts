import apm from 'elastic-apm-node'

export function initAPM(): void {
  const apmEnabled = process.env.ELASTIC_APM_ENABLED === 'true'

  if (!apmEnabled) {
    console.log('APM disabled')
    return
  }

  apm.start({
    serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'webrtc-signaling',
    serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
    environment: process.env.NODE_ENV || 'development',
    active: apmEnabled,
    logLevel: 'info',
  })

  console.log('APM initialized')
}

export function captureMetric(name: string, value: number, labels?: Record<string, string>): void {
  if (labels) {
    apm.setCustomContext(labels)
  }
  const transaction = apm.startTransaction(name, 'custom')
  if (transaction) {
    transaction.addLabels({ value: String(value), ...labels })
    transaction.end()
  }
}

export function captureError(error: Error): void {
  apm.captureError(error)
}
