# Live Uptime Monitor

A live uptime monitoring tool hosted on GitHub Pages that can monitor website availability in real-time.

## Features

- Real-time website uptime monitoring
- Support for both direct checks and proxy mode via Cloudflare Workers
- White screen detection heuristic for catching site issues
- Export logs to CSV or JSON
- Configurable check intervals and timeouts
- Sound alerts on failures
- Filter and search through monitoring logs

## Usage

Visit the hosted version at: [https://pavlo-bondarchuk.github.io/Live-Uptime-Monitor/](https://pavlo-bondarchuk.github.io/Live-Uptime-Monitor/)

### Direct Mode
Use Direct mode to check websites from your browser directly. Note: This may fail due to CORS restrictions on some sites.

### Worker Proxy Mode
For better compatibility, use the Cloudflare Worker Proxy mode which bypasses CORS restrictions.

## Cloudflare Worker Setup

To use the Worker Proxy mode, you need to deploy the `worker.js` file to Cloudflare Workers:

1. **Create a Cloudflare Account** (if you don't have one)
   - Sign up at [cloudflare.com](https://cloudflare.com)

2. **Deploy the Worker**
   - Go to Workers & Pages in your Cloudflare dashboard
   - Click "Create Application" > "Create Worker"
   - Replace the default code with the contents of `worker.js`
   - Click "Save and Deploy"

3. **Configure the Worker URL**
   - Copy your worker URL (e.g., `https://your-worker.your-subdomain.workers.dev/check`)
   - Paste it into the "Worker URL" field in the Live Uptime Monitor UI

4. **Start Monitoring**
   - Select "Cloudflare Worker Proxy" from the Proxy dropdown
   - Enter your target URL and click "Start"

## Development

The project consists of:
- `index.html` - Single-page application with all UI and monitoring logic
- `worker.js` - Cloudflare Worker for CORS-free website checking

### CORS Handling

The worker properly handles CORS preflight requests with:
- `access-control-allow-origin: *`
- `access-control-allow-headers: content-type, cache-control, pragma`
- `access-control-max-age: 86400` (24 hours)

### API

The worker endpoint accepts the following query parameters:
- `url` (required) - Target URL to check
- `method` (optional) - HTTP method (GET or HEAD), defaults to GET
- `timeout` (optional) - Timeout in seconds (2-30), defaults to 10

Example:
```
https://your-worker.workers.dev/check?url=https://example.com&method=GET&timeout=10
```

## License

MIT
