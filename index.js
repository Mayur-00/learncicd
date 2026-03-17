import express from 'express';
import responseTime from 'response-time';
import client from "prom-client"
import { logger } from './logger.js';
import { doHeavyTask } from './utils.js';
const app = express();
const port = process.env.port ?? 8080;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({register:client.register});

const reqTime = new client.Histogram({
    name:"http_express_req_res_time",
    message:"Time Taken by req and res",
    labelNames:["method", "route", "status_code"],
    buckets:[1, 50 ,100, 200, 400, 500, 800, 1000, 2000],
    help:"time taken by req and res"
});

const totalRequestCounter = new client.Counter({
    name:"total_req",
    help:"Tells Total requests on the server"
})

app.use(responseTime((req, res, time) => {
    totalRequestCounter.inc();
    reqTime.labels( 
        {
            method:req.method,
            route:req.url,
            status_code:res.statusCode
        }
    ).observe(time)
}))

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