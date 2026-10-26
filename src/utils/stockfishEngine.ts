/**
 * Thin UCI wrapper around Stockfish.
 *
 * The engine is Stockfish 10 (GNU GPL v3), compiled to WebAssembly and asm.js
 * by Niklas Fiekas — it is not my work. The three files in public/ are verbatim
 * copies of the `stockfish.js` npm package, kept there rather than imported
 * because they run in a Worker and Emscripten resolves `stockfish.wasm`
 * relative to the worker script's own URL, so the pair must sit together at a
 * fixed path. The full licence text ships as public/stockfish-COPYING.txt.
 *
 * The template this site was built on shipped these renamed to `redoxchess.*`
 * and advertised the result as an original 3640-ELO engine. The names are back.
 */

/* The wasm build is ~96 KB of glue plus a 546 KB module and searches far
   faster; the asm.js build is a 1.5 MB single file for browsers without
   WebAssembly. This is the feature test the package's own README uses. */
const wasmSupported = () =>
  typeof WebAssembly === "object" &&
  typeof WebAssembly.validate === "function" &&
  WebAssembly.validate(
    Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
  );

class StockfishEngine {
  private engine: Worker | null = null;
  private onMoveCallback: ((move: string) => void) | null = null;
  private _isReady = false;

  get isReady() {
    return this._isReady;
  }

  async init() {
    return new Promise<void>((resolve, reject) => {
      try {
        this.engine = new Worker(
          wasmSupported() ? "/stockfish.wasm.js" : "/stockfish.js"
        );
      } catch (error) {
        reject(error);
        return;
      }

      /* Without this the page could wait forever on an engine that never
         loaded, which is how the board used to freeze silently. */
      this.engine.onerror = (event) => {
        reject(new Error(event.message || "Chess engine failed to load"));
      };

      this.engine.onmessage = (event) => {
        const message = event.data;
        // Emscripten can post non-string diagnostics; ignore those.
        if (typeof message !== "string") return;

        if (message === "readyok") {
          this._isReady = true;
          resolve();
        } else if (message.startsWith("bestmove")) {
          const move = message.split(" ")[1];
          if (move && this.onMoveCallback) {
            this.onMoveCallback(move);
          }
        }
      };

      this.send("uci");
      this.send("isready");
    });
  }

  private send(command: string) {
    if (this.engine) {
      this.engine.postMessage(command);
    }
  }

  setPosition(fen: string) {
    this.send(`position fen ${fen}`);
  }

  getBestMove(onMove: (move: string) => void, depth = 15) {
    this.onMoveCallback = onMove;
    this.send(`go depth ${depth}`);
  }

  stop() {
    this.send("stop");
  }

  quit() {
    if (this.engine) {
      this.send("quit");
      this.engine.terminate();
      this.engine = null;
      this._isReady = false;
    }
  }
}

export default StockfishEngine;
