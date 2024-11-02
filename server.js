const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create a proxy middleware
app.use(
    '/proxy',
    createProxyMiddleware({
        changeOrigin: true,
        onProxyReq: (proxyReq, req) => {
            // Remove headers that prevent embedding
            proxyReq.removeHeader('x-frame-options');
            proxyReq.removeHeader('content-security-policy');
            proxyReq.removeHeader('access-control-allow-origin');
        },
        onProxyRes: (proxyRes) => {
            // Remove headers from response to allow iframe embedding
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['access-control-allow-origin'];
        },
        pathRewrite: (path, req) => {
            // Get the target URL from the query parameter
            const targetUrl = req.query.target;
            return targetUrl ? path + targetUrl : path;
        },
        selfHandleResponse: true, // Enable custom handling of the response
        async onProxyRes(proxyRes, req, res) {
            let body = [];
            proxyRes.on('data', (chunk) => {
                body.push(chunk);
            });
            proxyRes.on('end', () => {
                body = Buffer.concat(body).toString();
                // Modify the body if needed (e.g., remove scripts that block embedding)
                // This part could be complex depending on the website.
                res.send(body);
            });
        }
    })
);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
