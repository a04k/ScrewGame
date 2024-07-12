"use client";
import { useEffect, useState } from 'react';
import Lobby from './lobby/lobby';
import PlayingTable from './playingTable/playingTable';
import getCookieState from './res.cookies';

const HomePage: React.FC = () => {
    const [state, setState] = useState<boolean | null>(null);

    useEffect(() => {
        const state = getCookieState();
        setState(state);
    }, []);

    if (state === null) {
        return <div>Loading...</div>;
    }

    return state ? <PlayingTable /> : <Lobby />;
};

export default HomePage;
