import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Chess, Square, PieceSymbol, Color } from "chess.js";
import StockfishEngine from "../utils/stockfishEngine";
import { config } from "../config";
import PageLinks from "../components/PageLinks";
import { useDocumentMeta } from "../utils/useDocumentMeta";
import "./Play.css";

// Piece SVG components matching chess.com style with custom colors
const PIECES: Record<string, string> = {
  // White pieces (light cream color)
  wK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.63V6M20 8h5"/><path fill="#fff" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#fff" d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7"/><path d="M12.5 30c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0"/></g></svg>`,
  wQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L14 11v14L7 14l2 12z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/></g></svg>`,
  wR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M31 17v12.5H14V17"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path fill="none" stroke-linejoin="miter" d="M11 14h23"/></g></svg>`,
  wB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>`,
  wN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#fff" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#fff" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><path fill="#000" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z"/></g></svg>`,
  wP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></svg>`,
  // Black pieces (dark purple color matching theme)
  bK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.63V6" stroke="#c2a4ff"/><path fill="#1a1a2e" stroke="#c2a4ff" d="M20 8h5"/><path fill="#1a1a2e" stroke="#c2a4ff" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#1a1a2e" stroke="#c2a4ff" d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7"/><path stroke="#c2a4ff" d="M12.5 30c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0"/></g></svg>`,
  bQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#c2a4ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#1a1a2e"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path fill="#1a1a2e" stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z"/><path fill="#1a1a2e" stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" stroke-linecap="butt" d="M11 38.5a35 35 1 0 0 23 0"/><path fill="none" d="M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0"/></g></svg>`,
  bR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#c2a4ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#1a1a2e" stroke-linecap="butt" d="M9 39h27v-3H9v3zm3.5-7l1.5-2.5h17l1.5 2.5h-20zm-.5 4v-4h21v4H12z"/><path fill="#1a1a2e" stroke-linecap="butt" stroke-linejoin="miter" d="M14 29.5v-13h17v13H14z"/><path fill="#1a1a2e" stroke-linecap="butt" d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z"/><path fill="none" stroke-linejoin="miter" d="M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23"/></g></svg>`,
  bB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#c2a4ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#1a1a2e" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>`,
  bN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#c2a4ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#1a1a2e" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#1a1a2e" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><path fill="#c2a4ff" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z"/></g></svg>`,
  bP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path fill="#1a1a2e" stroke="#c2a4ff" stroke-width="1.5" stroke-linecap="round" d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></svg>`,
};

interface MoveHistory {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  san: string;
}

/** Spoken piece names, for the square labels the board announces. */
const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/* The grounding prompt is built server-side, in api/chat.ts. It is ~11,400
   characters, which is both larger than the endpoint's per-message limit — so
   sending it from here failed every request with HTTP 400 — and pointless
   weight in a bundle every visitor downloads. See src/utils/systemPrompt.ts. */

const Play = () => {
  useDocumentMeta(
    `Chess & AI assistant — ${config.developer.fullName}`,
    `Play Stockfish in the browser, or ask a language model about ${config.developer.fullName}'s projects, experience and certifications.`
  );
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [gameStatus, setGameStatus] = useState<string>("");
  const [playerColor] = useState<Color>("w");
  const [engineThinking, setEngineThinking] = useState(false);
  const [engineFailed, setEngineFailed] = useState(false);
  /* Which square holds the board's single tab stop. e2 rather than a1 so the
     first arrow press starts somewhere a game actually begins. */
  const [focusedSquare, setFocusedSquare] = useState<Square>("e2");
  const engineRef = useRef<StockfishEngine | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: config.play.chatGreeting }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const files = boardFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = boardFlipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];

  const updateGameStatus = useCallback((g: Chess) => {
    if (g.isCheckmate()) {
      setGameStatus(g.turn() === 'w' ? 'Checkmate! Black wins!' : 'Checkmate! White wins!');
    } else if (g.isDraw()) {
      if (g.isStalemate()) setGameStatus('Draw by stalemate');
      else if (g.isThreefoldRepetition()) setGameStatus('Draw by repetition');
      else if (g.isInsufficientMaterial()) setGameStatus('Draw by insufficient material');
      else setGameStatus('Draw');
    } else if (g.isCheck()) {
      setGameStatus(g.turn() === 'w' ? 'White is in check!' : 'Black is in check!');
    } else {
      setGameStatus(g.turn() === 'w' ? "White's turn" : "Black's turn");
    }
  }, []);

  useEffect(() => {
    updateGameStatus(game);
  }, [game, updateGameStatus]);

  /* Moves the DOM focus to follow the roving tabindex. Guarded on focus already
     being inside the board so that mounting the page, or the engine replying,
     never yanks focus away from wherever the visitor actually is — including
     the chat input alongside it. */
  useEffect(() => {
    const board = boardRef.current;
    if (!board || !board.contains(document.activeElement)) return;
    board
      .querySelector<HTMLElement>(`[data-square="${focusedSquare}"]`)
      ?.focus();
  }, [focusedSquare]);

  useEffect(() => {
    const engine = new StockfishEngine();
    engineRef.current = engine;
    /* A failed wasm load used to leave the board waiting on a move that never
       came. Fail loudly instead so the status line can say what happened. */
    engine.init().catch((error) => {
      console.error("Chess engine failed to start:", error);
      engineRef.current = null;
      setEngineFailed(true);
      setEngineThinking(false);
    });
    return () => {
      engine.quit();
    };
  }, []);

  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver() && engineRef.current) {
      setEngineThinking(true);
      engineRef.current.setPosition(game.fen());
      engineRef.current.getBestMove((move) => {
        const from = move.substring(0, 2) as Square;
        const to = move.substring(2, 4) as Square;
        makeMove(from, to);
        setEngineThinking(false);
      }, config.play.searchDepth);
    }
  }, [game]);

  const getPieceAt = (square: Square): { type: PieceSymbol; color: Color } | null => {
    return game.get(square) || null;
  };

  const handleSquareClick = (square: Square) => {
    if (engineThinking || game.turn() !== 'w') return;
    const piece = getPieceAt(square);

    // If a piece is already selected
    if (selectedSquare) {
      // Try to make a move
      if (possibleMoves.includes(square)) {
        makeMove(selectedSquare, square);
      } else if (piece && piece.color === game.turn()) {
        // Select a different piece of the same color
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setPossibleMoves(moves.map(m => m.to as Square));
      } else {
        // Deselect
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else {
      // Select a piece if it's the current player's turn
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setPossibleMoves(moves.map(m => m.to as Square));
      }
    }
  };

  const makeMove = (from: Square, to: Square) => {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from, to, promotion: 'q' }); // Auto-promote to queen

      if (move) {
        // Update captured pieces
        if (move.captured) {
          if (move.color === 'w') {
            setCapturedBlack(prev => [...prev, move.captured!]);
          } else {
            setCapturedWhite(prev => [...prev, move.captured!]);
          }
        }

        // Update move history
        setMoveHistory(prev => [...prev, {
          from: move.from,
          to: move.to,
          piece: move.piece,
          captured: move.captured,
          san: move.san
        }]);

        setLastMove({ from: from, to: to });
        setGame(gameCopy);
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } catch {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setLastMove(null);
    setGameStatus("White's turn");
    setBoardFlipped(false);
  };

  const flipBoard = () => {
    // If game is in progress, ask to start new game
    if (moveHistory.length > 0) {
      if (window.confirm('Start new game?')) {
        resetGame();
        setBoardFlipped(!boardFlipped);
      }
      return;
    }
    setBoardFlipped(!boardFlipped);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      const messages = [
        ...chatMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user', content: chatInput }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
        }),
      });

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.choices[0].message.content
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        /* The server tells us when it has no key configured, which is the
           common case on a fork — pass that through rather than blaming
           the network. */
        throw new Error(data.error?.message || data.error || 'Invalid response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const detail =
        error instanceof Error && error.message !== 'Invalid response'
          ? ` (${error.message})`
          : '';
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `The assistant is unreachable right now${detail}. Everything it would tell you is on this site, and ${config.contact.email} always works.`
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderPiece = (piece: { type: PieceSymbol; color: Color } | null) => {
    if (!piece) return null;
    const key = `${piece.color}${piece.type.toUpperCase()}`;
    const svg = PIECES[key];
    if (!svg) return null;
    /* aria-hidden because the square's own aria-label names the piece. Without
       it a screen reader reached an unlabelled graphic and announced nothing at
       all — the whole board was silent. */
    return (
      <div
        className="chess-piece"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  };

  /* Spoken square names. "e4, empty" or "e4, white knight", plus whatever is
     true of it right now, so a keyboard user arrowing across the board hears
     the same things a sighted player reads off the highlights. */
  const describeSquare = (
    square: Square,
    piece: { type: PieceSymbol; color: Color } | null
  ): string => {
    /* Annotated: inferred from its one element this would be Square[], and
       every descriptive fragment pushed below would be a type error. */
    const parts: string[] = [square];
    parts.push(
      piece
        ? `${piece.color === "w" ? "white" : "black"} ${PIECE_NAMES[piece.type]}`
        : "empty"
    );
    if (selectedSquare === square) parts.push("selected");
    if (possibleMoves.includes(square)) {
      parts.push(piece ? "can capture here" : "can move here");
    }
    if (lastMove && (lastMove.from === square || lastMove.to === square)) {
      parts.push("last move");
    }
    if (game.isCheck() && piece?.type === "k" && piece.color === game.turn()) {
      parts.push("in check");
    }
    return parts.join(", ");
  };

  /* One tab stop for the whole board, then arrow keys inside it — the roving
     tabindex pattern. Sixty-four separate tab stops would technically satisfy
     "keyboard reachable" while making the board unusable to get past. */
  const moveFocus = (from: Square, dFile: number, dRank: number) => {
    const fileIndex = files.indexOf(from[0]);
    const rankIndex = ranks.indexOf(from[1]);
    if (fileIndex === -1 || rankIndex === -1) return;
    const nextFile = files[fileIndex + dFile];
    const nextRank = ranks[rankIndex + dRank];
    if (!nextFile || !nextRank) return;
    setFocusedSquare(`${nextFile}${nextRank}` as Square);
  };

  const handleSquareKeyDown = (e: React.KeyboardEvent, square: Square) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveFocus(square, 1, 0);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(square, -1, 0);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(square, 0, 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(square, 0, -1);
        break;
      case "Home":
        e.preventDefault();
        setFocusedSquare(`${files[0]}${square[1]}` as Square);
        break;
      case "End":
        e.preventDefault();
        setFocusedSquare(`${files[7]}${square[1]}` as Square);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        handleSquareClick(square);
        break;
      case "Escape":
        if (selectedSquare) {
          e.preventDefault();
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
        break;
    }
  };

  const isSquareLight = (file: string, rank: string): boolean => {
    const fileIndex = 'abcdefgh'.indexOf(file);
    const rankIndex = parseInt(rank) - 1;
    return (fileIndex + rankIndex) % 2 === 1;
  };

  const renderCapturedPieces = (pieces: string[], color: Color) => {
    return pieces.map((piece, index) => {
      const key = `${color}${piece.toUpperCase()}`;
      const svg = PIECES[key];
      return (
        <div key={index} className="captured-piece" dangerouslySetInnerHTML={{ __html: svg || '' }} />
      );
    });
  };

  const formatMoveHistory = () => {
    const formatted: { moveNum: number; white: string; black: string }[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      formatted.push({
        moveNum: Math.floor(i / 2) + 1,
        white: moveHistory[i]?.san || '',
        black: moveHistory[i + 1]?.san || ''
      });
    }
    return formatted;
  };

  return (
    <main className="play-page">
      {/* The page had no heading of any level, so its outline was empty and a
          screen reader's heading list offered nothing to jump to. Visually the
          board and the chat panel are self-evident, so the h1 is for assistive
          tech only. */}
      <h1 className="sr-only">
        Play chess against Stockfish, and ask an AI assistant about Saransh
        Singh&apos;s work
      </h1>
      {/* Header */}
      <div className="play-header">
        <Link to="/" className="back-button" data-cursor="disable">
          ← Back to Home
        </Link>
        <PageLinks />
      </div>

      <div className="chess-container">
        {/* Chat Panel - Left Side */}
        <div className="chat-panel">
          <div className="chat-header">
            <h2 className="chat-title">Ask about my work</h2>
            {/* Said up front: this is a language model, not me typing. */}
            <span className="chat-subtitle">
              AI assistant · answers can be wrong
            </span>
          </div>
          {/* aria-live so a reply is announced when it arrives. The transcript
              updates asynchronously; without this a screen reader user got
              silence and no way to know an answer had landed. */}
          <div
            className="chat-messages"
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message assistant">
                <div className="message-content typing">
                  <span></span><span></span><span></span>
                </div>
                <span className="sr-only">Thinking…</span>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <label className="sr-only" htmlFor="chat-input">
              Ask a question about Saransh&apos;s work
            </label>
            <input
              id="chat-input"
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyPress}
              data-cursor="disable"
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              aria-label="Send message"
              data-cursor="disable"
            >
              <span aria-hidden="true">➤</span>
            </button>
          </div>
        </div>

        {/* Board Section with Player Labels */}
        <div className="chess-board-section">
          {/* Opponent Info - Top of Board */}
          <div className="player-bar opponent-bar">
            <div className="player-info">
              <div className="player-avatar" aria-hidden="true">
                <span>♞</span>
              </div>
              <div className="player-details">
                <span className="player-name">{config.play.engineName}</span>
                {/* Search depth, not an ELO. The template advertised a 3640
                    rating it had no way to measure. Announced live: "Thinking…"
                    is the only signal that the engine has the move. */}
                <span className="player-rating" role="status" aria-live="polite">
                  {engineFailed
                    ? "Unavailable"
                    : engineThinking
                    ? "Thinking…"
                    : `Search depth ${config.play.searchDepth}`}
                </span>
              </div>
            </div>
            <div className="captured-pieces" aria-hidden="true">
              {renderCapturedPieces(capturedWhite, 'w')}
            </div>
          </div>

          {/* Chess Board */}
          <div className="chess-board-wrapper">
            <div
              className="chess-board"
              role="grid"
              aria-label="Chess board. Arrow keys to move, Enter to select or move a piece, Escape to deselect."
              ref={boardRef}
            >
              {ranks.map((rank) => (
                /* display: contents, so the eight squares stay direct children
                   of the CSS grid while ARIA still sees eight rows. */
                <div className="chess-row" role="row" key={rank}>
                  {files.map((file) => {
                  const square = `${file}${rank}` as Square;
                  const piece = getPieceAt(square);
                  const isLight = isSquareLight(file, rank);
                  const isSelected = selectedSquare === square;
                  const isPossibleMove = possibleMoves.includes(square);
                  const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
                  const isCheck = game.isCheck() && piece?.type === 'k' && piece?.color === game.turn();

                  return (
                    <div
                      key={square}
                      role="gridcell"
                      data-square={square}
                      tabIndex={focusedSquare === square ? 0 : -1}
                      aria-label={describeSquare(square, piece)}
                      aria-selected={isSelected}
                      onFocus={() => setFocusedSquare(square)}
                      onKeyDown={(e) => handleSquareKeyDown(e, square)}
                      className={`chess-square ${isLight ? 'light' : 'dark'}
                        ${isSelected ? 'selected' : ''}
                        ${isLastMoveSquare ? 'last-move' : ''}
                        ${isCheck ? 'in-check' : ''}`}
                      onClick={() => handleSquareClick(square)}
                      data-cursor="disable"
                    >
                      {/* Coordinate labels. aria-hidden because every square's
                          own label already begins with its coordinate. */}
                      {file === (boardFlipped ? 'h' : 'a') && (
                        <span className="coord-rank" aria-hidden="true">{rank}</span>
                      )}
                      {rank === (boardFlipped ? '8' : '1') && (
                        <span className="coord-file" aria-hidden="true">{file}</span>
                      )}

                      {/* Piece */}
                      {renderPiece(piece)}

                      {/* Possible move indicator */}
                      {isPossibleMove && (
                        <div className={`move-indicator ${piece ? 'capture' : ''}`} />
                      )}
                    </div>
                  );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Player Info - Bottom of Board */}
          <div className="player-bar player-bar-bottom">
            <div className="player-info">
              <div className="player-avatar" aria-hidden="true">
                <span>👤</span>
              </div>
              <div className="player-details">
                <span className="player-name">You</span>
                <span className="player-rating">{playerColor === 'w' ? 'White' : 'Black'}</span>
              </div>
            </div>
            <div className="captured-pieces" aria-hidden="true">
              {renderCapturedPieces(capturedBlack, 'b')}
            </div>
          </div>
        </div>

        {/* Right Panel - Controls & Move History */}
        <div className="chess-side-panel right-panel">
          {/* Game Status. aria-live because this line is the only place a
              checkmate, a draw or a check is ever stated, and it changed
              silently after every move. */}
          <div className="game-status" role="status" aria-live="polite">
            <span className={game.isCheck() ? 'check' : ''}>
              {engineFailed
                ? "Engine failed to load — try a reload"
                : gameStatus}
            </span>
          </div>

          {/* Move History */}
          <div className="move-history">
            <h2 className="move-history-header">Moves</h2>
            <div className="move-history-list">
              {formatMoveHistory().map((move, index) => (
                <div key={index} className="move-row">
                  <span className="move-num">{move.moveNum}.</span>
                  <span className="move-white">{move.white}</span>
                  <span className="move-black">{move.black}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="game-controls">
            <button onClick={resetGame} className="control-btn" data-cursor="disable">
              New Game
            </button>
            <button onClick={flipBoard} className="control-btn" data-cursor="disable">
              Flip Board
            </button>
          </div>

          {/* Attribution. The engine is not mine and the licence requires
              saying so — this is not optional decoration. */}
          <div className="engine-credit">
            <p>
              You are playing{" "}
              <a
                href={config.play.engineUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="disable"
              >
                {config.play.engineName}
              </a>{" "}
              — copyright T. Romstad, M. Costalba, J. Kiiski, G. Linscott and
              contributors, compiled to WebAssembly by Niklas Fiekas, licensed
              under the{" "}
              <a
                href={config.play.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="disable"
              >
                GNU GPL v3
              </a>{" "}
              (
              <a
                href="/stockfish-COPYING.txt"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="disable"
              >
                full text
              </a>
              ). It is not my work — I only wired it to the board.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Play;
