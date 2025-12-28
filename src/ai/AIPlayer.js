export default class AIPlayer {
    constructor(scene, playerNumber) {
        this.scene = scene;
        this.playerNumber = playerNumber; // 2 pentru AI
        this.opponent = playerNumber === 1 ? 2 : 1;
        this.maxDepth = 3; // Profunzimea arborelui de decizie
    }
    
    // Funcția principală care decide mutarea AI-ului
    makeMove() {
        const gamePhase = this.scene.gamePhase;
        
        if (gamePhase === 'placing') {
            return this.findBestPlacement();
        } else {
            return this.findBestMove();
        }
    }
    
    // Alege ce piesă adversă să elimine
    selectPieceToRemove() {
        const board = [...this.scene.board];
        let bestPosition = -1;
        let bestScore = -Infinity;
        
        for (let i = 0; i < 24; i++) {
            if (board[i] === this.opponent) {
                // Nu elimina piese din moară dacă există altele
                if (this.scene.isInMill(i) && this.scene.hasNonMillPieces(this.opponent)) {
                    continue;
                }
                
                // Evaluează importanța poziției
                const score = this.evaluatePositionImportance(i, board);
                if (score > bestScore) {
                    bestScore = score;
                    bestPosition = i;
                }
            }
        }
        
        return bestPosition;
    }
    
    // Găsește cea mai bună plasare în faza de placing
    findBestPlacement() {
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (let i = 0; i < 24; i++) {
            if (this.scene.board[i] === 0) {
                // Simulează plasarea
                const tempBoard = [...this.scene.board];
                tempBoard[i] = this.playerNumber;
                
                // Verifică dacă formează moară
                const formsMill = this.checkMillOnBoard(tempBoard, i, this.playerNumber);
                
                // Evaluează poziția
                let score = this.evaluateBoard(tempBoard);
                
                // Bonus pentru formarea unei mori
                if (formsMill) {
                    score += 100;
                }
                
                // Bonus pentru poziții strategice (colțuri și mijloace)
                if ([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23].includes(i)) {
                    score += 10;
                }
                
                // Verifică dacă blochează o moară potențială a adversarului
                const blocksOpponentMill = this.blocksOpponentMillPotential(i);
                if (blocksOpponentMill) {
                    score += 50;
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { position: i };
                }
            }
        }
        
        return bestMove;
    }
    
    // Găsește cea mai bună mutare în faza de moving/flying
    findBestMove() {
        let bestMove = null;
        let bestScore = -Infinity;
        
        // Aplică algoritmul Minimax cu alpha-beta pruning
        const result = this.minimax(
            [...this.scene.board],
            this.maxDepth,
            -Infinity,
            Infinity,
            true
        );
        
        return result.move;
    }
    
    // Algoritm Minimax cu alpha-beta pruning
    minimax(board, depth, alpha, beta, maximizingPlayer) {
        // Condiție de terminare
        if (depth === 0) {
            return {
                score: this.evaluateBoard(board),
                move: null
            };
        }
        
        const moves = this.getAllPossibleMoves(board, maximizingPlayer ? this.playerNumber : this.opponent);
        
        if (moves.length === 0) {
            // Nu există mutări valide
            return {
                score: maximizingPlayer ? -10000 : 10000,
                move: null
            };
        }
        
        if (maximizingPlayer) {
            let maxScore = -Infinity;
            let bestMove = null;
            
            for (let move of moves) {
                const newBoard = this.applyMove(board, move);
                const result = this.minimax(newBoard, depth - 1, alpha, beta, false);
                
                if (result.score > maxScore) {
                    maxScore = result.score;
                    bestMove = move;
                }
                
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) {
                    break; // Beta cut-off (alpha-beta pruning)
                }
            }
            
            return { score: maxScore, move: bestMove };
        } else {
            let minScore = Infinity;
            let bestMove = null;
            
            for (let move of moves) {
                const newBoard = this.applyMove(board, move);
                const result = this.minimax(newBoard, depth - 1, alpha, beta, true);
                
                if (result.score < minScore) {
                    minScore = result.score;
                    bestMove = move;
                }
                
                beta = Math.min(beta, result.score);
                if (beta <= alpha) {
                    break; // Alpha cut-off
                }
            }
            
            return { score: minScore, move: bestMove };
        }
    }
    
    // Obține toate mutările posibile pentru un jucător
    getAllPossibleMoves(board, player) {
        const moves = [];
        const piecesOnBoard = board.filter(p => p === player).length;
        const isFlying = piecesOnBoard === 3;
        
        for (let from = 0; from < 24; from++) {
            if (board[from] === player) {
                // Determină unde poate muta piesa
                const possibleDestinations = isFlying 
                    ? this.getAllEmptyPositions(board)
                    : this.getAdjacentEmptyPositions(board, from);
                
                for (let to of possibleDestinations) {
                    moves.push({ from, to });
                }
            }
        }
        
        return moves;
    }
    
    // Obține toate pozițiile goale
    getAllEmptyPositions(board) {
        const positions = [];
        for (let i = 0; i < 24; i++) {
            if (board[i] === 0) {
                positions.push(i);
            }
        }
        return positions;
    }
    
    // Obține pozițiile goale adiacente
    getAdjacentEmptyPositions(board, position) {
        const adjacent = [];
        
        for (let [a, b] of this.scene.connections) {
            if (a === position && board[b] === 0) {
                adjacent.push(b);
            } else if (b === position && board[a] === 0) {
                adjacent.push(a);
            }
        }
        
        return adjacent;
    }
    
    // Aplică o mutare pe tablă
    applyMove(board, move) {
        const newBoard = [...board];
        newBoard[move.to] = newBoard[move.from];
        newBoard[move.from] = 0;
        return newBoard;
    }
    
    // Evaluează starea tablei (funcție de evaluare euristică)
    evaluateBoard(board) {
        let score = 0;
        
        // 1. Numărul de piese
        const aiPieces = board.filter(p => p === this.playerNumber).length;
        const opponentPieces = board.filter(p => p === this.opponent).length;
        score += (aiPieces - opponentPieces) * 50;
        
        // 2. Numărul de mori formate
        const aiMills = this.countMills(board, this.playerNumber);
        const opponentMills = this.countMills(board, this.opponent);
        score += (aiMills - opponentMills) * 100;
        
        // 3. Mori potențiale (2 din 3 piese pe linie)
        const aiPotentialMills = this.countPotentialMills(board, this.playerNumber);
        const opponentPotentialMills = this.countPotentialMills(board, this.opponent);
        score += (aiPotentialMills - opponentPotentialMills) * 30;
        
        // 4. Mobilitate (numărul de mutări posibile)
        const aiMobility = this.getAllPossibleMoves(board, this.playerNumber).length;
        const opponentMobility = this.getAllPossibleMoves(board, this.opponent).length;
        score += (aiMobility - opponentMobility) * 10;
        
        // 5. Poziții strategice ocupate
        const strategicPositions = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
        let aiStrategic = 0;
        let opponentStrategic = 0;
        
        for (let pos of strategicPositions) {
            if (board[pos] === this.playerNumber) aiStrategic++;
            if (board[pos] === this.opponent) opponentStrategic++;
        }
        
        score += (aiStrategic - opponentStrategic) * 15;
        
        return score;
    }
    
    // Numără morile formate de un jucător
    countMills(board, player) {
        let count = 0;
        
        for (let mill of this.scene.mills) {
            if (board[mill[0]] === player && 
                board[mill[1]] === player && 
                board[mill[2]] === player) {
                count++;
            }
        }
        
        return count;
    }
    
    // Numără morile potențiale (2 din 3 piese)
    countPotentialMills(board, player) {
        let count = 0;
        
        for (let mill of this.scene.mills) {
            const pieces = [board[mill[0]], board[mill[1]], board[mill[2]]];
            const playerPieces = pieces.filter(p => p === player).length;
            const emptySpots = pieces.filter(p => p === 0).length;
            
            if (playerPieces === 2 && emptySpots === 1) {
                count++;
            }
        }
        
        return count;
    }
    
    // Verifică dacă o poziție formează moară pe o tablă dată
    checkMillOnBoard(board, position, player) {
        for (let mill of this.scene.mills) {
            if (mill.includes(position)) {
                if (board[mill[0]] === player && 
                    board[mill[1]] === player && 
                    board[mill[2]] === player) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Verifică dacă o plasare blochează o moară potențială a adversarului
    blocksOpponentMillPotential(position) {
        for (let mill of this.scene.mills) {
            if (mill.includes(position)) {
                const pieces = [
                    this.scene.board[mill[0]], 
                    this.scene.board[mill[1]], 
                    this.scene.board[mill[2]]
                ];
                const opponentPieces = pieces.filter(p => p === this.opponent).length;
                const emptySpots = pieces.filter(p => p === 0).length;
                
                // Adversarul are 2 piese și un spațiu gol
                if (opponentPieces === 2 && emptySpots === 1) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Evaluează importanța unei poziții pentru eliminare
    evaluatePositionImportance(position, board) {
        let score = 0;
        
        // Preferă să elimine piese care pot forma mori
        for (let mill of this.scene.mills) {
            if (mill.includes(position)) {
                const pieces = [board[mill[0]], board[mill[1]], board[mill[2]]];
                const opponentPieces = pieces.filter(p => p === this.opponent).length;
                
                if (opponentPieces >= 2) {
                    score += 50;
                }
            }
        }
        
        // Preferă poziții strategice
        if ([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23].includes(position)) {
            score += 20;
        }
        
        return score;
    }
}
