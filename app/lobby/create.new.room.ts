// import { nanoid } from 'nanoid';
// import { db } from '../config/firebase';
// import { collection, addDoc } from 'firebase/firestore';

// export const createRoom =async ()=>{
//     const rooms = collection(db , 'Rooms');
//     await addDoc( rooms, {
//         id : nanoid(6),
//         msg: "lol",
//         numPlayers: 1
//     })
//     console.log('Done');
// }

import { nanoid } from 'nanoid';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';

export const createRoom = async () => {
    try {
        const roomId = nanoid(6);
        const roomDocRef = doc(db, 'Rooms', roomId);
        await setDoc(roomDocRef, {
            id: roomId,
            msg: "lol",
            numPlayers: 1
        });
        console.log('Room created successfully with ID:', roomId);
        Cookies.set('status', JSON.stringify({ in: true, roomId }), { expires: 3 });
        window.location.reload();
    } catch (error) {
        console.error('Error creating room: ', error);
    }
};

