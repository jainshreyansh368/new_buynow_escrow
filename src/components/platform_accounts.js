import {
    Keypair,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    //Transaction,
    TransactionInstruction,
  } from "@solana/web3.js";
  import { connection } from './connection'
  import { PLATFORM_ACCOUNT_DATA_LAYOUT } from './utils'
  import { sendTxUsingExternalSignature } from './externalwallet'
  // import { getOrCreateAssociatedAccount } from "./getOrCreateAssociatedAccount";

  import { escrowProgramId,  platformUpdateAccountPubkey, treasury_account, team_account } from "./id";
  
  const BN = require("bn.js");

  
  export const updatePlatformAccounts = async (user) => {
  
    console.log(user, " lister publickey")
  
    
   
  //   {
  //     //init escrow account
  
  
  //     const updateAccountsIx = new TransactionInstruction({
  //       programId: escrowProgramId,
  //       keys: [
  //         { pubkey: user, isSigner: true, isWritable: false },
  //         {
  //           pubkey: platformUpdateAccountPubkey,
  //           isSigner: false,
  //           isWritable: true,
  //         },
  //         { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  //         { pubkey: treasury_account, isSigner: false, isWritable: true },
  //         { pubkey: team_account, isSigner: false, isWritable: true },
  
  //       ],
  //       data: Buffer.from(
  //         Uint8Array.of(3, ...new BN(5656).toArray("le", 8), ...new BN(60).toArray("le", 8)))
  //     });
  
  
  //     await sendTxUsingExternalSignature(
  //       [
  //         updateAccountsIx
  //       ],
  //       connection,
  //       null,
  //       [],
  //       new PublicKey(user)
  //     );
  
  //   }
  // }
  
  
  
  

  
  var base_percentage = 200;


    console.log("user: ", user.toString());
  
    const newAcc = new Keypair();
  
    const createUpdateAccountIx = SystemProgram.createAccount({
      programId: escrowProgramId,
      space: PLATFORM_ACCOUNT_DATA_LAYOUT.span,
      lamports: await connection.getMinimumBalanceForRentExemption(
        PLATFORM_ACCOUNT_DATA_LAYOUT.span
      ),
      fromPubkey: user,
      newAccountPubkey: newAcc.publicKey
    });
  
    //init escrow account
  console.log(base_percentage, "base percent ");
  
    const updateAccountsIx = new TransactionInstruction({
      programId: escrowProgramId,
      keys: [
        { pubkey: user, isSigner: true, isWritable: false },
        {
          pubkey: newAcc.publicKey,
          isSigner: false,
          isWritable: true,
        },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: treasury_account, isSigner: false, isWritable: true },
  
      ],
      data: Buffer.from(
        Uint8Array.of(
          3,
          ...new BN(base_percentage).toArray("le", 8),
        //   // ...new BN(treasury_percentage).toArray("le", 8),
        //   ...new BN(precision).toArray("le", 8)
        ))
    });
  
    await sendTxUsingExternalSignature(
      [
        createUpdateAccountIx,
        updateAccountsIx
      ],
      connection,
      null,
      [newAcc],
      new PublicKey(user)
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));
  
  
    console.log(newAcc.publicKey.toString(), "*******update vallhala share account ...");
    //console.log(tempXTokenAccountKeypair.publicKey.toString(), "*******temp account ...");
    
  }
  
