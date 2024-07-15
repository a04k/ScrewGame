import { useGetData } from "../hooks/useGetData";
import Loading from "../loading";

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
                <Loading/>
            )}
        </div>
    );
};

export default PlayingTable;
