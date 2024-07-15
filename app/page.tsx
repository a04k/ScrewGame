"use client";
import { useEffect, useState } from 'react';
import Lobby from './lobby/lobby';
import PlayingTable from './playingTable/playingTable';
import useRoomIdCheck from './hooks/useRoomIdCheck';
import Loading from './loading';


const HomePage: React.FC = () => {
  const {isRoomIdValid , mainId} = useRoomIdCheck();
  const [status, setStatus] = useState<boolean | null>(null);

  useEffect(() => {
    setStatus(isRoomIdValid);
  }, [isRoomIdValid]);

  if (status === null) {
    return <Loading/>;
  }

  return status ? <PlayingTable roomId={mainId} /> : <Lobby />;
};

export default HomePage;  