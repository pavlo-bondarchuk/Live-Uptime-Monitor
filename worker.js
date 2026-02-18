/**
 * Cloudflare Worker proxy for Live Uptime Monitor
 * Handles cross-origin requests to check website uptime
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, HEAD, POST, OPTIONS",
          "access-control-allow-headers": "content-type, cache-control, pragma",
          "access-control-max-age": "86400"
        }
      });
    }
    
    // Only allow GET requests for the /check endpoint
    if (request.method !== "GET" || !url.pathname.endsWith("/check")) {
      return jsonResponse({ error: "Not found" }, 404);
    }
    
    // Extract query parameters
    const targetUrl = url.searchParams.get("url");
    const method = url.searchParams.get("method") || "GET";
    const timeout = parseInt(url.searchParams.get("timeout") || "10", 10);
    
    if (!targetUrl) {
      return jsonResponse({ error: "Missing url parameter" }, 400);
    }
    
    // Validate method
    if (!["GET", "HEAD"].includes(method)) {
      return jsonResponse({ error: "Invalid method, must be GET or HEAD" }, 400);
    }
    
    // Validate timeout
    const timeoutMs = Math.max(2, Math.min(timeout, 30)) * 1000; // Clamp between 2-30 seconds
    
    const started = Date.now();
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      // Fetch the target URL
      const response = await fetch(targetUrl, {
        method: method,
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "user-agent": "Live-Uptime-Monitor/1.0"
        }
      });
      
      clearTimeout(timeoutId);
      
      const totalMs = Date.now() - started;
      
      // Read response body for GET requests
      let bodyText = "";
      let bytes = null;
      
      if (method !== "HEAD") {
        bodyText = await response.text();
        bytes = new TextEncoder().encode(bodyText).length;
      }
      
      // Extract headers
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      // Build result
      const result = {
        status: response.status,
        headers: headers,
        bodyText: bodyText,
        bytes: bytes,
        redirected: response.redirected,
        finalUrl: response.url,
        timing: {
          totalMs: totalMs
        }
      };
      
      return jsonResponse(result, 200);
      
    } catch (error) {
      const totalMs = Date.now() - started;
      
      // Handle timeout and other errors
      const errorMessage = error.name === "AbortError" 
        ? "Request timeout" 
        : error.message || "Unknown error";
      
      return jsonResponse({
        status: null,
        headers: {},
        bodyText: "",
        bytes: null,
        redirected: false,
        finalUrl: "",
        timing: {
          totalMs: totalMs
        },
        error: errorMessage
      }, 200); // Return 200 with error in JSON body for consistency
    }
  }
};

/**
 * Helper function to create JSON response with proper CORS headers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "cache-control": "no-store"
    }
  });
}
