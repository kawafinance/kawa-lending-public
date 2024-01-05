use std::{convert::TryFrom, str::FromStr};

use cosmwasm_std::{StdError, StdResult};
use cw_storage_plus::{Key, KeyDeserialize, Prefixer, PrimaryKey};
use kawa_lending_types::address_provider::KawaAddressType;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct KawaAddressTypeKey(pub Vec<u8>);

impl From<KawaAddressType> for KawaAddressTypeKey {
    fn from(address_type: KawaAddressType) -> Self {
        Self(address_type.to_string().into_bytes())
    }
}

impl TryFrom<KawaAddressTypeKey> for KawaAddressType {
    type Error = StdError;

    fn try_from(key: KawaAddressTypeKey) -> Result<Self, Self::Error> {
        let s = String::from_utf8(key.0)?;
        KawaAddressType::from_str(&s)
    }
}

impl<'a> PrimaryKey<'a> for KawaAddressTypeKey {
    type Prefix = ();
    type SubPrefix = ();
    type Suffix = Self;
    type SuperSuffix = Self;

    fn key(&self) -> Vec<Key> {
        vec![Key::Ref(&self.0)]
    }
}

impl<'a> Prefixer<'a> for KawaAddressTypeKey {
    fn prefix(&self) -> Vec<Key> {
        vec![Key::Ref(&self.0)]
    }
}

impl KeyDeserialize for KawaAddressTypeKey {
    type Output = Self;

    #[inline(always)]
    fn from_vec(value: Vec<u8>) -> StdResult<Self::Output> {
        Ok(Self(value))
    }
}
