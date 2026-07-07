import { Queue } from "bullmq";
import connection from "../config/redis.js";

const emailQueue = connection ? new Queue("email-queue", { connection }) : null;

export default emailQueue;
