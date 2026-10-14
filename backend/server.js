import { app } from './src/app.js'
import http from "http"
import "dotenv/config";

const server = http.createServer(app);

server.listen(process.env.PORT || 3000, () => {
    console.log(`server is Running at ` ,process.env.PORT || 3000)
})