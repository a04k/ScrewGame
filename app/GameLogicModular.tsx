import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from './Firebase/config';
import { useCookies } from 'react-cookie';
import { createRoom, joinRoom } from './room';

interface Card {
  value: string;
  isVisible: boolean;
}

interface Player {
  playerNumber: number;
  cards: Card[];
  gamePoints: number;
  roundPoints: number;
}

interface GameState {
  players: Player[];
  groundCards: Card[];
  deck: string[];
  currentPlayerTurn: number;
  roundNumber: number;
  gameOver: boolean;
  screwCalled: boolean;
  screwCalledBy: number | null;
  drawnCard: Card | null;
  roomId: string | null;
}

const initialGameState: GameState = {
  players: [],
  groundCards: [],
  deck: [],
  currentPlayerTurn: 1,
  roundNumber: 1,
  gameOver: false,
  screwCalled: false,
  screwCalledBy: null,
  drawnCard: null,
  roomId: null,
};

const createDeck = (): string[] => {
  const deck: string[] = [];
  for (let i = 1; i <= 10; i++) {
    for (let j = 0; j < 4; j++) {
      deck.push(i.toString());
    }
  }
  deck.push(
    ...Array(2).fill('R'),
    ...Array(2).fill('+20'),
    ...Array(4).fill('G'),
    '-1',
    ...Array(2).fill('K'), // el k7b 🐐
    ...Array(4).fill('S'), // 5od w hat / swap
    ...Array(2).fill('B') // basra
  );
  return shuffle(deck);
};

const shuffle = (array: string[]): string[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [cookies, setCookie, removeCookie] = useCookies(['roomId', 'playerId']);

  useEffect(() => {
    const roomId = cookies.roomId;
    if (!roomId) return;
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    onValue(gameStateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
      } else {
        initializeGame(roomId);
      }
    });
  }, [cookies.roomId]);

  const updateGameState = (newState: Partial<GameState>) => {
    const roomId = cookies.roomId;
    if (!roomId) return;
    const updatedState = { ...gameState, ...newState };
    set(ref(database, `rooms/${roomId}/gameState`), updatedState);
    setGameState(updatedState);
  };

  const initializeGame = (roomId: string) => {
    const deck = createDeck();
    const players = gameState.players.map((player) => ({
      ...player,
      cards: Array(4)
        .fill(0)
        .map(() => ({ value: deck.pop() || '', isVisible: false })),
      roundPoints: 0,
    }));

    const groundCards = [{ value: deck.pop() || '', isVisible: true }];

    updateGameState({ players, groundCards, deck, roomId });

    setTimeout(() => {
      revealCardsAtStart();
    }, 10000);
  };

  const revealCardsAtStart = () => {
    const updatedPlayers = gameState.players.map((player) => ({
      ...player,
      cards: player.cards.map((card, index) => ({
        ...card,
        isVisible: index >= player.cards.length - 2,
      })),
    }));

    updateGameState({ players: updatedPlayers });

    setTimeout(() => {
      hideInitialCards();
    }, 10000);
  };

  const hideInitialCards = () => {
    const updatedPlayers = gameState.players.map((player) => ({
      ...player,
      cards: player.cards.map((card) => ({
        ...card,
        isVisible: false,
      })),
    }));

    updateGameState({ players: updatedPlayers });
  };

  const drawCard = () => {
    if (gameState.screwCalled || gameState.drawnCard) return;

    const drawnCard = gameState.deck.pop() || '';
    updateGameState({
      drawnCard: { value: drawnCard, isVisible: true },
      deck: gameState.deck,
    });
  };

  const handleOwnCardReveal = (playerIndex: number) => {
    const hiddenCardIndex = gameState.players[playerIndex].cards.findIndex(
      (card) => !card.isVisible
    );
    if (hiddenCardIndex !== -1) {
      toggleCardVisibility(playerIndex, hiddenCardIndex, true);
      setTimeout(() => {
        toggleCardVisibility(playerIndex, hiddenCardIndex, false);
      }, 3000);
    }
  };

  const handleOtherCardReveal = (
    playerIndex: number,
    cardIndex: number
  ) => {
    toggleCardVisibility(playerIndex, cardIndex, true);
    setTimeout(() => {
      toggleCardVisibility(playerIndex, cardIndex, false);
    }, 3000);
  };

  const toggleCardVisibility = (
    playerIndex: number,
    cardIndex: number,
    isVisible: boolean
  ) => {
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex].cards[cardIndex].isVisible = isVisible;
    updateGameState({ players: updatedPlayers });
  };

  const handleSpecialCard = (
    cardValue: string,
    currentPlayerIndex: number,
    targetPlayerIndex?: number,
    targetCardIndex?: number
  ) => {
    switch (cardValue) {
      case '7':
      case '8':
        handleOwnCardReveal(currentPlayerIndex);
        break;
      case '9':
      case '10':
        if (targetPlayerIndex !== undefined && targetCardIndex !== undefined) {
          handleOtherCardReveal(targetPlayerIndex, targetCardIndex);
        }
        break;
      default:
        break;
    }
  };

  const playCard = (
    selectedCardIndex?: number,
    targetPlayerIndex?: number,
    targetCardIndex?: number
  ) => {
    const currentPlayerIndex = gameState.currentPlayerTurn - 1;
    const drawnCard = gameState.drawnCard;

    if (!drawnCard) return;

    const updatedPlayers = [...gameState.players];
    const updatedGroundCards = [...gameState.groundCards];
    const currentPlayer = updatedPlayers[currentPlayerIndex];

    if (selectedCardIndex !== undefined) {
      const selectedCard = currentPlayer.cards[selectedCardIndex];

      // Player throws selected card to the ground
      updatedGroundCards.push({ value: selectedCard.value, isVisible: true });

      // Check if thrown card matches the top card on the ground
      if (
        updatedGroundCards.length > 1 &&
        selectedCard.value === updatedGroundCards[updatedGroundCards.length - 2].value
      ) {
        // Handle Basra condition
        //
      }

      // Remove the selected card from the player's hand
      currentPlayer.cards.splice(selectedCardIndex, 1);
    } else {
      // Player throws the drawn card to the ground
      updatedGroundCards.push({ value: drawnCard.value, isVisible: true });

      // Check if drawn card matches the top card on the ground
      if (
        updatedGroundCards.length > 1 &&
        drawnCard.value === updatedGroundCards[updatedGroundCards.length - 2].value
      ) {
        // Handle Basra condition
        currentPlayer.roundPoints += 10;
      }
    }

    // Handle special cards (7, 8, 9, 10)
    if (['7', '8', '9', '10'].includes(drawnCard.value)) {
      handleSpecialCard(
        drawnCard.value,
        currentPlayerIndex,
        targetPlayerIndex,
        targetCardIndex
      );
    }

    // Clear the drawn card and update player turn
    const nextPlayerTurn = (gameState.currentPlayerTurn % gameState.players.length) + 1;
    updateGameState({
      players: updatedPlayers,
      groundCards: updatedGroundCards,
      drawnCard: null,
      currentPlayerTurn: nextPlayerTurn,
    });
  };

  const callScrew = () => {
    if (gameState.screwCalled) return;

    const currentPlayerIndex = gameState.currentPlayerTurn - 1;
    updateGameState({ screwCalled: true, screwCalledBy: currentPlayerIndex });
  };

  const endRound = () => {
    const screwCallerIndex = gameState.screwCalledBy;
    if (screwCallerIndex === null) return;

    const players = gameState.players.map((player, index) => {
      let roundPoints = 0;

      if (index !== screwCallerIndex) {
        roundPoints = player.cards.reduce(
          (total, card) => total + parseInt(card.value, 10),
          0
        );
      }

      return {
        ...player,
        roundPoints,
        gamePoints: player.gamePoints + roundPoints,
      };
    });

    const caller = players[screwCallerIndex];
    const minPoints = Math.min(...players.map((p) => p.roundPoints));

    if (caller.roundPoints > minPoints) {
      caller.gamePoints += caller.roundPoints;
    }

    const nextRoundNumber = gameState.roundNumber + 1;
    const gameOver = nextRoundNumber > 5;

    updateGameState({
      players,
      roundNumber: nextRoundNumber,
      gameOver,
      screwCalled: false,
      screwCalledBy: null,
      currentPlayerTurn: 1,
    });

    if (gameOver) {
      // Calculate the final score and handle the end of the game
      // You can add any additional logic for the end of the game here
    } else {
      initializeGame(gameState.roomId || '');
    }
  };

  return {
    gameState,
    drawCard,
    playCard,
    callScrew,
    endRound,
  };
};

export default useGameLogic;
