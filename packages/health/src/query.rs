use cosmwasm_std::{Addr, Decimal, QuerierWrapper, StdResult};
use kawa_lending_types::{
    oracle::{self, PriceResponse},
    lending::{self, Market},
};

pub struct KawaQuerier<'a> {
    querier: &'a QuerierWrapper<'a>,
    oracle_addr: &'a Addr,
    lending_addr: &'a Addr,
}

impl<'a> KawaQuerier<'a> {
    pub fn new(
        querier: &'a QuerierWrapper,
        oracle_addr: &'a Addr,
        lending_addr: &'a Addr,
    ) -> Self {
        KawaQuerier {
            querier,
            oracle_addr,
            lending_addr,
        }
    }

    pub fn query_market(&self, denom: &str) -> StdResult<Market> {
        self.querier.query_wasm_smart(
            self.lending_addr,
            &lending::QueryMsg::Market {
                denom: denom.to_string(),
            },
        )
    }

    pub fn query_price(&self, denom: &str) -> StdResult<Decimal> {
        let PriceResponse {
            price,
            ..
        } = self.querier.query_wasm_smart(
            self.oracle_addr,
            &oracle::QueryMsg::Price {
                denom: denom.to_string(),
            },
        )?;
        Ok(price)
    }
}
