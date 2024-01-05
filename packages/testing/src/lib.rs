#![cfg(not(target_arch = "wasm32"))]

extern crate core;

/// cosmwasm_std::testing overrides and custom test helpers
mod helpers;
mod kawa_mock_querier;
mod lending_querier;
mod mock_address_provider;
mod mocks;
mod oracle_querier;
mod pyth_querier;
pub mod test_runner;

#[cfg(feature = "astroport")]
pub mod wasm_oracle;

pub use helpers::*;
pub use kawa_mock_querier::KawaMockQuerier;
pub use mocks::*;

pub mod integration;
