import express from 'express';
import responseTime from 'response-time';
import client from "prom-client"
import { logger } from './logger.js';
import { doHeavyTask } from './utils.js';
import { observabilityMiddleware } from './middleware.js';
const app = express();
const port = process.env.port ?? 8080;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({register:client.register});

app.use(observabilityMiddleware)

app.get('/health', (req, res) => {

    logger.info("request came on /health route")
    const clientInfo = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        host: req.headers['host'],
        acceptLanguage: req.headers['accept-language'],
        acceptEncoding: req.headers['accept-encoding']
    };
   return res.status(200).json({
        message: 'server is working fine yoo!!!, with ci cd working',
        client: clientInfo
    })
});

app.get("/slow",async (req, res) => {
    try {
        logger.info("request came on /health route")

        const timeTaken = await doHeavyTask();

        return res.json({
            status:"success",
            message:`Heavy task completed in ${timeTaken}`
        });

    } catch (error) {
        logger.error("error came on /slow route  error :", {error:error.message})
        return res.json({
            status:"Error",
            error:"Internal Server Error"
        });
    }
});

app.get("/metrics", async(req, res) => {
    res.setHeader("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
})


app.listen(port, ()=> {
    console.log(`server is started on port: ${port}`);
})