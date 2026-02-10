// Gateway Lifecycle Manager — simplified, resilient, non-blocking.
import childProcess from "node:child_process";
import { GatewayError } from "./error-handler.js";

export class GatewayManager {
  constructor(config) {
    this.config = config;
    this.process = null;
    this.starting = null;
    this.ready = false;
    this.startedAt = null;
    this.lastError = null;
    this.consecutiveFailures = 0;
    this._output = [];          // ring buffer for last N lines of gateway output
    this._maxOutputLines = 200;
  }

  isConfigured() {
    return this.config.isConfigured();
  }

  isRunning() {
    return this.process !== null && !this.process.killed;
  }

  isReady() {
    return this.isRunning() && this.ready;
  }

  // -----------------------------------------------------------------------
  // start() — spawns the gateway process, begins readiness polling in the
  // background, and returns IMMEDIATELY.  It does NOT wait for the gateway
  // to become ready.  Callers that need to know when it's ready should
  // poll getStatus() or call waitUntilReady().
  // -----------------------------------------------------------------------
  async start() {
    if (!this.isConfigured()) {
      throw new GatewayError("Gateway cannot start: not configured", "NOT_CONFIGURED");
    }

    if (this.isRunning()) {
      return { ok: true, pid: this.process.pid, ready: this.ready };
    }

    // If a start is already in-flight, return that promise.
    if (this.starting) {
      return this.starting;
    }

    this.starting = this._doStart();
    try {
      return await this.starting;
    } finally {
      this.starting = null;
    }
  }

  async _doStart() {
    console.log("[GatewayManager] Spawning gateway process...");
    this.ready = false;
    this.lastError = null;
    this.startedAt = Date.now();
    this._output = [];

    this.config.createDirectories();

    const args = [
      "gateway",
      "run",
      "--bind",
      "loopback",
      "--port",
      String(this.config.internalPort),
      "--auth",
      "token",
      "--token",
      this.config.gatewayToken,
    ];

    console.log(`[GatewayManager] Cmd: ${this.config.openclawNode} ${this.config.openclawEntry} gateway run --bind loopback --port ${this.config.internalPort}`);

    this.process = childProcess.spawn(
      this.config.openclawNode,
      [this.config.openclawEntry, ...args],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          OPENCLAW_STATE_DIR: this.config.stateDir,
          OPENCLAW_WORKSPACE_DIR: this.config.workspaceDir,
          CLAWDBOT_STATE_DIR: this.config.stateDir,
          CLAWDBOT_WORKSPACE_DIR: this.config.workspaceDir,
        },
      }
    );

    const pid = this.process.pid;
    console.log(`[GatewayManager] Process spawned, PID: ${pid}`);

    // Capture output
    this.process.stdout?.on("data", (data) => {
      const line = data.toString().trim();
      if (line) {
        console.log(`[gateway:stdout] ${line}`);
        this._pushOutput(line);
      }
    });

    this.process.stderr?.on("data", (data) => {
      const line = data.toString().trim();
      if (line) {
        console.error(`[gateway:stderr] ${line}`);
        this._pushOutput(line);
      }
    });

    // Handle unexpected exit — auto-restart with backoff.
    this.process.once("exit", (code, signal) => {
      console.warn(`[GatewayManager] Gateway exited: code=${code} signal=${signal}`);
      this.process = null;
      this.ready = false;

      if (code !== 0 || signal) {
        this.consecutiveFailures++;
        this.lastError = `Exited code=${code} signal=${signal}`;

        // Auto-restart with exponential backoff (max ~60s)
        const delay = Math.min(2000 * Math.pow(2, this.consecutiveFailures - 1), 60000);
        console.log(`[GatewayManager] Will auto-restart in ${delay}ms (failure #${this.consecutiveFailures})`);

        if (this.consecutiveFailures <= 8) {
          setTimeout(() => {
            if (!this.isRunning() && this.isConfigured()) {
              this.start().catch((err) =>
                console.error("[GatewayManager] Auto-restart failed:", err)
              );
            }
          }, delay);
        } else {
          console.error("[GatewayManager] Too many consecutive failures — giving up. Use /setup to restart manually.");
        }
      }
    });

    // Start readiness polling in the background (fire-and-forget).
    this._pollReadiness().catch((err) =>
      console.error("[GatewayManager] Readiness polling error:", err)
    );

    return { ok: true, pid, ready: false };
  }

  // -----------------------------------------------------------------------
  // Background readiness polling — checks the gateway HTTP port with exponential backoff
  // up to 3 minutes. Sets this.ready = true once it responds.
  // -----------------------------------------------------------------------
  async _pollReadiness() {
    const maxWaitMs = 180_000; // 3 minutes — generous for Railway cold starts
    const startTime = Date.now();
    const checkPaths = ["/", "/openclaw"];
    let pollDelayMs = 100; // Start with 100ms

    console.log(`[GatewayManager] Polling for readiness (up to ${maxWaitMs / 1000}s)...`);

    while (Date.now() - startTime < maxWaitMs) {
      if (!this.isRunning()) {
        console.warn("[GatewayManager] Process died during readiness polling.");
        return;
      }

      for (const p of checkPaths) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(`${this.config.gatewayTarget}${p}`, {
            method: "GET",
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (res) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[GatewayManager] ✓ Gateway ready at ${p} after ${elapsed}s`);
            this.ready = true;
            this.consecutiveFailures = 0;
            return;
          }
        } catch {
          // expected while starting up
        }
      }

      // Exponential backoff: 100ms → 200ms → 400ms → 800ms → 5s (cap)
      pollDelayMs = Math.min(pollDelayMs * 1.5, 5000);
      await this.sleep(Math.round(pollDelayMs));
    }

    console.error("[GatewayManager] Gateway did not become ready within 3 minutes.");
    this.lastError = "Startup readiness timeout (3 min)";
  }

  // -----------------------------------------------------------------------
  // waitUntilReady() — optional blocking wait (used only where we truly
  // need to wait, e.g., WebSocket upgrades).  Most HTTP requests should
  // NOT call this — they should show the waiting page instead.
  // -----------------------------------------------------------------------
  async waitUntilReady(timeoutMs = 90_000) {
    if (this.isReady()) return true;

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (this.isReady()) return true;
      if (!this.isRunning() && !this.starting) return false;
      await this.sleep(500);
    }
    return this.isReady();
  }

  async _healthCheck() {
    if (!this.isRunning()) return false;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${this.config.gatewayTarget}/`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timer);
      return Boolean(res);
    } catch {
      return false;
    }
  }

  async stop() {
    console.log("[GatewayManager] Stopping gateway...");
    this.ready = false;

    if (this.process) {
      try {
        this.process.kill("SIGTERM");

        // Wait up to 5s for graceful exit
        await Promise.race([
          new Promise((resolve) => this.process?.once("exit", resolve)),
          this.sleep(5000),
        ]);

        if (this.process && !this.process.killed) {
          console.warn("[GatewayManager] Force killing gateway process");
          this.process.kill("SIGKILL");
        }
      } catch (err) {
        console.error("[GatewayManager] Error stopping gateway:", err);
      }
      this.process = null;
    }

    console.log("[GatewayManager] Gateway stopped");
  }

  async restart() {
    console.log("[GatewayManager] Restarting gateway...");
    await this.stop();
    await this.sleep(500);
    return this.start();
  }

  // -----------------------------------------------------------------------
  // ensureRunning() — start the gateway if it's not running.  Returns
  // IMMEDIATELY; does NOT wait for readiness.
  // -----------------------------------------------------------------------
  async ensureRunning() {
    if (!this.isConfigured()) {
      return { ok: false, reason: "not configured" };
    }

    if (this.isRunning()) {
      return { ok: true, pid: this.process.pid, ready: this.ready };
    }

    if (this.starting) {
      return { ok: true, ready: false, reason: "start in progress" };
    }

    return this.start();
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      running: this.isRunning(),
      ready: this.ready,
      pid: this.process?.pid ?? null,
      starting: this.starting !== null,
      uptime: this.startedAt ? Math.round((Date.now() - this.startedAt) / 1000) : null,
      consecutiveFailures: this.consecutiveFailures,
      lastError: this.lastError,
      recentOutput: this._output.slice(-20),
    };
  }

  _pushOutput(line) {
    this._output.push(line);
    if (this._output.length > this._maxOutputLines) {
      this._output = this._output.slice(-this._maxOutputLines);
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
