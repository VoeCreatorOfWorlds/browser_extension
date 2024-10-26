// workerManager.ts
function setupWorker(workerScript: string) {
    if (typeof Worker !== 'undefined') {
        // Check if we're in a browser extension context
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            // For browser extensions
            return new Worker(chrome.runtime.getURL(workerScript));
        } else {
            // For regular web applications
            return new Worker(new URL(workerScript, import.meta.url));
        }
    }
    throw new Error('Web Workers are not supported in this environment.');
}

class WorkerManager {
    private worker: Worker | null = null;
    private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();

    constructor(private workerScript: string) { }

    private initializeWorker() {
        if (!this.worker) {
            this.worker = setupWorker(this.workerScript);
            this.worker.onmessage = this.handleMessage.bind(this);
            this.worker.onerror = this.handleError.bind(this);
        }
    }

    private handleMessage(event: MessageEvent) {
        const handlers = this.messageHandlers.get(event.data.type);
        if (handlers) {
            handlers.forEach(handler => handler(event.data.payload));
        }
    }

    private handleError(error: ErrorEvent) {
        console.error('Worker error:', error);
        // You might want to implement more sophisticated error handling here
    }

    sendMessage(type: string, payload: any) {
        this.initializeWorker();
        this.worker?.postMessage({ type, payload });
    }

    addMessageListener(type: string, handler: (data: any) => void) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, new Set());
        }
        this.messageHandlers.get(type)!.add(handler);
    }

    removeMessageListener(type: string, handler: (data: any) => void) {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    terminate() {
        this.worker?.terminate();
        this.worker = null;
        this.messageHandlers.clear();
    }
}

export const compareCartWorker = new WorkerManager('compareCartWorker.js');