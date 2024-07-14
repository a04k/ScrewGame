"use client";
import React from 'react';
import Image from 'next/image';
const Loading: React.FC = ()=>{
    return (<div className="w-full h-screen color1 flex justify-center items-center loadingText">
        <div>
        <Image
      src="/loading.gif"
      width={50}
      height={50}
      alt="Picture of the author"
    />
    
        Loading..
        </div>
    </div>);
};
export default Loading;