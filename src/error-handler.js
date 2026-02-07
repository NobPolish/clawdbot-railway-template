// Advanced Error Handling and Recovery System
import EventEmitter from "node:events";

/**
 * Custom error classes for better error categorization
 */
export class GatewayError extends Error {
  constructor(message, code = "GATEWAY_ERROR", details = {}) {
    super(message);
    this.name = "GatewayError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class TimeoutError extends Error {
  constructor(message, operation, duration) {
    super(message);
    this.name = "TimeoutError";
    this.operation = operation;
    this.duration = duration;
    this.timestamp = new Date().toISOString();
  }
}

export class ConfigurationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ConfigurationError";
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Circuit Breaker Pattern - prevents cascading failures
 */
export class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();
    this.failureThreshold = options.failureThreshold ?? 5;
    this.successThreshold = options.successThreshold ?? 2;
    this.timeout = options.timeout ?? 60000; // 1 minute
    this.resetTimeout = options.resetTimeout ?? 30000; // 30 seconds
    
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.lastError = null;
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new GatewayError(
          `Circuit breaker is OPEN. Last error: ${this.lastError?.message}`,
          "CIRCUIT_OPEN",
          { nextAttempt: new Date(this.nextAttempt).toISOString(), lastError: this.lastError }
        );
      }
      this.state = "HALF_OPEN";
      this.emit("half-open");
    }

    try {
      const result = await this.withTimeout(fn());
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  async withTimeout(promise) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new TimeoutError("Circuit breaker timeout", "execute", this.timeout)), this.timeout)
      ),
    ]);
  }

  onSuccess() {
    this.failures = 0;
    
    if (this.state === "HALF_OPEN") {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = "CLOSED";
        this.successes = 0;
        this.emit("closed");
      }
    }
  }

  onFailure(error) {
    this.failures++;
    this.lastError = error;
    this.successes = 0;
    
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout;
      this.emit("open", { error, nextAttempt: this.nextAttempt });
    }
  }

  reset() {
    this.state = "CLOSED";
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.lastError = null;
    this.emit("reset");
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      nextAttempt: new Date(this.nextAttempt).toISOString(),
      lastError: this.lastError ? {
        message: this.lastError.message,
        code: this.lastError.code,
        timestamp: this.lastError.timestamp
      } : null
    };
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.initialDelay = options.initialDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
    this.backoffFactor = options.backoffFactor ?? 2;
    this.retryableErrors = new Set(options.retryableErrors ?? ["ETIMEDOUT", "ECONNREFUSED", "ENOTFOUND"]);
  }

  isRetryable(error) {
    if (error.code && this.retryableErrors.has(error.code)) return true;
    if (error instanceof TimeoutError) return true;
    if (error.name === "FetchError") return true;
    return false;
  }

  async execute(fn, context = "operation") {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries || !this.isRetryable(error)) {
          throw error;
        }
        
        const delay = Math.min(
          this.initialDelay * Math.pow(this.backoffFactor, attempt),
          this.maxDelay
        );
        
        console.warn(`[RetryHandler] ${context} failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms:`, error.message);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Process Monitor - monitors child process health and restarts if needed
 */
export class ProcessMonitor extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.process = null;
    this.restartAttempts = 0;
    this.maxRestartAttempts = options.maxRestartAttempts ?? 5;
    this.restartDelay = options.restartDelay ?? 5000;
    this.healthCheckInterval = options.healthCheckInterval ?? 30000;
    this.healthCheckFn = options.healthCheckFn ?? null;
    this.lastHealthCheck = null;
    this.healthCheckTimer = null;
    this.state = "STOPPED"; // STOPPED, STARTING, RUNNING, UNHEALTHY, FAILED
  }

  setProcess(proc) {
    this.process = proc;
    this.state = "STARTING";
    this.setupProcessHandlers();
    this.startHealthChecks();
  }

  setupProcessHandlers() {
    if (!this.process) return;

    this.process.on("error", (err) => {
      console.error(`[ProcessMonitor:${this.name}] Process error:`, err);
      this.state = "FAILED";
      this.emit("error", err);
      this.attemptRestart(err);
    });

    this.process.on("exit", (code, signal) => {
      console.warn(`[ProcessMonitor:${this.name}] Process exited: code=${code} signal=${signal}`);
      this.state = "STOPPED";
      this.stopHealthChecks();
      this.emit("exit", { code, signal });
      
      if (code !== 0 || signal) {
        this.attemptRestart(new Error(`Process exited with code ${code} signal ${signal}`));
      }
    });
  }

  async attemptRestart(error) {
    if (this.restartAttempts >= this.maxRestartAttempts) {
      console.error(`[ProcessMonitor:${this.name}] Max restart attempts (${this.maxRestartAttempts}) reached. Giving up.`);
      this.state = "FAILED";
      this.emit("failed", error);
      return;
    }

    this.restartAttempts++;
    console.log(`[ProcessMonitor:${this.name}] Attempting restart ${this.restartAttempts}/${this.maxRestartAttempts} in ${this.restartDelay}ms`);
    
    await this.sleep(this.restartDelay);
    this.emit("restart", { attempt: this.restartAttempts, error });
  }

  startHealthChecks() {
    if (!this.healthCheckFn || this.healthCheckTimer) return;

    this.healthCheckTimer = setInterval(async () => {
      try {
        const isHealthy = await this.healthCheckFn();
        this.lastHealthCheck = { timestamp: new Date(), healthy: isHealthy };
        
        if (isHealthy) {
          if (this.state === "STARTING") {
            this.state = "RUNNING";
            this.restartAttempts = 0; // Reset on successful health check
            this.emit("healthy");
          }
        } else {
          console.warn(`[ProcessMonitor:${this.name}] Health check failed`);
          this.state = "UNHEALTHY";
          this.emit("unhealthy");
        }
      } catch (error) {
        console.error(`[ProcessMonitor:${this.name}] Health check error:`, error);
        this.state = "UNHEALTHY";
        this.emit("unhealthy", error);
      }
    }, this.healthCheckInterval);
  }

  stopHealthChecks() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  stop() {
    this.stopHealthChecks();
    if (this.process) {
      try {
        this.process.kill("SIGTERM");
      } catch (err) {
        console.warn(`[ProcessMonitor:${this.name}] Error stopping process:`, err);
      }
      this.process = null;
    }
    this.state = "STOPPED";
  }

  getState() {
    return {
      name: this.name,
      state: this.state,
      restartAttempts: this.restartAttempts,
      maxRestartAttempts: this.maxRestartAttempts,
      lastHealthCheck: this.lastHealthCheck,
      pid: this.process?.pid ?? null
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Request timeout middleware
 */
export function createTimeoutMiddleware(defaultTimeout = 30000) {
  return (req, res, next) => {
    const timeout = req.headers['x-timeout'] ? parseInt(req.headers['x-timeout']) : defaultTimeout;
    
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`[Timeout] Request timeout after ${timeout}ms: ${req.method} ${req.path}`);
        res.status(408).json({
          ok: false,
          error: "Request timeout",
          code: "TIMEOUT",
          timeout,
          path: req.path
        });
      }
    }, timeout);

    // Clear timeout when response finishes
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    
    next();
  };
}

/**
 * Global error handler middleware
 */
export function createErrorHandler() {
  return (err, req, res, next) => {
    // Log the error
    console.error("[ErrorHandler] Unhandled error:", {
      error: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
      path: req.path,
      method: req.method
    });

    // Don't send error if headers already sent
    if (res.headersSent) {
      return next(err);
    }

    // Determine status code
    let statusCode = 500;
    if (err instanceof TimeoutError) statusCode = 408;
    if (err instanceof ConfigurationError) statusCode = 400;
    if (err.statusCode) statusCode = err.statusCode;

    // Send error response
    res.status(statusCode).json({
      ok: false,
      error: err.message || "Internal server error",
      code: err.code || "INTERNAL_ERROR",
      name: err.name || "Error",
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
  };
}

/**
 * Async handler wrapper - catches async errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Graceful shutdown handler
 */
export class ShutdownHandler {
  constructor() {
    this.handlers = [];
    this.shuttingDown = false;
  }

  register(name, handler) {
    this.handlers.push({ name, handler });
  }

  async shutdown(signal = "SIGTERM") {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    console.log(`[ShutdownHandler] Received ${signal}, starting graceful shutdown...`);

    const timeout = setTimeout(() => {
      console.error("[ShutdownHandler] Shutdown timeout, forcing exit");
      process.exit(1);
    }, 30000); // 30 second timeout

    try {
      for (const { name, handler } of this.handlers) {
        try {
          console.log(`[ShutdownHandler] Executing: ${name}`);
          await Promise.race([
            handler(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`${name} timeout`)), 5000)
            )
          ]);
          console.log(`[ShutdownHandler] Completed: ${name}`);
        } catch (error) {
          console.error(`[ShutdownHandler] Error in ${name}:`, error);
        }
      }
    } finally {
      clearTimeout(timeout);
      console.log("[ShutdownHandler] Graceful shutdown complete");
      process.exit(0);
    }
  }

  setupSignalHandlers() {
    ["SIGTERM", "SIGINT"].forEach(signal => {
      process.on(signal, () => this.shutdown(signal));
    });

    process.on("uncaughtException", (error) => {
      console.error("[FATAL] Uncaught exception:", error);
      this.shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("[FATAL] Unhandled rejection:", reason);
      this.shutdown("unhandledRejection");
    });
  }
}
