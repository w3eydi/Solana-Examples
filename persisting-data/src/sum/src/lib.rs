use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{account_info::{next_account_info, AccountInfo}, entrypoint,
    entrypoint::ProgramResult, msg, program_error::ProgramError, pubkey::Pubkey};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct SumOfMath {
    pub sum: u32,
}

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello Solana --- From Rust! (sum)");

    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;

    if account.owner != program_id {
        msg!("Account doesn't have correct program id!");
        return Err(ProgramError::IncorrectProgramId);
    }

    msg!("--- Debug Output: ---");
    msg!("Account ID: {}", account.key);
    msg!("Executable: ? {}", account.executable);
    msg!("Lamports: {:#?}", account.lamports);
    msg!("--- Debug output complete! ---");

    msg!("\nAdding 1 to sum...\n");

    let mut math_stuff = SumOfMath::try_from_slice(&account.data.borrow())?;
    math_stuff.sum += 1;
    math_stuff.serialize(&mut &mut account.data.borrow_mut()[..])?;
    msg!("Current sum is now: {}", math_stuff.sum);

    Ok(())
}