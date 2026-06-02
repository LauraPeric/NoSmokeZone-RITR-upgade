import { useState } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

export default function Wallet() { //ui za wallet connection
  const [account, setAccount] = useState(null); //pamti adresu walleta nakon sapajanja

  async function connectWallet() { //kad se klikne connect wallet
    const provider = await detectEthereumProvider(); // metamask provjera u browseru
    if (provider) {
      try {
        const accounts = await provider.request({ method: "eth_requestAccounts" }); //spajanje welleta
        setAccount(accounts[0]); //soremanje accounta
      } catch (err) {
        console.error("User rejected connection:", err);
      }
    } else {
      alert("MetaMask not found. Please install MetaMask!");
    }
  }

  return (
    <div>
      {account ? (
        <p>Connected wallet: {account}</p>
      ) : (
        <button onClick={connectWallet}>Connect MetaMask</button>
      )}
    </div>
  );
}