use trivex_contract::starkstructs::{Record};
use starknet::ContractAddress;
use trivex_contract::utils::{UserAddress, Amount, TokenAddress};

#[starknet::interface]
pub trait ITrivexAction<TContractState> {
    fn get_balance(self: @TContractState, token_address: TokenAddress, agent_address: UserAddress)-> Amount;
    fn deposit(ref self: TContractState, user_address: UserAddress, amount: Amount, token_address: TokenAddress);
    fn withdraw(ref self: TContractState, user_address: UserAddress, amount: Amount, token_address: TokenAddress);
}