use std::convert::TryInto;
use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult,
    program::invoke, program_error::ProgramError, msg, pubkey::Pubkey, system_instruction
};

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8]
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let payee = next_account_info(accounts_iter)?;

    let amount = input
        .get(..8)
        .and_then(|slice| slice.try_into().ok())
        .map(u64::from_le_bytes)
        .ok_or(ProgramError::InvalidInstructionData)?;

    msg!("\n\nReceived request to transfer {:?} lamports from {:?} to {:?}.\n",
        amount, payer.key, payee.key);
    msg!("\n    Processing transfer...\n\n");

    invoke(
        &system_instruction::transfer(&payer.key, &payee.key,
        amount),
        &[payer.clone(), payee.clone()]
    )?;

    msg!("Transfer completed.");

    Ok(())
}