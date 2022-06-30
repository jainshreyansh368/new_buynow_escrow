import { connection } from "./connection"
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import {Keypair,PublicKey,SystemProgram} from "@solana/web3.js"
import { sendTxUsingExternalSignature } from "./externalwallet"

export const createWrappedNativeAccount = async(
    owner,
    amount,
  ) => {
    // Allocate memory for the account
    const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
      connection,
    );

    const NATIVE_MINT = new PublicKey("So11111111111111111111111111111111111111112")

    //Create a new account
    const newAccount = Keypair.generate();
    //const transaction = new Transaction();
  
  //  instead of creating new token account create associated acc and transfer Wsol to that
    
    const createIx = SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: newAccount.publicKey,
        lamports: balanceNeeded,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID
      });
    
    //const newAccount = new PublicKey("GNicbok748indRkqsy5875cKzur73s9THtz1ozi7i4yB");
    // Send lamports to it (these will be wrapped into native tokens by the token program)
    
    const transferIx = SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: newAccount.publicKey,
        lamports: amount,
      });
    

    // initialize newaccount.. asign wrapAccount mintId
    
    const initIx = Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        NATIVE_MINT,
        newAccount.publicKey,
        owner,
      );

    // Send the three instructions
    await sendTxUsingExternalSignature(
      [createIx,
        transferIx,
        initIx],
      connection,
      null,
      [newAccount],
      owner,
    );

    console.log(newAccount.publicKey.toString(), "******new account")
    return (newAccount.publicKey)
    //console.log(newAccount.publicKey.base58(), "************* new account base 58")


  }
  /*

  import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  //Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  //Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { connection } from './connection'
import { ESCROW_ACCOUNT_DATA_LAYOUT } from './utils'
import { sendTxUsingExternalSignature } from './externalwallet'
const BN = require("bn.js");
//import { BN } from "../../../../.cache/typescript/4.4/node_modules/@types/bn.js";

 
export const user1 = async(user) => {
    const escrowProgramId = new PublicKey("5z6NS2s5qUEXw7Uc1ecxjZKAAsXvqxaKnMSToe7nkuMT")
//ANDHRIMIR -- GAME CARDS
    const aliceXAccountPub = new PublicKey("6yD3t7LhPMrqpxbBuW9yKyAT1W7HghQ6dU3Dqi1oGyTd")
//aliceYAccountPub
//Heidrum    YZgcQw9RLNzq3o2MMNAsCXn2xayeUCcxvAJxGmoyUaL
    const aliceYAccountPub = new PublicKey("FXNWW1dibJ5PWtAamBPio9gEs1ASoR8FCtfPoVZ5Lt4o")
     
    const XMintPub = new PublicKey("So11111111111111111111111111111111111111112")
    const alicePub = user ;
    const amount= 1;


// creating temp account 
//   const tempXTokenAccountKeypair = new Keypair();
  
//   const createTempTokenAccountIx = SystemProgram.createAccount({
//     programId: TOKEN_PROGRAM_ID,
//     space: AccountLayout.span,
//     lamports: await connection.getMinimumBalanceForRentExemption(
//       AccountLayout.span
//     ),
//     fromPubkey: alicePub,
//     newAccountPubkey: tempXTokenAccountKeypair.publicKey,
//   });

// //init temp account
//   const initTempAccountIx = Token.createInitAccountInstruction(
//     TOKEN_PROGRAM_ID,
//     XMintPub,
//     tempXTokenAccountKeypair.publicKey,
//     alicePub
//   );

// //transfer wrapped tokens to temp account
//     const transferXTokensToTempAccIx = Token.createTransferInstruction(
//         TOKEN_PROGRAM_ID,
//         aliceXAccountPub,
//         tempXTokenAccountKeypair.publicKey,
//         alicePub,
//         [],
//         50000000//.05 sol
//       );

//create escrow account

      const newAcc = new Keypair();

    const createEscrowAccountIx = SystemProgram.createAccount({
        programId: escrowProgramId,
        space: ESCROW_ACCOUNT_DATA_LAYOUT.span,
        lamports: await connection.getMinimumBalanceForRentExemption(
          ESCROW_ACCOUNT_DATA_LAYOUT.span
        ),
        fromPubkey: alicePub,
        newAccountPubkey: newAcc.publicKey
      });

//init escrow account


const initEscrowIx = new TransactionInstruction({
  programId: escrowProgramId,
  keys: [
    { pubkey: alicePub, isSigner: true, isWritable: false },
    {
      pubkey: aliceXAccountPub,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: aliceYAccountPub,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: newAcc.publicKey, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ],
  data: Buffer.from(
    Uint8Array.of(0, ...new BN(1).toArray("le", 8)))
});

      await sendTxUsingExternalSignature(
        [
        createEscrowAccountIx,
        initEscrowIx
        ],
        connection,
        null,
        [newAcc],
        new PublicKey(alicePub)
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));


     // console.log((aliceXAccountPub.publicKey.toString()), "*******Wrapped SOL token account..")
      console.log(newAcc.publicKey.toString(), "*******new account ...");
      //console.log("****amount = 50000000 .......")


  // sleep to allow time to update
 // await new Promise((resolve) => setTimeout(resolve, 4000));
  const escrowAccount = await connection.getAccountInfo(
    newAcc.publicKey
  );
  console.log(escrowAccount, "******Escrow account......")

  if (escrowAccount === null || escrowAccount.data.length === 0) {
    console.log("Escrow state account has not been initialized properly");
  }

  const encodedEscrowState = escrowAccount.data;
  const decodedEscrowState = ESCROW_ACCOUNT_DATA_LAYOUT.decode(
    encodedEscrowState
  );

  if (!decodedEscrowState.isInitialized) {
    console.log("Escrow state initialization flag has not been set");
    //process.exit(1);
  } else if (
    !new PublicKey(decodedEscrowState.initializerPubkey).equals(alicePub)
  ) {
    console.log(
      "InitializerPubkey has not been set correctly / not been set to Alice's public key"
    );
    process.exit(1);
  } else if (
    !new PublicKey(
      decodedEscrowState.initializerReceivingTokenAccountPubkey
    ).equals(aliceYAccountPub)
  ) { 
    console.log(
      "initializerReceivingTokenAccountPubkey has not been set correctly / not been set to Alice's Y public key"
    );
    process.exit(1);
  }
  //  else if (
  //   !new PublicKey(decodedEscrowState.initializerTempTokenAccountPubkey).equals(
  //     aliceXAccountPub.publicKey
  //   )
  //)
  //  {
  //   console.log(
  //     "initializerTempTokenAccountPubkey has not been set correctly / not been set to temp X token account public key"
  //   );
  //   process.exit(1);
  // }

  //console.log(escrowAccount.publicKey.toString(),".....****Escrow Account key ....")

  console.log(
    `✨Escrow successfully initialized. Alice is offering ${amount}X for ${amount}Y✨\n`
  );

  console.log(
    escrowAccount,"*****Escrow account...."
  );
  console.log("");


};
*/