#![allow(dead_code)]

use std::mem::take;

use anyhow::Result as AnyResult;
use cosmwasm_std::{Addr, Coin, Decimal, Empty, StdResult, Uint128};
use cw_multi_test::{App, AppResponse, BankSudo, BasicApp, Executor, SudoMsg};
use kawa_lending_types::{
    address_provider::{self, KawaAddressType},
    lending::{
        self, CreateOrUpdateConfig, InitOrUpdateAssetParams, Market,
        UncollateralizedLoanLimitResponse, UserCollateralResponse, UserDebtResponse,
        UserPositionResponse,
    },
    oracle,
};

use crate::integration::mock_contracts::{
    mock_address_provider_contract, mock_lending_contract, mock_oracle_contract,
};

pub struct MockEnv {
    pub app: App,
    pub owner: Addr,
    pub address_provider: AddressProvider,
    pub oracle: Oracle,
    pub lending: Lending,
}

#[derive(Clone)]
pub struct AddressProvider {
    pub contract_addr: Addr,
}

#[derive(Clone)]
pub struct Oracle {
    pub contract_addr: Addr,
}

#[derive(Clone)]
pub struct Lending {
    pub contract_addr: Addr,
}

impl MockEnv {
    pub fn increment_by_blocks(&mut self, num_of_blocks: u64) {
        self.app.update_block(|block| {
            block.height += num_of_blocks;
            // assume block time = 6 sec
            block.time = block.time.plus_seconds(num_of_blocks * 6);
        })
    }

    pub fn increment_by_time(&mut self, seconds: u64) {
        self.app.update_block(|block| {
            block.height += seconds / 6;
            // assume block time = 6 sec
            block.time = block.time.plus_seconds(seconds);
        })
    }

    pub fn fund_account(&mut self, addr: &Addr, coins: &[Coin]) {
        self.app
            .sudo(SudoMsg::Bank(BankSudo::Mint {
                to_address: addr.to_string(),
                amount: coins.to_vec(),
            }))
            .unwrap();
    }

    pub fn query_balance(&self, addr: &Addr, denom: &str) -> StdResult<Coin> {
        self.app.wrap().query_balance(addr, denom)
    }
}

impl Lending {
    pub fn init_asset(&self, env: &mut MockEnv, denom: &str, params: InitOrUpdateAssetParams) {
        env.app
            .execute_contract(
                env.owner.clone(),
                self.contract_addr.clone(),
                &lending::ExecuteMsg::InitAsset {
                    denom: denom.to_string(),
                    params,
                },
                &[],
            )
            .unwrap();
    }

    pub fn deposit(&self, env: &mut MockEnv, sender: &Addr, coin: Coin) -> AnyResult<AppResponse> {
        env.app.execute_contract(
            sender.clone(),
            self.contract_addr.clone(),
            &lending::ExecuteMsg::Deposit {
                on_behalf_of: None,
            },
            &[coin],
        )
    }

    pub fn borrow(
        &self,
        env: &mut MockEnv,
        sender: &Addr,
        denom: &str,
        amount: u128,
    ) -> AnyResult<AppResponse> {
        env.app.execute_contract(
            sender.clone(),
            self.contract_addr.clone(),
            &lending::ExecuteMsg::Borrow {
                denom: denom.to_string(),
                amount: amount.into(),
                recipient: None,
            },
            &[],
        )
    }

    pub fn repay(&self, env: &mut MockEnv, sender: &Addr, coin: Coin) -> AnyResult<AppResponse> {
        env.app.execute_contract(
            sender.clone(),
            self.contract_addr.clone(),
            &lending::ExecuteMsg::Repay {
                on_behalf_of: None,
            },
            &[coin],
        )
    }

    pub fn withdraw(
        &self,
        env: &mut MockEnv,
        sender: &Addr,
        denom: &str,
        amount: Option<Uint128>,
    ) -> AnyResult<AppResponse> {
        env.app.execute_contract(
            sender.clone(),
            self.contract_addr.clone(),
            &lending::ExecuteMsg::Withdraw {
                denom: denom.to_string(),
                amount,
                recipient: None,
            },
            &[],
        )
    }

    pub fn liquidate(
        &self,
        env: &mut MockEnv,
        liquidator: &Addr,
        user: &Addr,
        collateral_denom: &str,
        coin: Coin,
    ) -> AnyResult<AppResponse> {
        env.app.execute_contract(
            liquidator.clone(),
            self.contract_addr.clone(),
            &lending::ExecuteMsg::Liquidate {
                user: user.to_string(),
                collateral_denom: collateral_denom.to_string(),
                recipient: None,
            },
            &[coin],
        )
    }

    pub fn update_uncollateralized_loan_limit(
        &self,
        env: &mut MockEnv,
        sender: &Addr,
        user: &Addr,
        denom: &str,
        new_limit: Uint128,
    ) -> AnyResult<AppResponse> {
        env.app.execute_contract(
            sender.clone(),
            self.contract_addr.clone(),
            &lending::ExecuteMsg::UpdateUncollateralizedLoanLimit {
                user: user.to_string(),
                denom: denom.to_string(),
                new_limit,
            },
            &[],
        )
    }

    pub fn query_market(&self, env: &mut MockEnv, denom: &str) -> Market {
        env.app
            .wrap()
            .query_wasm_smart(
                self.contract_addr.clone(),
                &lending::QueryMsg::Market {
                    denom: denom.to_string(),
                },
            )
            .unwrap()
    }

    pub fn query_user_debt(&self, env: &mut MockEnv, user: &Addr, denom: &str) -> UserDebtResponse {
        env.app
            .wrap()
            .query_wasm_smart(
                self.contract_addr.clone(),
                &lending::QueryMsg::UserDebt {
                    user: user.to_string(),
                    denom: denom.to_string(),
                },
            )
            .unwrap()
    }

    pub fn query_user_collateral(
        &self,
        env: &mut MockEnv,
        user: &Addr,
        denom: &str,
    ) -> UserCollateralResponse {
        env.app
            .wrap()
            .query_wasm_smart(
                self.contract_addr.clone(),
                &lending::QueryMsg::UserCollateral {
                    user: user.to_string(),
                    denom: denom.to_string(),
                },
            )
            .unwrap()
    }

    pub fn query_user_position(&self, env: &mut MockEnv, user: &Addr) -> UserPositionResponse {
        env.app
            .wrap()
            .query_wasm_smart(
                self.contract_addr.clone(),
                &lending::QueryMsg::UserPosition {
                    user: user.to_string(),
                },
            )
            .unwrap()
    }

    pub fn query_scaled_liquidity_amount(&self, env: &mut MockEnv, coin: Coin) -> Uint128 {
        env.app
            .wrap()
            .query_wasm_smart(
                self.contract_addr.clone(),
                &lending::QueryMsg::ScaledLiquidityAmount {
                    denom: coin.denom,
                    amount: coin.amount,
                },
            )
            .unwrap()
    }

    pub fn query_scaled_debt_amount(&self, env: &mut MockEnv, coin: Coin) -> Uint128 {
        env.app
            .wrap()
            .query_wasm_smart(
                self.contract_addr.clone(),
                &lending::QueryMsg::ScaledDebtAmount {
                    denom: coin.denom,
                    amount: coin.amount,
                },
            )
            .unwrap()
    }

    pub fn query_uncollateralized_loan_limit(
        &self,
        env: &mut MockEnv,
        user: &Addr,
        denom: &str,
    ) -> UncollateralizedLoanLimitResponse {
        env.app
            .wrap()
            .query_wasm_smart(
                self.contract_addr.clone(),
                &lending::QueryMsg::UncollateralizedLoanLimit {
                    user: user.to_string(),
                    denom: denom.to_string(),
                },
            )
            .unwrap()
    }
}

pub struct MockEnvBuilder {
    app: BasicApp,
    admin: Option<String>,
    owner: Addr,
    emergency_owner: Addr,

    chain_prefix: String,
    kawa_denom: String,
    base_denom: String,
    base_denom_decimals: u8,
    close_factor: Decimal,

    // rewards-collector params
    safety_tax_rate: Decimal,
    safety_fund_denom: String,
    fee_collector_denom: String,
    slippage_tolerance: Decimal,

    pyth_contract_addr: String,
}

impl MockEnvBuilder {
    pub fn new(admin: Option<String>, owner: Addr) -> Self {
        Self {
            app: App::default(),
            admin,
            owner: owner.clone(),
            emergency_owner: owner,
            chain_prefix: "".to_string(), // empty prefix for multitest because deployed contracts have addresses such as contract1, contract2 etc which are invalid in address-provider
            kawa_denom: "umars".to_string(),
            base_denom: "uosmo".to_string(),
            base_denom_decimals: 6u8,
            close_factor: Decimal::percent(80),
            safety_tax_rate: Decimal::percent(50),
            safety_fund_denom: "uusdc".to_string(),
            fee_collector_denom: "uusdc".to_string(),
            slippage_tolerance: Decimal::percent(5),
            pyth_contract_addr: "osmo1svg55quy7jjee6dn0qx85qxxvx5cafkkw4tmqpcjr9dx99l0zrhs4usft5"
                .to_string(), // correct bech32 addr to pass validation
        }
    }

    pub fn chain_prefix(&mut self, prefix: &str) -> &mut Self {
        self.chain_prefix = prefix.to_string();
        self
    }

    pub fn kawa_denom(&mut self, denom: &str) -> &mut Self {
        self.kawa_denom = denom.to_string();
        self
    }

    pub fn base_denom(&mut self, denom: &str) -> &mut Self {
        self.base_denom = denom.to_string();
        self
    }

    pub fn close_factor(&mut self, percentage: Decimal) -> &mut Self {
        self.close_factor = percentage;
        self
    }

    pub fn safety_tax_rate(&mut self, percentage: Decimal) -> &mut Self {
        self.safety_tax_rate = percentage;
        self
    }

    pub fn safety_fund_denom(&mut self, denom: &str) -> &mut Self {
        self.safety_fund_denom = denom.to_string();
        self
    }

    pub fn fee_collector_denom(&mut self, denom: &str) -> &mut Self {
        self.fee_collector_denom = denom.to_string();
        self
    }

    pub fn slippage_tolerance(&mut self, percentage: Decimal) -> &mut Self {
        self.slippage_tolerance = percentage;
        self
    }

    pub fn pyth_contract_addr(&mut self, pyth_contract_addr: Addr) -> &mut Self {
        self.pyth_contract_addr = pyth_contract_addr.to_string();
        self
    }

    pub fn build(&mut self) -> MockEnv {
        let address_provider_addr = self.deploy_address_provider();
        let lending_addr = self.deploy_lending(&address_provider_addr);

        let oracle_addr = self.deploy_oracle();

        MockEnv {
            app: take(&mut self.app),
            owner: self.owner.clone(),
            address_provider: AddressProvider {
                contract_addr: address_provider_addr,
            },
            oracle: Oracle {
                contract_addr: oracle_addr,
            },
            lending: Lending {
                contract_addr: lending_addr,
            },
        }
    }

    fn deploy_oracle(&mut self) -> Addr {
        let code_id = self.app.store_code(mock_oracle_contract());

        self.app
            .instantiate_contract(
                code_id,
                self.owner.clone(),
                &oracle::InstantiateMsg::<Empty> {
                    owner: self.owner.to_string(),
                    base_denom: self.base_denom.clone(),
                    custom_init: None,
                },
                &[],
                "oracle",
                None,
            )
            .unwrap()
    }

    fn deploy_address_provider(&mut self) -> Addr {
        let code_id = self.app.store_code(mock_address_provider_contract());

        self.app
            .instantiate_contract(
                code_id,
                self.owner.clone(),
                &address_provider::InstantiateMsg {
                    owner: self.owner.to_string(),
                    prefix: self.chain_prefix.clone(),
                },
                &[],
                "address-provider",
                None,
            )
            .unwrap()
    }

    fn deploy_lending(&mut self, address_provider_addr: &Addr) -> Addr {
        let code_id = self.app.store_code(mock_lending_contract());

        self.app
            .instantiate_contract(
                code_id,
                self.owner.clone(),
                &lending::InstantiateMsg {
                    owner: self.owner.to_string(),
                    config: CreateOrUpdateConfig {
                        address_provider: Some(address_provider_addr.to_string()),
                        close_factor: Some(self.close_factor),
                    },
                },
                &[],
                "lending",
                None,
            )
            .unwrap()
    }

    fn update_address_provider(
        &mut self,
        address_provider_addr: &Addr,
        address_type: KawaAddressType,
        addr: &Addr,
    ) {
        self.app
            .execute_contract(
                self.owner.clone(),
                address_provider_addr.clone(),
                &address_provider::ExecuteMsg::SetAddress {
                    address_type,
                    address: addr.to_string(),
                },
                &[],
            )
            .unwrap();
    }
}
