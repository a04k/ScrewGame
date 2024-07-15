import { useState } from "react";
import { useGetData } from "../hooks/useGetData";

type FirestoreData = {
    id: string;
    noPlayers: number;
};

type PlayingTableProps = {
    roomId: string;
};

const PlayingTable: React.FC<PlayingTableProps> = ({ roomId }) => {
    const data = useGetData(roomId);

    return (
        <div>
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default PlayingTable;
