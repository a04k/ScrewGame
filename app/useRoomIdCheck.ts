import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

type FirestoreData = {
  id: string;
  noPlayers: number;
};

const useRoomIdCheck = () => {
  const [data, setData] = useState<FirestoreData[]>([]);
  const [isRoomIdValid, setIsRoomIdValid] = useState<boolean>(false);
  const [mainId, setMainId] = useState<string>("###");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Rooms'), (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreData[];
      setData(docsData);
    }, (error) => {
        console.error("Error fetching data: ", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cookieValue = Cookies.get('status');
    
    if (cookieValue && data.length > 0) {
      const parsedValue = JSON.parse(cookieValue);
      const roomId = parsedValue.roomId;
      setMainId(roomId);
      parsedValue.state = true;
      console.log("roomId :", roomId);
      console.log('data :', data);
      
      const roomExists = data.some(doc => doc.id === roomId);
      setIsRoomIdValid(roomExists);
      
      if (!roomExists) {
        Cookies.set('status', JSON.stringify({ in: false, roomId: "###" }), { expires: 3 });
      }
    } else {
      setIsRoomIdValid(false);
    }
  }, [data]);

  return { isRoomIdValid, mainId };
};

export default useRoomIdCheck;