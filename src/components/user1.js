import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
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
import { getOrCreateAssociatedAccount } from "./getOrCreateAssociatedAccount";
import { escrowProgramId } from "./id";

const BN = require("bn.js");


export  const getTokenAccountFromMint = async (MintPubKey) => {
  console.log("extract token acc ");

  const dataFromChain = await connection.getTokenLargestAccounts(
    new PublicKey(MintPubKey),
  );
  const tokenAccount = dataFromChain.value.filter((a) => a.amount === '1')[0]
    .address;
  return tokenAccount;
};

export const user1 = async (user, nftmint, expLamports) => {

  console.log(user, "   lister publickey")

  // get token Address for NFT
  const tokenAccount = await getTokenAccountFromMint(nftmint);
  console.log(" token acc ", tokenAccount);

  const amount = expLamports;

  console.log('user! NFT associated account ::', tokenAccount)


  const tempAccount = new Keypair();


  // const createTempTokenAccountIx = SystemProgram.createAccount({
  //   programId: TOKEN_PROGRAM_ID,
  //   space: AccountLayout.span,
  //   lamports: await connection.getMinimumBalanceForRentExemption(
  //     AccountLayout.span
  //   ),
  //   fromPubkey: user,
  //   newAccountPubkey: tempAccount.publicKey,
  // });
  // const initTempAccountIx = Token.createInitAccountInstruction(
  //   TOKEN_PROGRAM_ID,
  //   XMintPub,
  //   tempAccount.publicKey,
  //   user
  // );

  //create escrow account
  const newAcc = new Keypair();

  // const createEscrowAccountIx = SystemProgram.createAccount({
  //   programId: escrowProgramId,
  //   space: ESCROW_ACCOUNT_DATA_LAYOUT.span,
  //   lamports: await connection.getMinimumBalanceForRentExemption(
  //     ESCROW_ACCOUNT_DATA_LAYOUT.span
  //   ),
  //   fromPubkey: user,
  //   newAccountPubkey: newAcc.publicKey
  // });

  //init escrow account


  const initEscrowIx = new TransactionInstruction({
    programId: escrowProgramId,
    keys: [
      { pubkey: user, isSigner: true, isWritable: true },
      {
        pubkey: tokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: nftmint,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: newAcc.publicKey, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      
    ],
    data: Buffer.from(
      Uint8Array.of(0, ...new BN(amount).toArray("le", 8)))
  });

  console.log([newAcc], "new acc keypir.........");

  await sendTxUsingExternalSignature(
    [
      initEscrowIx
    ],
    connection,
    null,
    [newAcc],
    new PublicKey(user)
  );
  await new Promise((resolve) => setTimeout(resolve, 2000));


  console.log(newAcc.publicKey.toString(), "*******Escrow state account account ...");
  //console.log(tempXTokenAccountKeypair.publicKey.toString(), "*******temp account ...");
  console.log("****amount =", amount);

  console.log(
    `✨EscrowBuyNow successfully initialized. user1 is offering 1 NFT for ${amount} lamports✨\n`
  );

};