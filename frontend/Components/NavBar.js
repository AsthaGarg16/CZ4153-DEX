import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useMoralis, useWeb3Contract } from 'react-moralis'
import { useState, useEffect } from "react";
import { ConnectButton } from "web3uikit"

const Navbar = () => {
  const [hasMetamask, setHasMetamask] = useState(false);
  const {enableWeb3, isWeb3Enabled} = useMoralis();
  // console.log(useMoralis.get('ethAddress'))
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });

  return (
    <header>
      <nav className={`nav`}>
      <div className="logo-image"></div>
      <div></div>
      <div><h1 >BlockByBlock DEX</h1></div>
      <div>
        {/* {hasMetamask ? (
            isWeb3Enabled ? (
            <button class="button-34" role="button">Wallet Connected!</button>
            ) : (
            <button class="button-33" role="button" onClick={() => enableWeb3()}>Connect Wallet</button>
            )
        ) : (
            "Please install metamask"
        )} */}
        <ConnectButton class="button-35" moralisAuth={false} />
      </div>
      </nav>
    </header>
  );
};

export default Navbar;