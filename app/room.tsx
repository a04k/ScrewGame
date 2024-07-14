import { ref, push, set, get, child } from 'firebase/database';
import { database } from './Firebase/config';

interface Player {
  playerNumber: number;
  cards: { value: string; isVisible: boolean }[];
  gamePoints: number;
  roundPoints: number;
}

interface GameState {
  players: Player[];
  groundCards: { value: string; isVisible: boolean }[];
  deck: string[];
  currentPlayerTurn: number;
  roundNumber: number;
  gameOver: boolean;
  screwCalled: boolean;
  screwCalledBy: number | null;
  drawnCard: { value: string; isVisible: boolean } | null;
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
};

export const createRoom = async (numPlayers: number): Promise<string | null> => {
  const newRoomRef = push(ref(database, 'rooms'));
  const roomKey = newRoomRef.key;

  if (!roomKey) return null;

  const initialPlayers: Player[] = Array(numPlayers).fill(0).map((_, index) => ({
    playerNumber: index + 1,
    cards: [],
    gamePoints: 0,
    roundPoints: 0,
  }));

  const newRoomState = {
    gameState: { ...initialGameState, players: initialPlayers },
    playerCount: 0,
    maxPlayers: numPlayers,
  };

  await set(newRoomRef, newRoomState);
  return roomKey;
};

export const joinRoom = async (roomKey: string): Promise<number | null> => {
  const roomRef = ref(database, `rooms/${roomKey}`);
  const roomSnapshot = await get(roomRef);

  if (roomSnapshot.exists()) {
    const roomData = roomSnapshot.val();
    if (roomData.playerCount < roomData.maxPlayers) {
      await set(child(roomRef, 'playerCount'), roomData.playerCount + 1);
      return roomData.playerCount + 1;
    } else {
      alert('Room is full');
      return null;
    }
  } else {
    alert('Room does not exist');
    return null;
  }
};
