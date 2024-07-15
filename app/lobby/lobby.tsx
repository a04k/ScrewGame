"use Client";
import { ChangeEvent, useState } from "react";
import useRoomIdCheck from "../hooks/useRoomIdCheck";
import { createRoom } from "./create.new.room";
import { player, inspector } from "./theJoin'stwoFuncs";
import { useGetData } from "../hooks/useGetData";

type FirestoreData = {
  id: string;
  numPlayers: number;
  Players: string[];
  numinspectors: number;
  inspectors: string[];
};

const Lobby = () => {
  const isIdValid = useRoomIdCheck().isIdValid;
  const [userName, setUserName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [warning1, setWarning1] = useState<string>("");
  const [warning2, setWarning2] = useState<string>("");
  const [joinBTNs, setJoinBTNs] = useState<boolean>(false);
  const data = useGetData(roomId);

  const userNameWarning = 'You have to write a userName...';
  const roomIdWarning = 'You have to write a valid room-Id...';
  type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

  const userNameChange = (e: ChangeEvent) => {
    setUserName(e.target.value);
  }

  const roomIdChange = (e: ChangeEvent) => {
    setRoomId(e.target.value);
  }

  const join = () => {
    if (userName === "") {
      setWarning1(userNameWarning);
    }

    if (!isIdValid(roomId)) {
      setWarning2(roomIdWarning);
    } else {
      setJoinBTNs(true);
    }
  }

  const create = () => {
    if (userName === "") {
      setWarning1(userNameWarning);
    } else {
      createRoom({ userName });
    }
  }

  return (
    <div className="w-full h-screen flex justify-center items-center color1">
      <div className=" md:w-2/6 bg-black rounded-md color4 p-6 grid grid-cols-2 gap-3">
        <label htmlFor="user">User Name: </label>
        <input type="text" className="outline-none h-6 rounded-md color3 p-2 hover:opacity-95 transition-all" name="user" value={userName} onChange={userNameChange} />
        <div className="col-span-2 text-sm text-red-800">{warning1}</div>
        <label htmlFor="room">Room Id: </label>
        <input type="text" className="outline-none h-6 rounded-md color3 p-2 hover:opacity-95 transition-all" name="room" value={roomId} onChange={roomIdChange} />
        <div className="col-span-2 text-sm text-red-800">{warning2}</div>

        <input type="button" onClick={join} className="outline-none h-6 rounded-md color3 cursor-pointer hover:opacity-95 active:scale-95 transition-all col-span-2" name="btn" value={'JOIN'} />
        <div className="col-span-2">
          {
            joinBTNs ?
              <div className="p-4 flex flex-col text-center">
                Do you prefer to be a player or inspector?.
                <input type="button" onClick={() => { player({ roomId, userName, data }) }} className="outline-none w-full h-6 rounded-md color3 cursor-pointer hover:opacity-95 active:scale-95 transition-all" value={'PLAYER'} />OR
                <input type="button" onClick={() => { inspector({ roomId, userName, data }) }} className="outline-none w-full h-6 rounded-md color3 cursor-pointer hover:opacity-95 active:scale-95 transition-all" value={'INSPECTOR'} />
              </div>
              : ""
          }
        </div>
        <label htmlFor="btn">Create New Room: </label>
        <input type="button" onClick={create} className="outline-none h-6 rounded-md color3 cursor-pointer hover:opacity-95 active:scale-95 transition-all" name="btn" value={'CREATE'} />
      </div>
    </div>
  );
}
export default Lobby;