use cosmwasm_std::{
    from_binary, from_slice,
    testing::{MockQuerier, MOCK_CONTRACT_ADDR},
    Addr, Coin, Decimal, Empty, Querier, QuerierResult, QueryRequest, StdResult, SystemError,
    SystemResult, WasmQuery,
};

use kawa_lending_types::{address_provider, lending, oracle};

use pyth_sdk_cw::{PriceFeedResponse, PriceIdentifier};

use crate::{
    lending_querier::LendingQuerier, mock_address_provider, oracle_querier::OracleQuerier,
    pyth_querier::PythQuerier,
};

pub struct KawaMockQuerier {
    base: MockQuerier<Empty>,
    oracle_querier: OracleQuerier,
    pyth_querier: PythQuerier,
    lending_querier: LendingQuerier,
}

impl Querier for KawaMockQuerier {
    fn raw_query(&self, bin_request: &[u8]) -> QuerierResult {
        let request: QueryRequest<Empty> = match from_slice(bin_request) {
            Ok(v) => v,
            Err(e) => {
                return SystemResult::Err(SystemError::InvalidRequest {
                    error: format!("Parsing query request: {e}"),
                    request: bin_request.into(),
                })
            }
        };

        self.handle_query(&request)
    }
}

impl KawaMockQuerier {
    pub fn new(base: MockQuerier<Empty>) -> Self {
        KawaMockQuerier {
            base,
            oracle_querier: OracleQuerier::default(),
            pyth_querier: PythQuerier::default(),
            lending_querier: LendingQuerier::default(),
        }
    }

    /// Set new balances for contract address
    pub fn set_contract_balances(&mut self, contract_balances: &[Coin]) {
        let contract_addr = Addr::unchecked(MOCK_CONTRACT_ADDR);
        self.base.update_balance(contract_addr.to_string(), contract_balances.to_vec());
    }

    pub fn set_oracle_price(&mut self, denom: &str, price: Decimal) {
        self.oracle_querier.prices.insert(denom.to_string(), price);
    }

    pub fn set_pyth_price(&mut self, id: PriceIdentifier, price: PriceFeedResponse) {
        self.pyth_querier.prices.insert(id, price);
    }

    pub fn set_lending_market(&mut self, market: lending::Market) {
        self.lending_querier.markets.insert(market.denom.clone(), market);
    }

    pub fn set_lending_user_collateral(
        &mut self,
        user: impl Into<String>,
        collateral: lending::UserCollateralResponse,
    ) {
        self.lending_querier
            .users_denoms_collaterals
            .insert((user.into(), collateral.denom.clone()), collateral);
    }

    pub fn set_lending_user_position(
        &mut self,
        user_address: String,
        position: lending::UserPositionResponse,
    ) {
        self.lending_querier.users_positions.insert(user_address, position);
    }

    pub fn handle_query(&self, request: &QueryRequest<Empty>) -> QuerierResult {
        match &request {
            QueryRequest::Wasm(WasmQuery::Smart {
                contract_addr,
                msg,
            }) => {
                let contract_addr = Addr::unchecked(contract_addr);

                // Address Provider Queries
                let parse_address_provider_query: StdResult<address_provider::QueryMsg> =
                    from_binary(msg);
                if let Ok(address_provider_query) = parse_address_provider_query {
                    return mock_address_provider::handle_query(
                        &contract_addr,
                        address_provider_query,
                    );
                }

                // Oracle Queries
                let parse_oracle_query: StdResult<oracle::QueryMsg> = from_binary(msg);
                if let Ok(oracle_query) = parse_oracle_query {
                    return self.oracle_querier.handle_query(&contract_addr, oracle_query);
                }

                // Pyth Queries
                if let Ok(pyth_query) = from_binary::<pyth_sdk_cw::QueryMsg>(msg) {
                    return self.pyth_querier.handle_query(&contract_addr, pyth_query);
                }

                // Lending Queries
                if let Ok(lending_query) = from_binary::<lending::QueryMsg>(msg) {
                    return self.lending_querier.handle_query(lending_query);
                }

                // Pyth Queries
                if let Ok(pyth_query) = from_binary::<pyth_sdk_cw::QueryMsg>(msg) {
                    return self.pyth_querier.handle_query(&contract_addr, pyth_query);
                }

                panic!("[mock]: Unsupported wasm query: {msg:?}");
            }

            _ => self.base.handle_query(request),
        }
    }
}
