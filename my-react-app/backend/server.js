import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import cors from 'cors';
import fs from 'fs';

const app = express();
const port = 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'images')));




const runningProcesses = new Map();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const publicPath = path.join(__dirname, 'public');
app.use('/public', express.static(publicPath));

// Function to find and kill process by port (for Windows and Unix)
const killProcessByPort = (port) => {
    return new Promise((resolve, reject) => {
        const isWindows = process.platform === 'win32';
        const command = isWindows
            ? `netstat -ano | findstr :${port}`
            : `lsof -i :${port} -t`;

        exec(command, (error, stdout, stderr) => {
            if (error || !stdout) {
                console.log(`No process found on port ${port}`);
                resolve();
                return;
            }

            const pid = isWindows 
                ? stdout.split('\n')[0].split(' ').filter(Boolean).pop()
                : stdout.trim();

            if (pid) {
                console.log(`Found process on port ${port} with PID ${pid}`);
                const killCommand = isWindows
                    ? `taskkill /F /PID ${pid}`
                    : `kill -9 ${pid}`;

                exec(killCommand, (err) => {
                    if (err) {
                        console.error(`Failed to kill process ${pid}:`, err);
                        reject(err);
                    } else {
                        console.log(`Successfully killed process ${pid}`);
                        resolve();
                    }
                });
            } else {
                console.log(`No process found on port ${port}`);
                resolve();
            }
        });
    });
};


// Enhanced kill function
const killExistingProcess = async (jarName) => {
    try {
        // First try to kill by stored process
        if (runningProcesses.has(jarName)) {
            const process = runningProcesses.get(jarName);
            console.log(`Killing process for ${jarName}`);
            process.kill('SIGTERM');  // You could try 'SIGKILL' if 'SIGTERM' fails
            runningProcesses.delete(jarName);
            console.log(`Killed process for ${jarName}`);
        }

        // Then ensure port 8080 is cleared (for Spring Boot)
        if (jarName === 'amazin') {
            console.log(`Checking port 8080 for process termination`);
            await killProcessByPort(8080);
            console.log(`Port 8080 should be cleared`);
        }
    } catch (error) {
        console.error('Error killing process:', error);
        throw error;
    }
};


app.get('/run-jar', async (req, res) => {
    const { jar } = req.query;
    if (!jar) return res.status(400).send('JAR file name is required.');

    try {
        // Kill any existing process first
        await killExistingProcess(jar);

        const jarPath = path.join(__dirname, 'public', `${jar}.jar`);
        if (!fs.existsSync(jarPath)) {
            return res.status(404).send(`JAR file not found: ${jar}.jar`);
        }

        const javaProcess = spawn('java', [
            '-jar',
            jarPath,
            '--server.port=8080'
        ]);

        runningProcesses.set(jar, javaProcess);

        let responseSent = false; // Track if the response has been sent
        let output = '';
        
        javaProcess.stdout.on('data', (data) => {
            output += data;
            console.log(data.toString());
            if (!responseSent && output.includes('Started') && output.includes('Application')) {
                res.send('Application started successfully');
                responseSent = true;
            }
        });

        javaProcess.stderr.on('data', (data) => {
            console.error(data.toString());
            if (!responseSent) {
                res.status(500).send(`Error in application startup: ${data.toString()}`);
                responseSent = true;
            }
        });

        javaProcess.on('error', (error) => {
            console.error('Failed to start process:', error);
            if (!responseSent) {
                res.status(500).send(`Failed to start application: ${error.message}`);
                responseSent = true;
            }
        });

        javaProcess.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            if (!responseSent && code !== 0) {
                res.status(500).send(`Application terminated with exit code ${code}`);
                responseSent = true;
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(`Error: ${error.message}`);
    }
});


app.get('/stop-jar', async (req, res) => {
    const { jar } = req.query;
    if (!jar) return res.status(400).send('JAR file name is required.');

    try {
        await killExistingProcess(jar);
        res.send(`Stopped ${jar} application`);
    } catch (error) {
        console.error('Error stopping application:', error);
        res.status(500).send(`Error stopping application: ${error.message}`);
    }
});

// Cleanup on server shutdown
process.on('SIGINT', async () => {
    for (const [jarName] of runningProcesses) {
        await killExistingProcess(jarName);
    }
    process.exit();
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});