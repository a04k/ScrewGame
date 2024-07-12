const Lobby = ()=>{
    return (
        <div className="w-full h-screen flex justify-center items-center color1">
            <div className="w-96 h-80 bg-black rounded-md color4 p-6 grid grid-cols-2">
                <label htmlFor="user ">User Name: </label>
                <input type="text" className=" outline-none h-6 rounded-md color3 p-2 hover:opacity-95 transition-all" name="user"/>
                <label htmlFor="room ">Room Code: </label>
                <input type="text" className="  outline-none h-6 rounded-md color3 p-2 hover:opacity-95 transition-all" name="room"/>
                <input type="button" className="outline-none h-6 rounded-md color3 cursor-pointer hover:opacity-95 active:scale-95 transition-all col-span-2" name="btn" value={'JOIN'}/>
                <label htmlFor="btn ">Create New Room: </label>
                <input type="button" className="  outline-none h-6 rounded-md color3 cursor-pointer hover:opacity-95 active:scale-95 transition-all" name="btn" value={'CREATE'}/>
            </div>

        </div>
);
}
export default Lobby;