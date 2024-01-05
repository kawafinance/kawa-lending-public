use std::marker::PhantomData;

use cosmwasm_std::{
    testing::{mock_env, MockApi, MockQuerier, MockStorage},
    DepsMut, OwnedDeps,
};
use kawa_oracle_wasm::{contract::entry, WasmPriceSourceUnchecked};
use kawa_lending_types::oracle::{ExecuteMsg, InstantiateMsg, WasmOracleCustomInitParams};
use kawa_testing::{mock_info, KawaMockQuerier};

pub fn setup_test(
    astroport_factory_address: &str,
) -> OwnedDeps<MockStorage, MockApi, KawaMockQuerier> {
    let mut deps = OwnedDeps::<_, _, _> {
        storage: MockStorage::default(),
        api: MockApi::default(),
        querier: KawaMockQuerier::new(MockQuerier::new(&[])),
        custom_query_type: PhantomData,
    };

    // instantiate the oracle contract
    entry::instantiate(
        deps.as_mut(),
        mock_env(),
        mock_info("owner"),
        InstantiateMsg {
            owner: "owner".to_string(),
            base_denom: "uosmo".to_string(),
            custom_init: Some(WasmOracleCustomInitParams {
                astroport_factory: astroport_factory_address.to_string(),
            }),
        },
    )
    .unwrap();

    deps
}

pub fn set_price_source(deps: DepsMut, denom: &str, price_source: WasmPriceSourceUnchecked) {
    entry::execute(
        deps,
        mock_env(),
        mock_info("owner"),
        ExecuteMsg::SetPriceSource {
            denom: denom.to_string(),
            price_source,
        },
    )
    .unwrap();
}
