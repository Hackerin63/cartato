/**
 * Cloudflare Pages Middleware
 *
 * This file MUST exist at client/functions/_middleware.js
 * It proxies every /api/* request from the Pages site to the deployed Worker.
 *
 * HOW IT WORKS:
 *   Browser → cartato.pages.dev/api/auth/login
 *     → This file intercepts it
 *     → Forwards to https://cartato-worker.YOUR.workers.dev/api/auth/login
 *     → Returns the Worker's response to the browser
 *
 * SETUP:
 *   Replace WORKER_URL below with your actual Worker URL.
 *   You get the Worker URL after running: npm run deploy:worker
 *   It looks like: https://cartato-worker.abc123.workers.dev
 */

// ── Replace this with YOUR Worker URL ────────────────────────────────────────
const WORKER_URL = 'https://cartato-worker.arunselvan21226063.workers.dev'
// ─────────────────────────────────────────────────────────────────────────────

export async function onRequest(context) {
  const url = new URL(context.request.url)

  // Only proxy /api/* routes
  if (!url.pathname.startsWith('/api/')) {
    return context.next()
  }

  // Build the target Worker URL
  const targetUrl = WORKER_URL + url.pathname + url.search

  // Forward the request with all original headers and body
  const proxyRequest = new Request(targetUrl, {
    method:  context.request.method,
    headers: context.request.headers,
    body:    ['GET', 'HEAD'].includes(context.request.method)
      ? undefined
      : context.request.body,
    redirect: 'follow',
  })

  try {
    const response = await fetch(proxyRequest)

    // Forward all response headers back to the browser
    const headers = new Headers(response.headers)

    // Ensure CORS headers are present
    headers.set('Access-Control-Allow-Origin', url.origin)
    headers.set('Access-Control-Allow-Credentials', 'true')

    return new Response(response.body, {
      status:     response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (err) {
    // Return a clear error if the Worker is unreachable
    return new Response(
      JSON.stringify({
        message: 'API proxy error: ' + err.message,
        hint: 'Check that WORKER_URL in client/functions/_middleware.js is correct and the Worker is deployed.',
      }),
      {
        status:  502,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Handle CORS preflight OPTIONS requests
export async function onRequestOptions(context) {
  const url = new URL(context.request.url)
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  url.origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age':       '86400',
    },
  })
}
