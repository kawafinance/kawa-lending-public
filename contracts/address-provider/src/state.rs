use cw_storage_plus::{Item, Map};
use mars_owner::Owner;
use kawa_lending_types::address_provider::Config;

use crate::key::KawaAddressTypeKey;

pub const OWNER: Owner = Owner::new("owner");
pub const CONFIG: Item<Config> = Item::new("config");
pub const ADDRESSES: Map<KawaAddressTypeKey, String> = Map::new("addresses");
