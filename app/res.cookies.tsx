"use client";
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, DocumentData } from 'firebase/firestore';

type FirestoreData = {
  id: string;
  noPlayers: number;
};

const getCookieState = (): boolean => {
  const [data, setData] = useState<FirestoreData[]>([]);
  const [isRoomIdValid, setIsRoomIdValid] = useState<boolean>(false);

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
    
    if (cookieValue) {
      const parsedValue = JSON.parse(cookieValue);
      const roomId = parsedValue.roomId;

      if (parsedValue.state === true) {
        const roomExists = data.some(doc => doc.id === roomId);
        setIsRoomIdValid(roomExists);
        if(roomExists === false) {
            Cookies.set('status', JSON.stringify({in: false, roomid: "###" }), { expires: 3 });
        }
      } else {
        setIsRoomIdValid(false);
      }
    } else {
      setIsRoomIdValid(false);
    }
  }, [data]);

  return isRoomIdValid;
};

export default getCookieState;
