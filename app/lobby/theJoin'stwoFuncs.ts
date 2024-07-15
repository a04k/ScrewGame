import Cookies from "js-cookie";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

type FirestoreData = {
  id: string;
  numPlayers: number;
  Players: string[];
  numinspectors: number;
  inspectors: string[];
};

type Room = {
  roomId: string;
  userName: string;
  data: FirestoreData | null;
};

const player = async ({ roomId, userName, data }: Room) => {
  if (data) {
    const numOfPlayers: number = data.numPlayers + 1;
    const playersArr: string[] = [...data.Players, userName];
    const roomDocRef = doc(db, 'Rooms', roomId);

    await setDoc(roomDocRef, {
      ...data,
      numPlayers: numOfPlayers,
      Players: playersArr,
    });

    console.log('Room created successfully with ID:', roomId);
    Cookies.set('status', JSON.stringify({ in: true, roomId: `${ roomId }` }), { expires: 3 });
  window.location.reload();
} else {
  console.error('Failed to fetch room data');
  }
};

const inspector = async ({ roomId, userName, data }: Room) => {
  if (data) {
    const numinspectors: number = data.numinspectors + 1;
    const inspectorsArr: string[] = [...data.inspectors, userName];
    const roomDocRef = doc(db, 'Rooms', roomId);

    await setDoc(roomDocRef, {
      ...data,
      numinspectors: numinspectors,
      inspectors: inspectorsArr,
    });

    console.log('Room created successfully with ID:', roomId);
    Cookies.set('status', JSON.stringify({ in: true, roomId: `${ roomId }` }), { expires: 3 });
  window.location.reload();
} else {
  console.error('Failed to fetch room data');
  }
};

export { player, inspector };