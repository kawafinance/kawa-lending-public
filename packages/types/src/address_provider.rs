use std::{any::type_name, fmt, str::FromStr};

use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::StdError;
use mars_owner::OwnerUpdate;
use strum::EnumIter;

#[cw_serde]
#[derive(Copy, Eq, Hash, EnumIter)]
pub enum KawaAddressType {
    // Incentives,
    Oracle,
    Lending,
    // RewardsCollector,
    /// Protocol admin is an ICS-27 interchain account controlled by Kawa Hub's x/gov module.
    /// This account will take the owner and admin roles of lending contracts.
    ///
    /// Owner means the account who can invoke certain priviliged execute methods on a contract,
    /// such as updating the config.
    /// Admin means the account who can migrate a contract.
    ProtocolAdmin,
    /// The `fee_collector` module account controlled by Kawa Hub's x/distribution module.
    /// Funds sent to this account will be distributed as staking rewards.
    ///
    /// NOTE: This is a Kawa Hub address with the `mars` bech32 prefix, which may not be recognized
    /// by the `api.addr_validate` method.
    FeeCollector,
    /// The module account controlled by the by Kawa Hub's x/safety module.
    /// Funds sent to this account will be deposited into the safety fund.
    ///
    /// NOTE: This is a Kawa Hub address with the `mars` bech32 prefix, which may not be recognized
    /// by the `api.addr_validate` method.
    SafetyFund,
    // Swapper,  /// The swapper contract on the chain
}

impl fmt::Display for KawaAddressType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            KawaAddressType::FeeCollector => "fee_collector",
            // KawaAddressType::Incentives => "incentives",
            KawaAddressType::Oracle => "oracle",
            KawaAddressType::ProtocolAdmin => "protocol_admin",
            KawaAddressType::Lending => "lending",
            // KawaAddressType::RewardsCollector => "rewards_collector",
            KawaAddressType::SafetyFund => "safety_fund", // KawaAddressType::Swapper => "swapper",
        };
        write!(f, "{s}")
    }
}

impl FromStr for KawaAddressType {
    type Err = StdError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "fee_collector" => Ok(KawaAddressType::FeeCollector),
            // "incentives" => Ok(KawaAddressType::Incentives),
            "oracle" => Ok(KawaAddressType::Oracle),
            "protocol_admin" => Ok(KawaAddressType::ProtocolAdmin),
            "lending" => Ok(KawaAddressType::Lending),
            // "rewards_collector" => Ok(KawaAddressType::RewardsCollector),
            "safety_fund" => Ok(KawaAddressType::SafetyFund),
            // "swapper" => Ok(KawaAddressType::Swapper),
            _ => Err(StdError::parse_err(type_name::<Self>(), s)),
        }
    }
}

/// Essentially, kawa-address-provider is a required init param for all other contracts, so it needs
/// to be initialised first (Only owner can be set on initialization). So the deployment looks like
/// this:
///
/// 1. Init the address provider
/// 2. Init all other contracts, passing in the address provider address (not ALL contracts need this
///    but many do)
/// 3. Update the address provider, with an update config call to contain all the other contract addresses
///    from step 2, this is why we need it to be owned by an EOA (externally owned account) - so we
///    can do this update as part of the deployment
/// 4. Update the owner of the address provider contract at the end of deployment to be either a. the
///    multisig or b. the gov/council contract
#[cw_serde]
pub struct InstantiateMsg {
    /// The contract's owner
    pub owner: String,
    /// The address prefix of the chain this contract is deployed on
    pub prefix: String,
}

#[cw_serde]
pub struct Config {
    /// The address prefix of the chain this contract is deployed on
    pub prefix: String,
}

#[cw_serde]
pub enum ExecuteMsg {
    /// Set address
    SetAddress {
        address_type: KawaAddressType,
        address: String,
    },
    /// Manages admin role state
    UpdateOwner(OwnerUpdate),
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    /// Get config
    #[returns(ConfigResponse)]
    Config {},
    /// Get a single address
    #[returns(AddressResponseItem)]
    Address(KawaAddressType),
    /// Get a list of addresses
    #[returns(Vec<AddressResponseItem>)]
    Addresses(Vec<KawaAddressType>),
    /// Query all stored addresses with pagination
    #[returns(Vec<AddressResponseItem>)]
    AllAddresses {
        start_after: Option<KawaAddressType>,
        limit: Option<u32>,
    },
}

#[cw_serde]
pub struct ConfigResponse {
    /// The contract's owner
    pub owner: Option<String>,
    /// The contract's proposed owner
    pub proposed_new_owner: Option<String>,
    /// The address prefix of the chain this contract is deployed on
    pub prefix: String,
}

#[cw_serde]
pub struct AddressResponseItem {
    /// The type of address
    pub address_type: KawaAddressType,
    /// Address value
    pub address: String,
}

pub mod helpers {
    use std::collections::HashMap;

    use cosmwasm_std::{Addr, CustomQuery, Deps, StdResult};

    use super::{AddressResponseItem, KawaAddressType, QueryMsg};

    /// Query contract address.
    ///
    /// It fails if the provided address does not start with current chain prefix.
    pub fn query_contract_addr(
        deps: Deps<impl CustomQuery>,
        address_provider_addr: &Addr,
        contract: KawaAddressType,
    ) -> StdResult<Addr> {
        deps.querier
            .query_wasm_smart::<AddressResponseItem>(
                address_provider_addr,
                &QueryMsg::Address(contract),
            )
            .map(|res| deps.api.addr_validate(&res.address))?
    }

    /// Query contract addresses.
    ///
    /// It fails if the provided address does not start with current chain prefix.
    pub fn query_contract_addrs(
        deps: Deps<impl CustomQuery>,
        address_provider_addr: &Addr,
        contracts: Vec<KawaAddressType>,
    ) -> StdResult<HashMap<KawaAddressType, Addr>> {
        deps.querier
            .query_wasm_smart::<Vec<AddressResponseItem>>(
                address_provider_addr,
                &QueryMsg::Addresses(contracts),
            )?
            .into_iter()
            .map(|item| Ok((item.address_type, deps.api.addr_validate(&item.address)?)))
            .collect()
    }

    /// Query Kawa Hub module address
    pub fn query_module_addr(
        deps: Deps<impl CustomQuery>,
        address_provider_addr: &Addr,
        module: KawaAddressType,
    ) -> StdResult<String> {
        deps.querier
            .query_wasm_smart::<AddressResponseItem>(
                address_provider_addr,
                &QueryMsg::Address(module),
            )
            .map(|res| res.address)
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use strum::IntoEnumIterator;

    use super::KawaAddressType;

    #[test]
    fn kawa_address_type_fmt_and_from_string() {
        for address_type in KawaAddressType::iter() {
            assert_eq!(KawaAddressType::from_str(&address_type.to_string()).unwrap(), address_type);
        }
    }

    #[test]
    #[should_panic]
    fn kawa_address_type_from_str_invalid_string() {
        KawaAddressType::from_str("invalid_address_type").unwrap();
    }
}
