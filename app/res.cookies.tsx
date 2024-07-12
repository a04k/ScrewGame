"use client";
import Cookies from 'js-cookie';
const getCookieState = (): boolean => {
    const roomCode = "someRoomCode";
    Cookies.set('fuck', JSON.stringify({state: false, roomCode: roomCode }), { expires: 3 });

    const cookieValue = Cookies.get('fuck');
    
    if (cookieValue) {
        const parsedValue = JSON.parse(cookieValue);
        if (parsedValue.state === true) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

export default getCookieState;
    