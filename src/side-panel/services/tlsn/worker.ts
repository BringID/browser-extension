// @ts-nocheck
import * as Comlink from 'comlink';
import init, { Prover, Presentation } from 'tlsn-js';
import { TConnectionQuality } from '../../../common/types';

/**
 * WebSocket Traffic Monitor for TLSN with Progress Tracking
 *
 * This script intercepts and monitors all WebSocket connections,
 * tracking the amount of data sent and received, number of messages,
 * connection lifecycle events, and provides real-time progress estimation.
 *
 * Place this code at the very beginning of your 617.js file
 * (or any other file where WebSocket connections are created)
 */

export type WsMonitorConfig = {
    // How often to log message count updates (every N messages)
    logEveryNMessages: number
    // Enable verbose logging for debugging
    verbose: boolean
    // Prefix for all log messages
    logPrefix: string
    // Enable data size tracking
    trackSize: boolean
    // Expected total data transfer (based on your observed patterns)
    expectedTotalBytes: number
    // Enable progress monitoring
    enableProgress: boolean
    // Progress update interval (milliseconds)
    progressUpdateInterval: number
}

self.onmessage = (event) => {
    if (event.data.action === 'initWsMonitor') {
        initWsMonitor();
    } else if (event.data.action === 'setWsMonitorConfig') {
        let cfg: WsMonitorConfig = event.data.config;
        CONFIG.LOG_EVERY_N_MESSAGES = cfg.logEveryNMessages;
        CONFIG.VERBOSE = cfg.verbose;
        CONFIG.LOG_PREFIX = cfg.logPrefix;
        CONFIG.TRACK_SIZE = cfg.trackSize;
        CONFIG.EXPECTED_TOTAL_BYTES = cfg.expectedTotalBytes;
        CONFIG.ENABLE_PROGRESS = cfg.enableProgress;
        CONFIG.PROGRESS_UPDATE_INTERVAL = cfg.progressUpdateInterval;
        console.log('CONFIG is set to:', CONFIG);
    }
};

const CONFIG: WsMonitorConfig = {
    LOG_EVERY_N_MESSAGES: 100,
    VERBOSE: true,
    LOG_PREFIX: "[WS Monitor]",
    TRACK_SIZE: true,
    EXPECTED_TOTAL_BYTES: 50170000, // ~50MB (46.71 + 3.46 MB)
    ENABLE_PROGRESS: true,
    PROGRESS_UPDATE_INTERVAL: 500
};

function initWsMonitor() {
    'use strict';

    // ============================
    // MinimalProgressMonitor Class
    // ============================

    class MinimalProgressMonitor {
        constructor() {
            this.TOTAL_BYTES = CONFIG.EXPECTED_TOTAL_BYTES;
            this.history = [];
            this.startTime = Date.now();
            this.progressCallbacks = [];
            this.lastProgressUpdate = 0;
        }

        update(bytesSent, bytesReceived) {
            const now = Date.now();
            const totalBytes = bytesSent + bytesReceived;
            const elapsedSeconds = (now - this.startTime) / 1000;

            // Avoid division by zero
            if (elapsedSeconds === 0) return null;

            // Simple average throughput from start
            const overallThroughput = totalBytes / elapsedSeconds;

            // Keep last 5 throughput calculations
            this.history.push(overallThroughput);
            if (this.history.length > 5) this.history.shift();

            // Use average of recent history
            const avgThroughput = this.history.reduce((a, b) => a + b) / this.history.length;

            const progress = (totalBytes / this.TOTAL_BYTES) * 100;
            const remainingBytes = this.TOTAL_BYTES - totalBytes;
            const etaSeconds = remainingBytes / avgThroughput;

            // Determine network quality based on throughput
            let quality: TConnectionQuality = 'poor';
            const throughputKBps = avgThroughput / 1024;
            if (throughputKBps >= 1000) quality = 'excellent';
            else if (throughputKBps >= 500) quality = 'good';
            else if (throughputKBps >= 200) quality = 'fair';

            const status = {
                progress: Math.min(100, parseFloat(progress.toFixed(1))),
                eta: etaSeconds < 60 ? `${Math.round(etaSeconds)}s` : `${Math.floor(etaSeconds/60)}m ${Math.round(etaSeconds%60)}s`,
                etaSeconds: etaSeconds,
                speed: `${(avgThroughput / 1024).toFixed(0)} KB/s`,
                throughput: avgThroughput,
                quality: quality,
                totalBytes: totalBytes,
                remainingBytes: remainingBytes,
                elapsedSeconds: elapsedSeconds
            };

            // Trigger callbacks
            this.progressCallbacks.forEach(cb => cb(status));

            return status;
        }

        onProgress(callback) {
            this.progressCallbacks.push(callback);
        }

        reset() {
            this.history = [];
            this.startTime = Date.now();
            this.lastProgressUpdate = 0;
        }
    }

    // ============================
    // Global Statistics
    // ============================

    const stats = {
        // Counter for WebSocket connection IDs
        connectionCounter: 0,

        // Total number of messages across all connections
        totalMessages: 0,

        // Total bytes sent across all connections
        totalBytesSent: 0,

        // Total bytes received across all connections
        totalBytesReceived: 0,

        // Map to store per-connection statistics
        connections: new Map(),

        // Active connections count
        activeConnections: 0,

        // Progress monitor instance
        progressMonitor: null
    };

    // Initialize progress monitor if enabled
    if (CONFIG.ENABLE_PROGRESS) {
        stats.progressMonitor = new MinimalProgressMonitor();

        // Set up default progress logger
        stats.progressMonitor.onProgress((status) => {
            // Only log progress updates at intervals to avoid spam
            const now = Date.now();
            if (now - stats.progressMonitor.lastProgressUpdate > CONFIG.PROGRESS_UPDATE_INTERVAL) {
                stats.progressMonitor.lastProgressUpdate = now;
                globalObj.postMessage({
                    type: "data",
                    payload: status
                });
                log('log', `📊 Progress: ${status.progress.toFixed(1)}% | ETA: ${status.eta} | Speed: ${status.speed} | Quality: ${status.quality}`);
            }
        });
    }

    // ============================
    // Utility Functions
    // ============================

    /**
     * Get the global object (works in both window and worker contexts)
     */
    function getGlobalObject() {
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        if (typeof window !== 'undefined') return window;
        if (typeof global !== 'undefined') return global;
        return this;
    }

    /**
     * Format bytes into human-readable string
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted string (e.g., "1.23 MB")
     */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';

        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + units[i];
    }

    /**
     * Calculate the size of data being sent/received
     * @param {*} data - The data to measure
     * @returns {number} Size in bytes
     */
    function getDataSize(data) {
        if (data instanceof ArrayBuffer) {
            return data.byteLength;
        } else if (data instanceof Blob) {
            return data.size;
        } else if (typeof data === 'string') {
            // Create a Blob to accurately measure string size in bytes
            return new Blob([data]).size;
        } else if (data && data.buffer instanceof ArrayBuffer) {
            // Typed arrays (Uint8Array, etc.)
            return data.buffer.byteLength;
        }
        return 0;
    }

    /**
     * Log a message with the configured prefix
     * @param {string} level - Log level (log, warn, error)
     * @param {...any} args - Arguments to log
     */
    function log(level, ...args) {
        console[level](CONFIG.LOG_PREFIX, ...args);
    }

    // ============================
    // WebSocket Interception
    // ============================

    const globalObj = getGlobalObject();

    // Check if WebSocket is available
    if (typeof globalObj.WebSocket === 'undefined') {
        console.warn(CONFIG.LOG_PREFIX, 'WebSocket not available in this context');
        return;
    }

    // Store the original WebSocket constructor
    const OriginalWebSocket = globalObj.WebSocket;

    /**
     * Create a monitored WebSocket instance
     * @param {string} url - WebSocket URL
     * @param {string|string[]} protocols - Optional protocols
     * @returns {WebSocket} Monitored WebSocket instance
     */
    function MonitoredWebSocket(url, protocols) {
        // Increment connection counter and get ID for this connection
        const connectionId = ++stats.connectionCounter;
        const connectionStartTime = Date.now();

        // Log the new connection attempt
        log('log', `#${connectionId} Connecting to:`, url);
        if (protocols) {
            log('log', `#${connectionId} Protocols:`, protocols);
        }

        // Create the actual WebSocket instance
        const ws = protocols
          ? new OriginalWebSocket(url, protocols)
          : new OriginalWebSocket(url);

        // Initialize statistics for this connection
        const connStats = {
            id: connectionId,
            url: url,
            protocols: protocols,
            startTime: connectionStartTime,
            messagesSent: 0,
            messagesReceived: 0,
            bytesSent: 0,
            bytesReceived: 0,
            status: 'connecting',
            lastMessageTime: null
        };

        stats.connections.set(connectionId, connStats);
        stats.activeConnections++;

        // Reset progress monitor for new connection if this is the first one
        if (CONFIG.ENABLE_PROGRESS && connectionId === 1) {
            stats.progressMonitor.reset();
        }

        // ============================
        // Event Listeners
        // ============================

        /**
         * Handle WebSocket open event
         */
        ws.addEventListener('open', function(event) {
            connStats.status = 'open';
            connStats.connectedTime = Date.now();
            const connectionTime = connStats.connectedTime - connStats.startTime;

            log('log', `#${connectionId} ✓ Connected in ${connectionTime}ms`);
        });

        /**
         * Handle incoming messages
         */
        ws.addEventListener('message', function(event) {
            stats.totalMessages++;
            connStats.messagesReceived++;
            connStats.lastMessageTime = Date.now();

            // Track data size if enabled
            if (CONFIG.TRACK_SIZE) {
                const dataSize = getDataSize(event.data);
                connStats.bytesReceived += dataSize;
                stats.totalBytesReceived += dataSize;

                // Update progress monitor
                if (CONFIG.ENABLE_PROGRESS) {
                    stats.progressMonitor.update(stats.totalBytesSent, stats.totalBytesReceived);
                }

                // Log periodic updates
                if (connStats.messagesReceived % CONFIG.LOG_EVERY_N_MESSAGES === 0) {
                    log('log',
                      `#${connectionId} Progress:`,
                      `Messages: ${connStats.messagesReceived}`,
                      `| Received: ${formatBytes(connStats.bytesReceived)}`,
                      `| Last message: ${formatBytes(dataSize)}`
                    );
                }
            }
        });

        /**
         * Handle WebSocket errors
         */
        ws.addEventListener('error', function(event) {
            connStats.status = 'error';
            connStats.errorTime = Date.now();

            log('error', `#${connectionId} ✗ Connection error`);
            if (CONFIG.VERBOSE && event.message) {
                log('error', `#${connectionId} Error details:`, event.message);
            }
        });

        /**
         * Handle WebSocket close event
         */
        ws.addEventListener('close', function(event) {
            connStats.status = 'closed';
            connStats.endTime = Date.now();
            connStats.closeCode = event.code;
            connStats.closeReason = event.reason;
            stats.activeConnections--;

            const duration = (connStats.endTime - connStats.startTime) / 1000;

            log('log',
              `#${connectionId} ✗ Connection closed after ${duration.toFixed(1)}s`,
              `| Code: ${event.code}`,
              event.reason ? `| Reason: ${event.reason}` : '',
              event.wasClean ? '| Clean close' : '| Unclean close'
            );

            // Log final statistics for this connection
            if (CONFIG.TRACK_SIZE) {
                log('log',
                  `#${connectionId} Final stats:`,
                  `Sent: ${formatBytes(connStats.bytesSent)} (${connStats.messagesSent} messages)`,
                  `| Received: ${formatBytes(connStats.bytesReceived)} (${connStats.messagesReceived} messages)`
                );
            }

            // Log final progress if this was the main connection
            if (CONFIG.ENABLE_PROGRESS && connectionId === 1) {
                const finalStatus = stats.progressMonitor.update(stats.totalBytesSent, stats.totalBytesReceived);
                if (finalStatus) {
                    log('log', `📊 Final Progress: ${finalStatus.progress.toFixed(1)}% | Total time: ${Math.round(finalStatus.elapsedSeconds)}s | Avg speed: ${finalStatus.speed}`);
                }
            }
        });

        // ============================
        // Intercept send() method
        // ============================

        const originalSend = ws.send.bind(ws);

        /**
         * Monitored send method
         * @param {*} data - Data to send
         * @returns {void}
         */
        ws.send = function(data) {
            connStats.messagesSent++;
            stats.totalMessages++;

            if (CONFIG.TRACK_SIZE) {
                const dataSize = getDataSize(data);
                connStats.bytesSent += dataSize;
                stats.totalBytesSent += dataSize;

                // Update progress monitor
                if (CONFIG.ENABLE_PROGRESS) {
                    stats.progressMonitor.update(stats.totalBytesSent, stats.totalBytesReceived);
                }

                // Log periodic updates for sent messages
                if (connStats.messagesSent % CONFIG.LOG_EVERY_N_MESSAGES === 0) {
                    log('log',
                      `#${connectionId} → Sending:${connStats.messagesSent}`,
                      `Messages sent: ${connStats.messagesSent}`,
                      `| Total sent: ${formatBytes(connStats.bytesSent)}`
                    );
                }
            }

            // Call the original send method
            return originalSend(data);
        };

        // Store connection ID on the WebSocket instance for reference
        ws.__monitorId = connectionId;

        return ws;
    }

    // ============================
    // Replace global WebSocket
    // ============================

    // Copy static properties and prototype
    MonitoredWebSocket.prototype = OriginalWebSocket.prototype;
    MonitoredWebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    MonitoredWebSocket.OPEN = OriginalWebSocket.OPEN;
    MonitoredWebSocket.CLOSING = OriginalWebSocket.CLOSING;
    MonitoredWebSocket.CLOSED = OriginalWebSocket.CLOSED;

    // Replace the global WebSocket constructor
    globalObj.WebSocket = MonitoredWebSocket;

    // ============================
    // Global Statistics Function
    // ============================

    /**
     * Display current statistics for all WebSocket connections
     */
    globalObj.tlsnStats = function() {
        log('log', '=== WebSocket Statistics ===');
        log('log', `Total connections: ${stats.connectionCounter}`);
        log('log', `Active connections: ${stats.activeConnections}`);
        log('log', `Total messages: ${stats.totalMessages}`);

        if (CONFIG.TRACK_SIZE) {
            log('log', `Total sent: ${formatBytes(stats.totalBytesSent)}`);
            log('log', `Total received: ${formatBytes(stats.totalBytesReceived)}`);
        }

        // Show current progress if available
        if (CONFIG.ENABLE_PROGRESS && stats.progressMonitor) {
            const currentStatus = stats.progressMonitor.update(stats.totalBytesSent, stats.totalBytesReceived);
            if (currentStatus) {
                log('log', '\n--- Progress Status ---');
                log('log', `Progress: ${currentStatus.progress.toFixed(1)}%`);
                log('log', `ETA: ${currentStatus.eta}`);
                log('log', `Speed: ${currentStatus.speed}`);
                log('log', `Network Quality: ${currentStatus.quality}`);
            }
        }

        // Show per-connection details
        if (stats.connections.size > 0) {
            log('log', '\n--- Connection Details ---');

            stats.connections.forEach((conn) => {
                const duration = conn.endTime
                  ? ((conn.endTime - conn.startTime) / 1000).toFixed(1) + 's'
                  : conn.connectedTime
                    ? ((Date.now() - conn.startTime) / 1000).toFixed(1) + 's (active)'
                    : 'connecting...';

                log('log',
                  `#${conn.id} [${conn.status}] ${conn.url}`
                );
                log('log',
                  `  Duration: ${duration}`,
                  `| Sent: ${conn.messagesSent} msgs (${formatBytes(conn.bytesSent)})`,
                  `| Received: ${conn.messagesReceived} msgs (${formatBytes(conn.bytesReceived)})`
                );
            });
        }

        return stats;
    };

    /**
     * Clear all statistics
     */
    globalObj.tlsnClearStats = function() {
        stats.connectionCounter = 0;
        stats.totalMessages = 0;
        stats.totalBytesSent = 0;
        stats.totalBytesReceived = 0;
        stats.connections.clear();
        stats.activeConnections = 0;

        if (stats.progressMonitor) {
            stats.progressMonitor.reset();
        }

        log('log', 'Statistics cleared');
    };

    /**
     * Get current progress status
     */
    globalObj.tlsnProgress = function() {
        if (!CONFIG.ENABLE_PROGRESS || !stats.progressMonitor) {
            log('warn', 'Progress monitoring is not enabled');
            return null;
        }

        return stats.progressMonitor.update(stats.totalBytesSent, stats.totalBytesReceived);
    };

    /**
     * Register a progress callback
     */
    globalObj.tlsnOnProgress = function(callback) {
        if (!CONFIG.ENABLE_PROGRESS || !stats.progressMonitor) {
            log('warn', 'Progress monitoring is not enabled');
            return;
        }

        stats.progressMonitor.onProgress(callback);
        log('log', 'Progress callback registered');
    };

    // ============================
    // Initialization Complete
    // ============================

    log('log', 'WebSocket monitoring initialized with progress tracking');
    log('log', 'Commands available:');
    log('log', '  tlsnStats() - Show statistics');
    log('log', '  tlsnClearStats() - Clear statistics');
    log('log', '  tlsnProgress() - Get current progress status');
    log('log', '  tlsnOnProgress(callback) - Register progress callback');

}

Comlink.expose({
    init, Prover, Presentation
});