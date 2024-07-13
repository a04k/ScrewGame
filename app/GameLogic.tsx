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
    ...Array(2).fill("K"), // el k7b 🐐
    ...Array(4).fill("S"), // 5od w hat / swap
    ...Array(2).fill("B"), // basra
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
  // const [roomId, setRoomId] = useState<string | null>(null);
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
    // set(ref(database, `rooms/${roomId}/gameState`), updatedState);
  };

  // const createRoom = async (numPlayers: number) => {
  //   const newRoomRef = push(ref(database, "rooms"));
  //   const roomKey = newRoomRef.key;

  //   if (!roomKey) return;

  //   const initialPlayers: Player[] = Array(numPlayers)
  //     .fill(0)
  //     .map((_, index) => ({
  //       playerNumber: index + 1,
  //       cards: [],
  //       totalPoints: 0,
  //     }));

  //   const newRoomState = {
  //     gameState: { ...initialGameState, players: initialPlayers },
  //     playerCount: 0,
  //     maxPlayers: numPlayers,
  //   };

  //   await set(newRoomRef, newRoomState);
  //   setRoomId(roomKey);
  // };

  // const joinRoom = async (roomKey: string) => {
  //   const roomRef = ref(database, `rooms/${roomKey}`);
  //   const roomSnapshot = await get(roomRef);

  //   if (roomSnapshot.exists()) {
  //     const roomData = roomSnapshot.val();
  //     if (roomData.playerCount < roomData.maxPlayers) {
  //       setPlayerId(roomData.playerCount + 1);
  //       await set(child(roomRef, "playerCount"), roomData.playerCount + 1);
  //       setRoomId(roomKey);
  //     } else {
  //       alert("Room is full");
  //     }
  //   } else {
  //     alert("Room does not exist");
  //   }
  // };

  const initializeGame = () => {
    const deck = createDeck();
    const players = gameState.players.map((player) => ({
      ...player,
      cards: Array(4)
        .fill(0)
        .map(() => ({ value: deck.pop() || "", isVisible: false })),
      totalPoints: 0,
    }));

    // start game w/ one card on the ground from the deck
    const groundCards = [{ value: deck.pop() || "", isVisible: true }];

    updateGameState({ players, groundCards, deck });

    setTimeout(() => {
      revealCardsAtStart(); // temporarily reveal rightmost two cards
    }, 10000);
  };

  const revealCardsAtStart = () => {
    const updatedPlayers = gameState.players.map((player) => ({
      ...player,
      cards: player.cards.map((card, index) => ({
        ...card,
        isVisible: index >= player.cards.length - 2, // set isVisible to true for rightmost two cards
      })),
    }));

    updateGameState({ players: updatedPlayers });

    setTimeout(() => {
      hideInitialCards(); // hides the two cards again after 10 seconds
    }, 10000);
  };

  const hideInitialCards = () => {
    const updatedPlayers = gameState.players.map((player) => ({
      ...player,
      cards: player.cards.map((card) => ({
        ...card,
        isVisible: false, // hides the cards
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

  const playCard = (
    selectedCardIndex?: number,
    targetPlayerIndex?: number,
    targetCardIndex?: number,
  ) => {
    const currentPlayerIndex = gameState.currentPlayerTurn - 1;
    const drawnCard = gameState.drawnCard;

    if (!drawnCard) return;

    const updatedPlayers = [...gameState.players];
    const updatedGroundCards = [...gameState.groundCards];
    const currentPlayer = updatedPlayers[currentPlayerIndex];

    //toggle card visibility used for 7,8,9,10 functions
    const toggleCardVisibility = (
      playerIndex: number,
      cardIndex: number,
      isVisible: boolean,
    ) => {
      updatedPlayers[playerIndex].cards[cardIndex].isVisible = isVisible;
    };

    // remove a specific card from a player's hand and add it to groundCards used in basra card and basra in general
    const removeCardFromHand = (playerIndex: number, cardIndex: number) => {
      const removedCard = updatedPlayers[playerIndex].cards.splice(
        cardIndex,
        1,
      )[0]; // Remove and get the card
      updatedGroundCards.push(removedCard); // Add removed card to the groundCards stack
    };

    // Function to add a card to the ground stack
    const addCardToGround = (card: Card) => {
      updatedGroundCards.push(card);
    };

    if (selectedCardIndex !== undefined) {
      const selectedCard = currentPlayer.cards[selectedCardIndex];

      // Player throws selected card to the ground
      addCardToGround({ value: selectedCard.value, isVisible: true });

      // Check if thrown card matches the top ground card
      if (
        selectedCard.value ===
        updatedGroundCards[updatedGroundCards.length - 1].value
      ) {
        // Take both cards if thrown card matches the top ground card
        currentPlayer.cards.push({ value: drawnCard.value, isVisible: true });
      }

      // Remove thrown card from player's hand
      removeCardFromHand(currentPlayerIndex, selectedCardIndex);
    } else {
      // Player chooses not to draw from ground, just add drawn card to ground
      addCardToGround({ value: drawnCard.value, isVisible: true });

      // Handle special card functions
      switch (drawnCard.value) {
        case "7":
        case "8":
          // 7 & 8 shoof kartak
          // Allow player to see one of their own cards for 3 seconds
          const hiddenCardIndex = currentPlayer.cards.findIndex(
            (card) => !card.isVisible,
          );
          if (hiddenCardIndex !== -1) {
            toggleCardVisibility(currentPlayerIndex, hiddenCardIndex, true);
            setTimeout(() => {
              toggleCardVisibility(currentPlayerIndex, hiddenCardIndex, false);
              updateGameState({ players: updatedPlayers });
            }, 3000);
          }
          break;
        case "9":
        case "10":
          // 9 & 10 shoof kart 8eirk
          // Allow player to see one card of any other player
          if (
            targetPlayerIndex !== undefined &&
            targetCardIndex !== undefined
          ) {
            toggleCardVisibility(targetPlayerIndex, targetCardIndex, true);
            setTimeout(() => {
              toggleCardVisibility(targetPlayerIndex, targetCardIndex, false);
              updateGameState({ players: updatedPlayers });
            }, 3000);
          }
          break;
        case "K":
          //k3b "k7b" dayer, this still needs a whole lot of refining because it might just be infinite and probably i can just keep selecting.
          // Allows player to see a card of each opponent for 3 seconds
          updatedPlayers.forEach((player, index) => {
            if (index !== currentPlayerIndex) {
              const hiddenCardIndex = player.cards.findIndex(
                (card) => !card.isVisible,
              );
              if (hiddenCardIndex !== -1) {
                toggleCardVisibility(index, hiddenCardIndex, true);
                setTimeout(() => {
                  toggleCardVisibility(index, hiddenCardIndex, false);
                  updateGameState({ players: updatedPlayers });
                }, 3000);
              }
            }
          });
          break;
        case "S":
          // 5od w hat : work in progress
          break;
        case "B":
          // Basra : work in progress
          break;
        default:
          break;
      }
    }
    // Update game state after playing the card
    const nextPlayerIndex =
      (gameState.currentPlayerTurn % gameState.players.length) + 1;
    updateGameState({
      players: updatedPlayers,
      groundCards: updatedGroundCards,
      currentPlayerTurn: nextPlayerIndex,
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
