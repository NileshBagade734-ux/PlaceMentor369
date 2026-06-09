import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🌱 Starting MongoDB Memory Server...");
  const mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '4.4.24'
    }
  });
  const uri = mongoServer.getUri();
  console.log(`✅ MongoDB Memory Server running at: ${uri}`);

  const envPath = path.join(__dirname, '.env');
  const envContent = `MONGO_URI=${uri}
JWT_SECRET=supersecretjwtkey12345
PORT=5000
`;

  fs.writeFileSync(envPath, envContent);
  console.log("📝 Generated temporary backend/.env file.");

  console.log("🌱 Seeding database...");
  const seedProcess = spawn('node', ['seed.js'], { cwd: __dirname, stdio: 'inherit' });
  
  seedProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error("❌ Seeding failed, starting server anyway...");
    } else {
      console.log("✅ Seeding complete.");
    }

    console.log("🚀 Starting backend server with nodemon...");
    const serverProcess = spawn('npx', ['nodemon', 'server.js'], { cwd: __dirname, stdio: 'inherit', shell: true });
    
    process.on('SIGINT', async () => {
      console.log("🛑 Stopping server and MongoDB Memory Server...");
      serverProcess.kill();
      await mongoServer.stop();
      process.exit(0);
    });
  });
}

main().catch(err => {
  console.error("❌ Failed to start development environment:", err);
});
