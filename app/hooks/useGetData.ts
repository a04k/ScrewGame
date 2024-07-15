import { useState, useEffect } from "react";
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

type FirestoreData = {
  id: string;
  noPlayers: number;
};

export const useGetData = (roomId: string): FirestoreData | null => {
  const [data, setData] = useState<FirestoreData | null>(null);

  useEffect(() => {
    const roomRef = collection(db, 'Rooms');

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const theRoom = snapshot.docs.find((doc) => doc.id === roomId);
      if (theRoom) {
        const roomData = { id: theRoom.id, ...theRoom.data() } as FirestoreData;
        setData(roomData);
      } else {
        setData(null);
      }
    });

    return () => unsubscribe(); // Cleanup the subscription on unmount
  }, [roomId]);

  return data;
};
