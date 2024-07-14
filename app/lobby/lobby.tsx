"use Client";
import { ChangeEvent, useState } from "react";
import Cookies from "js-cookie";
import useRoomIdCheck from "../useRoomIdCheck";
const Lobby = ()=>{
    const isIdValid = useRoomIdCheck().isIdValid;
    const [userName , setUserName] = useState<string>("");
    const [roomId , setRoomId] = useState<string>("");
    const [warning1 , setWarning1] = useState<string>("");
    const [warning2 , setWarning2] = useState<string>("");
    const userNameWarning = 'You have to write a userName...';
    const roomIdWarning = 'You have to write a valid room-Id...';
    type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
    const userNameChange = (e:ChangeEvent)=>{
        setUserName(e.target.value);
    }
    const roomIdChange = (e:ChangeEvent)=>{
        setRoomId(e.target.value);
    }

    const join = ()=>{
        if(userName === ""){
            setWarning1(userNameWarning);
        }

        if(!isIdValid(roomId)){
            setWarning2(roomIdWarning);
        } else {
            Cookies.set('status', JSON.stringify({ in: true, roomId: `${roomId}` }), { expires: 3 });
            window.location.reload();
        }
    }
    const create = ()=>{
        if(userName === ""){
            setWarning1(userNameWarning);
        }
    }
    return (
        <div className="w-full h-screen flex justify-center items-center color1">
            <div className="w-96 h-80 bg-black rounded-md color4 p-6 grid grid-cols-2">
                <label htmlFor="user">User Name: </label>
                <input type="text" className=" outline-none h-6 rounded-md color3 p-2 hover:opacity-95 transition-all" name="user" value={userName} onChange={userNameChange}/>
                <div className="col-span-2 text-sm text-red-800">{warning1}</div>
                <label htmlFor="room ">Room Id: </label>
                <input type="text" className="  outline-none h-6 rounded-md color3 p-2 hover:opacity-95 transition-all" name="room" value={roomId} onChange={roomIdChange}/>
                <div className="col-span-2 text-sm text-red-800">{warning2}</div>

                <input type="button" onClick={join} className="outline-none h-6 rounded-md color3 cursor-pointer hover:opacity-95 active:scale-95 transition-all col-span-2" name="btn" value={'JOIN'}/>
                <div className="col-span-2"></div>
                <label htmlFor="btn ">Create New Room: </label>
                <input type="button" onClick={create} className="  outline-none h-6 rounded-md color3 cursor-pointer hover:opacity-95 active:scale-95 transition-all" name="btn" value={'CREATE'}/>
            </div>

        </div>
);
}
export default Lobby;