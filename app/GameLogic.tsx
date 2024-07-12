// GameLogic.tsx
import { useEffect, useState } from 'react';
import { ref, onValue, set } from "firebase/database";
import { database } from '../Firebase/config';

interface Card {
  value: string;
  isVisible: boolean;
}

interface Player {
  playerNumber: number;
  cards: Card[];
  totalPoints: number;
}

interface GameState {
  players: Player[];
  groundCard: Card;
  deck: string[];
  currentPlayerTurn: number;
  roundNumber: number;
  gameOver: boolean;
  screwCalled: boolean;
  screwCalledBy: number | null;
  drawnCard: Card | null;
}

const createDeck = (): string[] => {
  const deck: string[] = [];
  for (let i = 1; i <= 10; i++) {
    for (let j = 0; j < 4; j++) {
      deck.push(i.toString());
    }
  }
  deck.push(...Array(2).fill('R'), ...Array(2).fill('+20'), ...Array(4).fill('G'), '-1', ...Array(4).fill('E'), ...Array(4).fill('S'));
  return shuffle(deck);
};

const shuffle = (array: string[]): string[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const initialGameState: GameState = {
  players: [
    { playerNumber: 1, cards: [], totalPoints: 0 },
    { playerNumber: 2, cards: [], totalPoints: 0 },
    { playerNumber: 3, cards: [], totalPoints: 0 },
    { playerNumber: 4, cards: [], totalPoints: 0 },
  ],
  groundCard: { value: '', isVisible: true },
  deck: [],
  currentPlayerTurn: 1,
  roundNumber: 1,
  gameOver: false,
  screwCalled: false,
  screwCalledBy: null,
  drawnCard: null,
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  useEffect(() => {
    const gameStateRef = ref(database, 'gameState');
    onValue(gameStateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
      } else {
        initializeGame();
      }
    });
  }, []);

  const updateGameState = (newState: Partial<GameState>) => {
    const updatedState = { ...gameState, ...newState };
    set(ref(database, 'gameState'), updatedState);
  };

  const initializeGame = () => {
    const deck = createDeck();
    const players = gameState.players.map(player => ({
      ...player,
      cards: Array(4).fill(0).map(() => ({ value: deck.pop() || '', isVisible: true })),
      totalPoints: 0,
    }));
    const groundCard = { value: deck.pop() || '', isVisible: true };
    updateGameState({ players, groundCard, deck });

    setTimeout(() => {
      const updatedPlayers = players.map(player => ({
        ...player,
        cards: player.cards.map(card => ({ ...card, isVisible: false }))
      }));
      updateGameState({ players: updatedPlayers });
    }, 10000);
  };

  const drawCard = () => {
    if (gameState.screwCalled || gameState.drawnCard) return;

    const drawnCard = gameState.deck.pop() || '';
    updateGameState({ 
      drawnCard: { value: drawnCard, isVisible: true },
      deck: gameState.deck,
    });
  };

  const playCard = (action: 'keep' | 'discard', cardIndex?: number) => {
    const currentPlayer = gameState.players[gameState.currentPlayerTurn - 1];
    const drawnCard = gameState.drawnCard;

    if (!drawnCard) return;

    let updatedPlayers = [...gameState.players];
    let updatedGroundCard = gameState.groundCard;

    if (action === 'keep' && cardIndex !== undefined) {
      const discardedCard = currentPlayer.cards[cardIndex];
      updatedPlayers[gameState.currentPlayerTurn - 1].cards[cardIndex] = { value: drawnCard.value, isVisible: false };
      updatedGroundCard = { value: discardedCard.value, isVisible: true };
    } else if (action === 'discard') {
      updatedGroundCard = { value: drawnCard.value, isVisible: true };
      
      // Handle special card functions
      if (['7', '8'].includes(drawnCard.value)) {
        // Allow player to see one of their own cards
        const playerCards = updatedPlayers[gameState.currentPlayerTurn - 1].cards;
        const hiddenCardIndex = playerCards.findIndex(card => !card.isVisible);
        if (hiddenCardIndex !== -1) {
          playerCards[hiddenCardIndex].isVisible = true;
          setTimeout(() => {
            playerCards[hiddenCardIndex].isVisible = false;
            updateGameState({ players: updatedPlayers });
          }, 5000);
        }
      } else if (['9', '10'].includes(drawnCard.value)) {
        // Allow player to see one card of any other player
        // This will be handled in the UI, allowing the player to choose
      } else if (drawnCard.value === 'E') {
        // Allow player to see one card of each opponent
        updatedPlayers.forEach((player, index) => {
          if (index !== gameState.currentPlayerTurn - 1) {
            const hiddenCardIndex = player.cards.findIndex(card => !card.isVisible);
            if (hiddenCardIndex !== -1) {
              player.cards[hiddenCardIndex].isVisible = true;
              setTimeout(() => {
                player.cards[hiddenCardIndex].isVisible = false;
                updateGameState({ players: updatedPlayers });
              }, 5000);
            }
          }
        });
      } else if (drawnCard.value === 'S') {
        // Allow player to swap a card with any opponent
        // This will be handled in the UI, allowing the player to choose
      }
    }

    const nextPlayer = (gameState.currentPlayerTurn % gameState.players.length) + 1;
    updateGameState({ 
      players: updatedPlayers, 
      groundCard: updatedGroundCard, 
      currentPlayerTurn: nextPlayer,
      drawnCard: null,
    });
  };

  const seeCard = (playerIndex: number, cardIndex: number) => {
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex].cards[cardIndex].isVisible = true;
    updateGameState({ players: updatedPlayers });

    setTimeout(() => {
      updatedPlayers[playerIndex].cards[cardIndex].isVisible = false;
      updateGameState({ players: updatedPlayers });
    }, 5000);
  };

  const swapCards = (playerIndex: number, cardIndex: number, targetPlayerIndex: number, targetCardIndex: number) => {
    const updatedPlayers = [...gameState.players];
    const temp = updatedPlayers[playerIndex].cards[cardIndex];
    updatedPlayers[playerIndex].cards[cardIndex] = updatedPlayers[targetPlayerIndex].cards[targetCardIndex];
    updatedPlayers[targetPlayerIndex].cards[targetCardIndex] = temp;
    updateGameState({ players: updatedPlayers });
  };

  const callScrew = () => {
    if (gameState.screwCalled) return;
    updateGameState({ screwCalled: true, screwCalledBy: gameState.currentPlayerTurn });
  };

  const endRound = () => {
    let updatedPlayers = gameState.players.map(player => ({
      ...player,
      cards: player.cards.map(card => ({ ...card, isVisible: true }))
    }));

    const screwCaller = gameState.screwCalledBy ? updatedPlayers[gameState.screwCalledBy - 1] : null;
    const scores = updatedPlayers.map(player => 
      player.cards.reduce((sum, card) => {
        if (card.value === 'R') return sum + 20;
        if (card.value === '+20') return sum + 20;
        if (card.value === 'G') return sum;
        if (card.value === '-1') return sum - 1;
        if (card.value === 'E' || card.value === 'S') return sum + 15;
        return sum + parseInt(card.value);
      }, 0)
    );
    const lowestScore = Math.min(...scores);

    updatedPlayers = updatedPlayers.map((player, index) => {
      let pointsToAdd = scores[index];
      if (player === screwCaller && pointsToAdd !== lowestScore) {
        pointsToAdd *= 2;
      }
      return {
        ...player,
        totalPoints: player.totalPoints + pointsToAdd,
        cards: []
      };
    });

    if (gameState.roundNumber === 5) {
      updateGameState({ 
        players: updatedPlayers,
        gameOver: true
      });
    } else {
      updateGameState({ 
        players: updatedPlayers,
        roundNumber: gameState.roundNumber + 1,
        screwCalled: false,
        screwCalledBy: null,
        deck: createDeck(),
        currentPlayerTurn: 1
      });
      initializeGame();
    }
  };

  const checkForWin = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerTurn - 1];
    if (currentPlayer.cards.length === 0) {
      endRound();
    }
  };

  return {
    gameState,
    drawCard,
    playCard,
    seeCard,
    swapCards,
    callScrew,
    endRound,
    checkForWin
  };
};