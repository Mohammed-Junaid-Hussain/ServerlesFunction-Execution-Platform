const Docker = require('dockerode');
const FirecrackerExecutor = require('../virtualization/firecracker');
const MetricsCollector = require('../metrics/MetricsCollector');
const docker = new Docker();
const firecracker = new FirecrackerExecutor();

// Initialize Firecracker
firecracker.init().catch(console.error);

// Function to execute code in a Docker container
async function executeInDocker(func, input) {
  const { language, code, timeout } = func;
  const startTime = process.hrtime();

  // Create container configuration
  const containerConfig = {
    Image: language === 'python' ? 'python:3.9-slim' : 'node:16-slim',
    Cmd: [],
    WorkingDir: '/app',
    HostConfig: {
      AutoRemove: false,
      Memory: 128 * 1024 * 1024, // 128MB memory limit
      MemorySwap: -1,
      NetworkMode: 'none', // Disable network access
    },
  };

  // Prepare the execution code based on the language
  let executableCode;
  if (language === 'python') {
    // Indent the code by 4 spaces
    const indentedCode = code.split('\n').map(line => '    ' + line).join('\n');
    executableCode = `
import json
import sys
import resource

${code}

if __name__ == '__main__':
    input_data = json.loads('''${JSON.stringify(input)}''')
    result = main(input_data)
    usage = resource.getrusage(resource.RUSAGE_SELF)
    print(json.dumps({
        'result': result,
        'metrics': {
            'memory': usage.ru_maxrss,
            'cpu': usage.ru_utime + usage.ru_stime
        }
    }))
`;
    console.log('Executing Python code:', executableCode);
    containerConfig.Cmd = ['python', '-c', executableCode];
  } else {
    executableCode = `
const input = ${JSON.stringify(input)};

${code}

const result = main(input);
const usage = process.memoryUsage();
console.log(JSON.stringify({
    result,
    metrics: {
        memory: usage.heapUsed,
        cpu: process.cpuUsage().user + process.cpuUsage().system
    }
}));
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

        let output = Buffer.from([]);
        stream.on('data', chunk => {
          // Docker adds 8 bytes of header to each chunk
          // First 4 bytes are the stream type (stdout/stderr)
          // Next 4 bytes are the length
          // The rest is the actual data
          if (chunk.length > 8) {
            output = Buffer.concat([output, chunk.slice(8)]);
          }
        });
        stream.on('end', () => {
          console.log('Final output:', output.toString());
          resolve(output);
        });
        stream.on('error', reject);
      });
    });

    // Wait for execution or timeout
    const output = await Promise.race([executionPromise, timeoutPromise]);
    const executionTime = process.hrtime(startTime);
    const executionTimeMs = (executionTime[0] * 1e9 + executionTime[1]) / 1e6;

    try {
      const outputStr = output.toString().trim();
      console.log('Parsing output:', outputStr);
      const parsed = JSON.parse(outputStr);
      console.log('Parsed output:', parsed);
      return {
        success: true,
        result: parsed.result,
        executionTime: executionTimeMs,
        memoryUsage: parsed.metrics.memory,
        cpuUsage: parsed.metrics.cpu,
      };
    } catch (error) {
      console.error('Error parsing output:', error);
      return {
        success: true,
        result: { output: output.toString().trim() },
        executionTime: executionTimeMs,
      };
    }
  } catch (error) {
    throw new Error(`Execution failed: ${error.message}`);
  }
}

// Main executor function
async function executeFunction(func, input) {
  const startTime = Date.now();
  const metrics = {
    virtualization: func.virtualization,
  };

  try {
    let result;
    if (func.virtualization === 'docker') {
      result = await executeInDocker(func, input);
    } else {
      result = await firecracker.executeFunction(func, input);
    }

    metrics.executionTime = Date.now() - startTime;
    metrics.success = true;
    metrics.memoryUsage = result.memoryUsage;
    metrics.cpuUsage = result.cpuUsage;

    // Record metrics
    await MetricsCollector.recordExecution(func._id, metrics);

    return {
      success: true,
      result: result.result,
      executionTime: metrics.executionTime,
    };
  } catch (error) {
    metrics.executionTime = Date.now() - startTime;
    metrics.success = false;
    metrics.error = error.message;

    // Record metrics
    await MetricsCollector.recordExecution(func._id, metrics);

    return {
      success: false,
      error: error.message,
      executionTime: metrics.executionTime,
    };
  }
}

module.exports = {
  executeFunction,
}; 