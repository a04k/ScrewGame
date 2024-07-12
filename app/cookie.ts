// "use client";
// import { useEffect } from 'react';
// import Cookies from 'js-cookie';

// const setCookie = (name: string, value: string, days: number): void => {
//     let expires = "";
//     if (days) {
//         const date = new Date();
//         date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//         expires = "; expires=" + date.toUTCString();
//     }
//     document.cookie = name + "=" + (value || "") + expires + "; path=/";
// };


// const MyComponent: React.FC = () => {
//     useEffect(() => {
//         setCookie("in", "true", 7);
//     }, []);

//     const readCookie = (): void => {
//         const value = Cookies.get('in');
//         console.log(value);
//     };

//     // return (
//     //     <div>
//     //         <button onClick={readCookie()}> Read Cookie </button>
//     //     </div>
//     // );
// };

// export default MyComponent;
