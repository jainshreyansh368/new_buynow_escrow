use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};

#[derive(Debug, PartialEq, Copy, Clone)]
pub struct Escrow {
    pub is_initialized: bool,
    pub seller_pubkey: Pubkey,
    pub token_account_pubkey: Pubkey,
    pub mint_key: Pubkey,
    pub expected_amount: u64,
}
impl Sealed for Escrow {}
impl IsInitialized for Escrow {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Pack for Escrow {
    const LEN: usize = 105;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Escrow::LEN];
        let (is_initialized, seller_pubkey, token_account_pubkey, mint_key, expected_amount) =
            array_refs![src, 1, 32, 32, 32, 8];
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };
        Ok(Escrow {
            is_initialized,
            seller_pubkey: Pubkey::new_from_array(*seller_pubkey),
            token_account_pubkey: Pubkey::new_from_array(*token_account_pubkey),
            mint_key: Pubkey::new_from_array(*mint_key),
            expected_amount: u64::from_le_bytes(*expected_amount),
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Escrow::LEN];
        let (
            is_initialized_dst,
            seller_pubkey_dst,
            token_account_pubkey_dst,
            mint_key_dst,
            expected_amount_dst,
        ) = mut_array_refs![dst, 1, 32, 32, 32, 8];
        let Escrow {
            is_initialized,
            seller_pubkey,
            token_account_pubkey,
            mint_key,
            expected_amount,
        } = self;
        is_initialized_dst[0] = *is_initialized as u8;
        seller_pubkey_dst.copy_from_slice(seller_pubkey.as_ref());
        token_account_pubkey_dst.copy_from_slice(token_account_pubkey.as_ref());
        mint_key_dst.copy_from_slice(mint_key.as_ref());
        *expected_amount_dst = expected_amount.to_le_bytes();
    }
}

#[derive(Debug, PartialEq, Copy, Clone)]
pub struct ValAccounts {
    pub is_initialized: bool,
    pub val_treasury: Pubkey,
    pub base_percentage: u64,
}

impl Sealed for ValAccounts {}
impl IsInitialized for ValAccounts {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Pack for ValAccounts {
    const LEN: usize = 41;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, ValAccounts::LEN];
        let (is_initialized, val_treasury, base_percentage) = array_refs![src, 1, 32, 8];
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };
        Ok(ValAccounts {
            is_initialized,
            val_treasury: Pubkey::new_from_array(*val_treasury),
            base_percentage: u64::from_le_bytes(*base_percentage),
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, ValAccounts::LEN];
        let (is_initialized_dst, val_treasury_dst, base_percentage_dst) =
            mut_array_refs![dst, 1, 32, 8];
        let ValAccounts {
            is_initialized,
            val_treasury,
            base_percentage,
        } = self;
        is_initialized_dst[0] = *is_initialized as u8;
        val_treasury_dst.copy_from_slice(val_treasury.as_ref());
        *base_percentage_dst = base_percentage.to_le_bytes();
    }
}
