import express from 'express';
const app = express();
const port = process.env.port ?? 8080;

app.get('/health', (req, res) => {
    const clientInfo = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        host: req.headers['host'],
        acceptLanguage: req.headers['accept-language'],
        acceptEncoding: req.headers['accept-encoding']
    };
   return res.status(200).json({
        message: 'server is working fine',
        client: clientInfo
    })
})


app.listen(port, ()=> {
    console.log(`server is started on port: ${port}`);
})