const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(
    '/proxy',
    createProxyMiddleware({
        target: 'https://www.google.com',
        changeOrigin: true,
        onProxyReq: (proxyReq) => {
            // Optional: Remove headers that prevent embedding (Google may still block it)
            proxyReq.removeHeader('x-frame-options');
            proxyReq.removeHeader('content-security-policy');
        },
        onProxyRes: (proxyRes) => {
            // Modify headers in response if needed
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        }
    })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
