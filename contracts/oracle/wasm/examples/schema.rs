use cosmwasm_schema::write_api;
use kawa_oracle_wasm::WasmPriceSourceUnchecked;
use kawa_lending_types::oracle::{
    msg::{ExecuteMsg, InstantiateMsg, QueryMsg},
    WasmOracleCustomExecuteMsg, WasmOracleCustomInitParams,
};

fn main() {
    write_api! {
        instantiate: InstantiateMsg<WasmOracleCustomInitParams>,
        execute: ExecuteMsg<WasmPriceSourceUnchecked, WasmOracleCustomExecuteMsg>,
        query: QueryMsg,
    }
}
