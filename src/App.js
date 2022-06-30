import React, { useState, useEffect } from 'react';
import { user1 } from './components/user1'
import { user2 } from './components/user2'
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createWrappedNativeAccount } from './components/wrappedSOL';
import { getOrCreateAssociatedAccount } from './components/getOrCreateAssociatedAccount';
import { decodeMetadata, getMetadataAccount } from "./components/helper";
import { cancel } from './components/cancel';
import { connection } from './components/connection';
import { updatePlatformAccounts } from './components/platform_accounts';


const App = () => {
  const [count, setCount] = useState();
  const [pubKey, setPubKey] = useState();
  const [amount, setAmount] = useState();
  const [mint, setMint] = useState();
  const [NFTtoken, setNFTtoken] = useState();
  const [WSOLtoken, setWSOLtoken] = useState();
  const [nftObjData, setNftObjData] = useState();

  useEffect(() => {

  }, [nftObjData]);

  const NATIVE_MINT = new PublicKey("So11111111111111111111111111111111111111112")

  //const wallets = [ getPhantomWallet() ];

  //const wallet = useWallet()


  /////////////////////////////////////////////////////////////Connections////////////////////////////////////////////    
  const getConnectedWallet = async () => {
    const provider = await window.solana;
    if (provider) {
      setPubKey(provider.publicKey);
      localStorage.setItem("pubKey", provider.pubKey);
    }
    else console.log("Try to connect again");
  }


  const connectWallet = async () => {
    const provider = window.solana;
    console.log(provider);
    if (provider) {
      setCount(count + 1);
      await window.solana.connect();
      window.solana.on("connect", () => console.log("connect"));
      getConnectedWallet();
    }
    else window.open("https://phantom.app/", "_blank")
  }

  const disconnectWallet = () => {
    window.solana.disconnect();
    localStorage.removeItem('pubKey')
    setPubKey();
  }

  const getNft = async (publicKey) => {
    console.log("working");
    // let connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    let response = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });
    let mints = await Promise.all(
      response.value
        .filter(
          (accInfo) => accInfo.account.data.parsed.info.tokenAmount.uiAmount !== 0
        )
        .map((accInfo) =>
          getMetadataAccount(accInfo.account.data.parsed.info.mint)
        )
    );
    let mintPubkeys = mints.map((m) => new PublicKey(m));
    let multipleAccounts = await connection.getMultipleAccountsInfo(mintPubkeys);
    let nftMetadata = multipleAccounts
      .filter((account) => account !== null)
      .map((account) => decodeMetadata(account.data));
    return nftMetadata;
  };

  const getNftData = async (publicKey) => {
    let nftData = await getNft(publicKey);
    console.log(nftData);
    let nftMintName = [];

    nftData.map(async (nft) => {
      let res = await fetch(nft.data.uri);
      let data = await res.json();
      let nftObj = {
        name: nft.data.name,
        mint: nft.mint,
        image: data.image,
      };
      nftMintName.push(nftObj);
      console.log(nftMintName);
      setNftObjData(nftMintName);
    });
  };



  //associated account 
  const NFTassociatedAccountHandler = (pubKey, mint) => {
    const tokenAccount = getOrCreateAssociatedAccount(pubKey, mint, pubKey)
    console.log(tokenAccount);
    setNFTtoken(tokenAccount);
  }

  const WSOLassociatedAccountHandler = (pubKey) => {
    const tokenAccount = getOrCreateAssociatedAccount(pubKey, NATIVE_MINT, pubKey)
    console.log(tokenAccount.toString());
    setWSOLtoken(tokenAccount);
  }
  const selectNft = (mintkey) => {
    setMint(mintkey)

  }

  return (
    <div className="App">
      <h1>Hey: {pubKey ? pubKey.toString() : ""}</h1>
      <br />
      <button onClick={connectWallet}>Connect Here!</button>
      <button onClick={disconnectWallet}>Disconnect Here!</button>
      <br /><br />

      <label>Make offer (SOL): </label>
      <br /><br />
      <button onClick={() => getNft(pubKey)}>get NFTs</button>
      <br />
      <button onClick={() => getNftData(pubKey)}>get NFTs Data</button>

      <br /><br />


      {nftObjData ? (
        <>
          <h3>NFTs!!</h3>
          <ol style={{ listStyle: "none", marginRight: "40px" }}>
            {nftObjData.map((nft) => (
              <li key={nft.mint}>
                <img src={nft.image} onClick={() => selectNft(nft.mint)} />
                <br />
                <br />
                <h5>mint: </h5>
                <a
                  key={nft.mint}
                  href={`https://explorer.solana.com/address/${nft.mint}?cluster=devnet`}
                >
                  {nft.mint}{" "}
                </a>
                <br />
                <br />
              </li>
            ))}
          </ol>
        </>
      ) : (
        <></>
      )}


      <br /><br /><br />

      <input type="text" onChange={(e) => setAmount((e.target.value) * 1000000000)} />

      <br /><br /><br /><br />
      <button onClick={() => user1(pubKey, mint, amount)}>User 1</button>
      <br /><br /><br /><br /><br />
      <button onClick={() => user2(pubKey)}>User 2</button>
      <br /><br /><br /><br /><br />
      <button onClick={() => cancel(pubKey)}>cancel</button>
      <br /><br /><br /><br /><br />
      <button onClick={() => updatePlatformAccounts(pubKey)}>update Accounts</button>

    </div>
  )
}
export default App

/*
import { bob } from './components/bob'


<button onClick = {() => bob}>User 2</button>
*/