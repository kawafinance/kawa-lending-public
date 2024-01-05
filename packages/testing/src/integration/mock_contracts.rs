use cosmwasm_std::Empty;
use cw_multi_test::{App, Contract, ContractWrapper};

pub fn mock_app() -> App {
    App::default()
}

pub fn mock_address_provider_contract() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        kawa_address_provider::contract::execute,
        kawa_address_provider::contract::instantiate,
        kawa_address_provider::contract::query,
    );
    Box::new(contract)
}

pub fn mock_lending_contract() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        kawa_lending::contract::execute,
        kawa_lending::contract::instantiate,
        kawa_lending::contract::query,
    );
    Box::new(contract)
}


pub fn mock_oracle_contract() -> Box<dyn Contract<Empty>> {
    let contract: ContractWrapper<_, _, _, _, _, _> = ContractWrapper::new(
        kawa_oracle_wasm::contract::entry::execute,
        kawa_oracle_wasm::contract::entry::instantiate,
        kawa_oracle_wasm::contract::entry::query,
    );
    Box::new(contract)
}
