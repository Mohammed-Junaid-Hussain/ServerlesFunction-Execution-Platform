const Docker = require('dockerode');
const docker = new Docker();

// Function to execute code in a Docker container
async function executeInDocker(func, input) {
  const { language, code, timeout } = func;

  // Create container configuration
  const containerConfig = {
    Image: language === 'python' ? 'python:3.9-slim' : 'node:16-slim',
    Cmd: [],
    WorkingDir: '/app',
    HostConfig: {
      AutoRemove: true,
      Memory: 128 * 1024 * 1024, // 128MB memory limit
      MemorySwap: -1,
      NetworkMode: 'none', // Disable network access
    },
  };

  // Prepare the execution code based on the language
  let executableCode;
  if (language === 'python') {
    executableCode = `
import json
import sys

def main():
    input_data = json.loads('''${JSON.stringify(input)}''')
    
${code}

    result = main(input_data)
    print(json.dumps(result))
`;
    containerConfig.Cmd = ['python', '-c', executableCode];
  } else {
    executableCode = `
const input = ${JSON.stringify(input)};

${code}

const result = main(input);
console.log(JSON.stringify(result));
`;
    containerConfig.Cmd = ['node', '-e', executableCode];
  }

  try {
    // Create and start the container
    const container = await docker.createContainer(containerConfig);
    await container.start();

    // Set up execution timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        container.stop()
          .then(() => reject(new Error('Function execution timed out')))
          .catch(reject);
      }, timeout);
    });

    // Get container logs
    const executionPromise = new Promise((resolve, reject) => {
      container.logs({
        follow: true,
        stdout: true,
        stderr: true,
      }, (err, stream) => {
        if (err) return reject(err);

        let output = '';
        stream.on('data', chunk => output += chunk);
        stream.on('end', () => resolve(output));
        stream.on('error', reject);
      });
    });

    // Wait for execution or timeout
    const output = await Promise.race([executionPromise, timeoutPromise]);

    try {
      return JSON.parse(output.toString().trim());
    } catch (error) {
      return { output: output.toString().trim() };
    }
  } catch (error) {
    throw new Error(`Execution failed: ${error.message}`);
  }
}

// Main executor function
async function executeFunction(func, input) {
  const startTime = Date.now();

  try {
    // Execute the function using Docker
    const result = await executeInDocker(func, input);

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    return {
      success: true,
      result,
      executionTime,
    };
  } catch (error) {
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    return {
      success: false,
      error: error.message,
      executionTime,
    };
  }
}

module.exports = {
  executeFunction,
}; 