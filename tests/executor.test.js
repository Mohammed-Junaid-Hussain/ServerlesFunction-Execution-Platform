const { executeFunction } = require('../src/core/executor');

describe('Function Executor', () => {
  test('executes JavaScript function successfully', async () => {
    const func = {
      name: 'test-function',
      language: 'javascript',
      code: 'function main(input) { return input.x + input.y; }',
      timeout: 5000,
      virtualization: 'docker',
    };

    const input = { x: 5, y: 3 };
    const result = await executeFunction(func, input);

    expect(result.success).toBe(true);
    expect(result.result).toBe(8);
    expect(result.executionTime).toBeDefined();
  });

  test('executes Python function successfully', async () => {
    const func = {
      name: 'test-function-python',
      language: 'python',
      code: 'def main(input_data):\n    return input_data["x"] + input_data["y"]',
      timeout: 5000,
      virtualization: 'docker',
    };

    const input = { x: 5, y: 3 };
    const result = await executeFunction(func, input);

    expect(result.success).toBe(true);
    expect(result.result).toBe(8);
    expect(result.executionTime).toBeDefined();
  });

  test('handles function timeout', async () => {
    const func = {
      name: 'test-function-timeout',
      language: 'javascript',
      code: 'function main(input) { while(true) {} }',
      timeout: 1000,
      virtualization: 'docker',
    };

    const result = await executeFunction(func, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain('timeout');
    expect(result.executionTime).toBeDefined();
  });

  test('handles syntax errors', async () => {
    const func = {
      name: 'test-function-error',
      language: 'javascript',
      code: 'function main(input) { return x + y; }',
      timeout: 5000,
      virtualization: 'docker',
    };

    const result = await executeFunction(func, {});

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.executionTime).toBeDefined();
  });
}); 