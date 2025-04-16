const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
  functionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Function',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  executionTime: {
    type: Number,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
  error: String,
  memoryUsage: Number,
  cpuUsage: Number,
  virtualization: {
    type: String,
    required: true,
    enum: ['docker', 'firecracker'],
  },
});

const Metric = mongoose.model('Metric', metricsSchema);

class MetricsCollector {
  static async recordExecution(functionId, metrics) {
    try {
      const metricData = {
        functionId,
        executionTime: metrics.executionTime,
        success: metrics.success,
        error: metrics.error,
        memoryUsage: metrics.memoryUsage,
        cpuUsage: metrics.cpuUsage,
        virtualization: metrics.virtualization,
      };

      const metric = new Metric(metricData);
      await metric.save();
      return metric;
    } catch (error) {
      console.error('Failed to record metrics:', error);
      throw error;
    }
  }

  static async getFunctionMetrics(functionId, timeRange = '24h') {
    const timeFilter = {};
    const now = new Date();

    switch (timeRange) {
      case '1h':
        timeFilter.timestamp = { $gte: new Date(now - 60 * 60 * 1000) };
        break;
      case '24h':
        timeFilter.timestamp = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
        break;
      case '7d':
        timeFilter.timestamp = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        break;
      default:
        timeFilter.timestamp = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
    }

    const metrics = await Metric.find({
      functionId,
      ...timeFilter,
    }).sort({ timestamp: -1 });

    const aggregates = {
      totalExecutions: metrics.length,
      successfulExecutions: metrics.filter(m => m.success).length,
      failedExecutions: metrics.filter(m => !m.success).length,
      averageExecutionTime: metrics.reduce((acc, m) => acc + m.executionTime, 0) / metrics.length || 0,
      averageMemoryUsage: metrics.reduce((acc, m) => acc + (m.memoryUsage || 0), 0) / metrics.length || 0,
      averageCpuUsage: metrics.reduce((acc, m) => acc + (m.cpuUsage || 0), 0) / metrics.length || 0,
    };

    return {
      metrics,
      aggregates,
    };
  }

  static async getSystemMetrics(timeRange = '24h') {
    const timeFilter = {};
    const now = new Date();

    switch (timeRange) {
      case '1h':
        timeFilter.timestamp = { $gte: new Date(now - 60 * 60 * 1000) };
        break;
      case '24h':
        timeFilter.timestamp = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
        break;
      case '7d':
        timeFilter.timestamp = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        break;
      default:
        timeFilter.timestamp = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
    }

    const metrics = await Metric.find(timeFilter).populate('functionId');

    return {
      totalExecutions: metrics.length,
      successRate: (metrics.filter(m => m.success).length / metrics.length) * 100 || 0,
      averageExecutionTime: metrics.reduce((acc, m) => acc + m.executionTime, 0) / metrics.length || 0,
      executionsByVirtualization: {
        docker: metrics.filter(m => m.virtualization === 'docker').length,
        firecracker: metrics.filter(m => m.virtualization === 'firecracker').length,
      },
    };
  }
}

module.exports = MetricsCollector; 