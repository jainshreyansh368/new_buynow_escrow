
use solana_program::program_error::ProgramError;
use std::convert::TryInto;
// use borsh::{BorshDeserialize, BorshSerialize};

// use crate::error::EscrowError::InvalidInstruction;
// use std::io::Read;


pub enum EscrowInstruction {
    /// Starts the trade by creating and populating an escrow account and transferring ownership of the given temp token account to the PDA
    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The account of the person initializing the escrow
    /// 1. `[writable]` token account holding NFT by the initializer
    /// 2. `[]` Mint address of the token
    /// 3. `[writable]` The escrow account, it will hold all necessary info about the trade.
    /// 4. `[]` The rent sysvar
    /// 5. `[]` The token program
    ListToken {
        /// The amount party A expects to receive of token Y
        amount: u64,
    },

    /// Accepts a trade
    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The account of the person taking the trade
    /// 1. `[writable]` token account holding the token
    /// 2. `[writable]` seller account
    /// 3. `[writable]` mint key
    /// 4. `[writable]` The escrow account holding the trade info
    /// 5. `[]` The token program
    /// 7. `[]` The system program
    /// 8. `[]` The PDA account
    /// 9. `[]` The metadata account
    /// 10. `[writable]` The valhalla share update account 
    /// 11. `[writable]` The valhalla treasury account 
    /// 12. `[writable]` The valhalla team account 
    /// 13. `[writable]` The creators accounts

    Exchange {
        /// the amount the taker expects to be paid in the other token, as a u64 because that's the max possible supply of a token
        amount: u64,
        //arg_royalties_share: u64,
    },
    
    /// Cancels a trade
    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` Seller account 
    /// 1. `[writable]` token account holding the token
    /// 2. `[writable]` escrow account holding trade info
    /// 3. `[]` token program id
    /// 4. `[]` The PDA account
    Cancel,

    /// Updates Valhalla accounts and shares
    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` update auth 
    /// 1. `[writable]` valhalla update account
    /// 2. `[]` The rent sysvar
    /// 3. `[writable]` valhalla treasury account
    /// 4. `[writable]` valhalla team account
    UpdateValAccount{
        amount: u64,
    },
}

impl EscrowInstruction {
    /// Unpacks a byte buffer into a [EscrowInstruction](enum.EscrowInstruction.html).
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (tag, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

        Ok(match tag {
            0 => Self::ListToken {
                amount: Self::unpack_amount(rest)?,
            },
            1 => Self::Exchange {
                amount: Self::unpack_amount(rest)?,
            },
            2 => Self::Cancel,
            3 => Self::UpdateValAccount {
                amount: Self::unpack_amount(rest)?,
            },
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }

    fn unpack_amount(input: &[u8]) -> Result<u64, ProgramError> {
        let amount = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(ProgramError::InvalidInstructionData)?;
        Ok(amount)
    }
}