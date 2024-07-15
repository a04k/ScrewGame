import { nanoid } from 'nanoid';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';
type create ={
    userName : string
}
export const createRoom = async ({userName}:create) => {
    try {
        const roomId = nanoid(6);
        const roomDocRef = doc(db, 'Rooms', roomId);
        await setDoc(roomDocRef, {
            id: roomId,
            numPlayers: 1,
            numinspectors:0,
            Players:[userName],
            inspectors:[],
        });
        console.log('Room created successfully with ID:', roomId);
        Cookies.set('status', JSON.stringify({ in: true, roomId }), { expires: 3 });
        window.location.reload();
    } catch (error) {
        console.error('Error creating room: ', error);
    }
};

