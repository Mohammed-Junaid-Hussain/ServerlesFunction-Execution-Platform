const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class FirecrackerExecutor {
  constructor() {
    this.vmPath = path.join(os.tmpdir(), 'firecracker-vms');
  }

  async init() {
    await fs.mkdir(this.vmPath, { recursive: true });
  }

  async executeFunction(func, input) {
    const { code, language, timeout } = func;
    const vmId = `vm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const vmDir = path.join(this.vmPath, vmId);
    
    try {
      await fs.mkdir(vmDir);
      
      // Create the code file
      const filename = language === 'python' ? 'main.py' : 'main.js';
      const codePath = path.join(vmDir, filename);
      
      // Prepare the execution code
      let executableCode;
      if (language === 'python') {
        executableCode = `
import json
import sys

def main(input_data):
    ${code}

if __name__ == '__main__':
    input_data = json.loads(sys.argv[1])
    result = main(input_data)
    print(json.dumps(result))
`;
      } else {
        executableCode = `
const input = JSON.parse(process.argv[1]);

${code}

const result = main(input);
console.log(JSON.stringify(result));
`;
      }
      
      await fs.writeFile(codePath, executableCode);

      // Create kernel and rootfs (this would normally use pre-built images)
      // For this example, we'll use a mock implementation
      const result = await this.mockFirecrackerExecution(vmDir, filename, input, language, timeout);
      
      return result;
    } finally {
      // Cleanup
      try {
        await fs.rm(vmDir, { recursive: true, force: true });
      } catch (error) {
        console.error('Failed to cleanup VM directory:', error);
      }
    }
  }

  async mockFirecrackerExecution(vmDir, filename, input, language, timeout) {
    return new Promise((resolve, reject) => {
      const cmd = language === 'python' ? 'python' : 'node';
      const process = spawn(cmd, [
        path.join(vmDir, filename),
        JSON.stringify(input)
      ]);

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      const timer = setTimeout(() => {
        process.kill();
        reject(new Error('Function execution timed out'));
      }, timeout);

      process.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          try {
            const result = JSON.parse(output.trim());
            resolve(result);
          } catch (e) {
            resolve({ output: output.trim() });
          }
        } else {
          reject(new Error(error || 'Function execution failed'));
        }
      });
    });
  }
}

module.exports = FirecrackerExecutor; 