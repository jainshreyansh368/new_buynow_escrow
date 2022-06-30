//user 2 --> NFT owner
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { connection } from "./connection";
import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  Keypair
} from "@solana/web3.js";

import {
  ESCROW_ACCOUNT_DATA_LAYOUT,
  PLATFORM_ACCOUNT_DATA_LAYOUT
} from "./utils";
import { getOrCreateAssociatedAccount } from './getOrCreateAssociatedAccount';
import { sendTxUsingExternalSignature } from './externalwallet';
import { fetchMetadata } from "./fetchmetdatafrommint";
import { buynow_state_account, escrowProgramId, platformUpdateAccountPubkey, METADATA_PROGRAM_ID, coin_mint } from "./id";
const BN = require("bn.js");

export const user2 = async (user) => {
  console.log(user, "chceck user");

  const systemProgramId = new PublicKey("11111111111111111111111111111111")

  // const platfrom_treasury = new PublicKey("Gc9SPfQUXsRjiHx3Fd7YQqNTcwivgwzxLi5Hb8JyPTdV")
  // const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")

  // vallhala accounts data 
  // const platformUpdateAccountPubkey = new PublicKey("Hyp4bHajuqvuEqf5Azj6UGCRLbirENgr2JZiAKg6XYP5");



  //fetch  buynow data 
  const escrowAccount = await connection.getAccountInfo(
    buynow_state_account
  );

  if (escrowAccount === null) {
    console.log("Could not find escrow at given address!");
    //process.exit(1);
  }
  console.log(escrowAccount, "*****escrow Account ..");
  //console.log(escrowAccount.publicKey.toString(),".....****Escrow Account key ....")

  const encodedEscrowState = escrowAccount && escrowAccount.data;
  const decodedEscrowLayout = ESCROW_ACCOUNT_DATA_LAYOUT.decode(
    encodedEscrowState
  );
  const mint = new PublicKey(decodedEscrowLayout.mintKey);
  console.log(mint.toBase58(), "****Mint key****")

  // buyer's receving account
  const users_solg_tokenAccount = await getOrCreateAssociatedAccount(user, coin_mint, user)
  // //console.log("user 2 receiving token account  : ",tokenAccount);

  const escrowState = {
    escrowAccountPubkey: buynow_state_account,
    isInitialized: !!decodedEscrowLayout.isInitialized,
    initializerAccountPubkey: new PublicKey(
      decodedEscrowLayout.sellerPubkey
    ),
    XTokenTempAccountPubkey: new PublicKey(
      decodedEscrowLayout.tokenAccountPubkey
    ),
    TokenMintKey: new PublicKey(
      decodedEscrowLayout.mintKey
    ),
    expectedAmount: new BN(decodedEscrowLayout.expectedAmount, 10, "le"),
  };





  // val accounts data fetch

  //fetch data
  const valAccount = await connection.getAccountInfo(
    platformUpdateAccountPubkey
  );

  if (valAccount === null) {
    console.log("Could not platfrom shaare accounts at given address!");
    //process.exit(1);
  }
  console.log(valAccount, "*****share Account ..");
  //console.log(valAccount.publicKey.toString(),".....****Escrow Account key ....")

  const encodedValAccState = valAccount && valAccount.data;
  const decodedValAccLayout = PLATFORM_ACCOUNT_DATA_LAYOUT.decode(
    encodedValAccState
  );

  const valAccState = {
    vallhalaUpdateAccountPubkey: platformUpdateAccountPubkey,
    isInitialized: !!decodedValAccLayout.isInitialized,
    treasury_account: new PublicKey(
      decodedValAccLayout.treasuryAccount
    ),

    treasury_share: new BN(decodedValAccLayout.treasuryShare, 10, "le"),
  };


  //metadata pda account
  const metadataAccount = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      METADATA_PROGRAM_ID,
    )
  )[0];


  const PDA = await PublicKey.findProgramAddress(
    [Buffer.from("escrow")],
    escrowProgramId
  );

  const seller_token_account = await getOrCreateAssociatedAccount(escrowState.initializerAccountPubkey, coin_mint, user);
  const treasury_token_account = await getOrCreateAssociatedAccount(valAccState.treasury_account, coin_mint, user);
  //fetch creators

  const nftMetadata = await fetchMetadata(mint);
  console.log(nftMetadata.length > 0 && nftMetadata[0] && nftMetadata[0].data && nftMetadata[0].data.creators.length > 0 && nftMetadata[0].data.creators, "nft metadata from mint ");
  const addressArray = nftMetadata.length > 0 && nftMetadata[0] && nftMetadata[0].data && nftMetadata[0].data.creators.length > 0 && nftMetadata[0].data.creators.map(e => ({ address: e.address }))
  console.log("addressArray", addressArray) 
  let ata_array = [];
  console.log("*************************************************************************")
    console.log("********", addressArray.length)
  //* Take the creators array
  //* Run a loop on the creators array
  console.log(user)
  for(let i=0; i < addressArray.length; i++){
      //TODO: Derive the Ata account 
      console.log("lopp address", addressArray[i].address);

      let a = await  getOrCreateAssociatedAccount(addressArray[i].address, coin_mint, user)
      console.log(a);
      ata_array.push(a);
      // await new Promise((resolve) => setTimeout(resolve, 2000));

  }
  // Save ATA in a new array containing the ATA
  //console.log(       , "asdasdasdasd"    );
  // let a= await getOrCreateAssociatedAccount( addressArray[1], coin_mint, user);
  // console.log("a",a);
  const keystest = [
    { pubkey: user, isSigner: true, isWritable: false },
    { pubkey: users_solg_tokenAccount, isSigner: false, isWritable: true },
    {
      pubkey: escrowState.XTokenTempAccountPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: escrowState.initializerAccountPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: seller_token_account,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: escrowState.TokenMintKey,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: buynow_state_account, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: systemProgramId, isSigner: false, isWritable: false },
    { pubkey: PDA[0], isSigner: false, isWritable: false },
    { pubkey: metadataAccount, isSigner: false, isWritable: false },

    { pubkey: platformUpdateAccountPubkey, isSigner: false, isWritable: true },
    {
      pubkey: treasury_token_account,
      isSigner: false,
      isWritable: true,
    },
 
  ]
  console.log(keystest);


  const newArr = [
    ...keystest, ...ata_array.map(e => ({ pubkey: new PublicKey(e), isSigner: false, isWritable: true })
    )
  ];

  console.log(newArr);


  // sending transaction

  const exchangeInstruction = new TransactionInstruction({
    programId: escrowProgramId,
    data: Buffer.from(
      Uint8Array.of(1, ...new BN(1).toArray("le", 8))
    ),
    keys: newArr,
  });


  console.log("Sending Bob's transaction...");
  await sendTxUsingExternalSignature(
    [exchangeInstruction],
    connection,
    null,
    [],
    user,
  );

  // sleep to allow time to update
  await new Promise((resolve) => setTimeout(resolve, 2000));


  if (
    (await connection.getAccountInfo(escrowState.XTokenTempAccountPubkey)) !==
    null
  ) {
    console.log("Temporary X token account has not been closed");
  }

  console.log(
    "✨Trade successfully executed. All temporary accounts closed✨\n"
  );
}
