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
        },
        onProxyRes: (proxyRes) => {
            // Remove headers from response to allow iframe embedding
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        },
        pathRewrite: (path, req) => {
            // Get the target URL from the query parameter
            const targetUrl = req.query.target;
            return targetUrl ? path + targetUrl : path;
        },
    })
);

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
