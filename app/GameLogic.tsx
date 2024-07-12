import { useEffect, useState } from "react";
import { ref, onValue, set, push, child, get } from "firebase/database";
import { database } from "../Firebase/Config";

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
  groundCards: Card[];
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
  deck.push(
    ...Array(2).fill("R"),
    ...Array(2).fill("+20"),
    ...Array(4).fill("G"),
    "-1",
    ...Array(4).fill("K"),
    ...Array(4).fill("S"),
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
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    onValue(gameStateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
      } else {
        initializeGame();
      }
    });
  }, [roomId]);

  const updateGameState = (newState: Partial<GameState>) => {
    if (!roomId) return;
    const updatedState = { ...gameState, ...newState };
    set(ref(database, `rooms/${roomId}/gameState`), updatedState);
  };

  const createRoom = async (numPlayers: number) => {
    const newRoomRef = push(ref(database, "rooms"));
    const roomKey = newRoomRef.key;

    if (!roomKey) return;

    const initialPlayers: Player[] = Array(numPlayers)
      .fill(0)
      .map((_, index) => ({
        playerNumber: index + 1,
        cards: [],
        totalPoints: 0,
      }));

    const newRoomState = {
      gameState: { ...initialGameState, players: initialPlayers },
      playerCount: 0,
      maxPlayers: numPlayers,
    };

    await set(newRoomRef, newRoomState);
    setRoomId(roomKey);
  };

  const joinRoom = async (roomKey: string) => {
    const roomRef = ref(database, `rooms/${roomKey}`);
    const roomSnapshot = await get(roomRef);

    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.val();
      if (roomData.playerCount < roomData.maxPlayers) {
        setPlayerId(roomData.playerCount + 1);
        await set(child(roomRef, "playerCount"), roomData.playerCount + 1);
        setRoomId(roomKey);
      } else {
        alert("Room is full");
      }
    } else {
      alert("Room does not exist");
    }
  };

  const initializeGame = () => {
    const deck = createDeck();
    const players = gameState.players.map((player) => ({
      ...player,
      cards: Array(4)
        .fill(0)
        .map(() => ({ value: deck.pop() || "", isVisible: false })),
      totalPoints: 0,
    }));

    // Initialize with one card on the ground from the deck
    const groundCards = [{ value: deck.pop() || "", isVisible: true }];

    updateGameState({ players, groundCards, deck });

    setTimeout(() => {
      revealInitialCards(); // Temporarily reveal rightmost two cards
    }, 10000);
  };

  const revealInitialCards = () => {
    const updatedPlayers = gameState.players.map((player) => ({
      ...player,
      cards: player.cards.map((card, index) => ({
        ...card,
        isVisible: index >= player.cards.length - 2, // Set isVisible to true for rightmost two cards
      })),
    }));

    updateGameState({ players: updatedPlayers });

    setTimeout(() => {
      hideInitialCards(); // After 10 seconds, hide the revealed cards
    }, 10000);
  };

  const hideInitialCards = () => {
    const updatedPlayers = gameState.players.map((player) => ({
      ...player,
      cards: player.cards.map((card) => ({
        ...card,
        isVisible: false, // Set isVisible back to false for all cards
      })),
    }));

    updateGameState({ players: updatedPlayers });
  };

  const drawCard = () => {
    if (gameState.screwCalled || gameState.drawnCard) return;

    const drawnCard = gameState.deck.pop() || "";
    updateGameState({
      drawnCard: { value: drawnCard, isVisible: true },
      deck: gameState.deck,
    });
  };

  const playCard = (cardIndex?: number) => {
    const currentPlayer = gameState.players[gameState.currentPlayerTurn - 1];
    const drawnCard = gameState.drawnCard;

    if (!drawnCard) return;

    let updatedPlayers = [...gameState.players];
    let updatedGroundCards = [...gameState.groundCards];

    if (cardIndex !== undefined) {
      const discardedCard = currentPlayer.cards[cardIndex];
      updatedPlayers[gameState.currentPlayerTurn - 1].cards[cardIndex] = {
        value: drawnCard.value,
        isVisible: false,
      };
      updatedGroundCards.push({ value: discardedCard.value, isVisible: true });
    } else {
      updatedGroundCards.push({ value: drawnCard.value, isVisible: true });
      // handle special card functions
      if (["7", "8"].includes(drawnCard.value)) {
        // allow player to see one of their own cards
        const playerCards =
          updatedPlayers[gameState.currentPlayerTurn - 1].cards;
        const hiddenCardIndex = playerCards.findIndex(
          (card) => !card.isVisible,
        );
        if (hiddenCardIndex !== -1) {
          playerCards[hiddenCardIndex].isVisible = true;
          setTimeout(() => {
            playerCards[hiddenCardIndex].isVisible = false;
            updateGameState({ players: updatedPlayers });
          }, 3000);
        }
      } else if (["9", "10"].includes(drawnCard.value)) {
        // Allow player to see one card of any other player
        // This will be handled in the UI, allowing the player to choose
      } else if (drawnCard.value === "K") {
        // Allow player to see one card of each opponent
        updatedPlayers.forEach((player, index) => {
          if (index !== gameState.currentPlayerTurn - 1) {
            const hiddenCardIndex = player.cards.findIndex(
              (card) => !card.isVisible,
            );
            if (hiddenCardIndex !== -1) {
              player.cards[hiddenCardIndex].isVisible = true;
              setTimeout(() => {
                player.cards[hiddenCardIndex].isVisible = false;
                updateGameState({ players: updatedPlayers });
              }, 3000);
            }
          }
        });
      } else if (drawnCard.value === "S") {
        // Allow player to swap a card with any opponent
        // This will be handled in the UI, allowing the player to choose
      }
    }

    const nextPlayer =
      (gameState.currentPlayerTurn % gameState.players.length) + 1;
    updateGameState({
      players: updatedPlayers,
      groundCards: updatedGroundCards,
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

  const swapCards = (
    playerIndex: number,
    cardIndex: number,
    targetPlayerIndex: number,
    targetCardIndex: number,
  ) => {
    const updatedPlayers = [...gameState.players];
    const temp = updatedPlayers[playerIndex].cards[cardIndex];
    updatedPlayers[playerIndex].cards[cardIndex] =
      updatedPlayers[targetPlayerIndex].cards[targetCardIndex];
    updatedPlayers[targetPlayerIndex].cards[targetCardIndex] = temp;
    updateGameState({ players: updatedPlayers });
  };

  const callScrew = () => {
    if (gameState.screwCalled) return;
    updateGameState({
      screwCalled: true,
      screwCalledBy: gameState.currentPlayerTurn,
    });
  };

  return {
    gameState,
    roomId,
    playerId,
    createRoom,
    joinRoom,
    drawCard,
    playCard,
    seeCard,
    swapCards,
    callScrew,
  };
};
