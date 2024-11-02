const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Use express to handle URL parameters
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create a proxy middleware
app.use(
    '/proxy',
    createProxyMiddleware({
        target: 'http://localhost', // Using a local target as a placeholder
        changeOrigin: true,
        pathRewrite: (path, req) => {
            // Extract the URL to proxy from the request body
            const targetUrl = req.body.url; // Expecting a JSON body with the 'url' field
            return targetUrl ? path + targetUrl : path;
        },
        onProxyReq: (proxyReq, req) => {
            // Remove security headers that prevent embedding (optional)
            proxyReq.removeHeader('x-frame-options');
            proxyReq.removeHeader('content-security-policy');
        },
        onProxyRes: (proxyRes) => {
            // Optionally modify headers in response
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        }
    })
);

// Endpoint to receive the URL
app.post('/proxy', (req, res) => {
    const targetUrl = req.body.url;
    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }
    res.redirect(`/proxy?url=${encodeURIComponent(targetUrl)}`);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
