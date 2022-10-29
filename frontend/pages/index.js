import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useMoralis, useWeb3Contract } from 'react-moralis'
// import {abi} from "../constant/abi"
import { useState, useEffect } from "react";
// useWeb3Contract is for connecting smart contract functions 
// https://www.youtube.com/watch?v=pdsYCkUWrgQ
// 1:00:14 onwards

export default function Home() {
  const [hasMetamask, setHasMetamask] = useState(false);
  const {enableWeb3, isWeb3Enabled} = useMoralis();
  // const { data, error, runContractFunction, isFetching, isLoading } =
  //   useWeb3Contract({
  //     abi: abi,
  //     contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // your contract address here
  //     functionName: "store",
  //     params: {
  //       _favoriteNumber: 42,
  //     },
  //   });

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });
  return (
    // <div >
    //   {
    //     isWeb3Enabled ? (
    //       <>
    //       "Connected! "<button onClick={() => execute()}>Execute</button>
    //       </>
    //     ) : (
    //       <button onClick={() => enableWeb3()}>Connect</button>
    //     )
    //   }
    //   hiii
    // </div>
    
    <div>
      {hasMetamask ? (
        isWeb3Enabled ? (
          "Wallet Connected! "
        ) : (
          <button onClick={() => enableWeb3()}>Connect Wallet</button>
        )
      ) : (
        "Please install metamask"
      )}

      {/* {isWeb3Enabled ? (
        <button onClick={() => runContractFunction()}>Execute</button>
      ) : (
        ""
      )} */}
    </div>
  )
}
