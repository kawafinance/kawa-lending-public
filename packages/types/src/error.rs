use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum KawaError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("All params should be available during instantiation")]
    InstantiateParamsUnavailable {},

    #[error("Incorrect number of addresses, expected {expected:?}, got {actual:?}")]
    AddressesQueryWrongNumber {
        expected: u32,
        actual: u32,
    },

    #[error("Failed to deserialize RPC query response for: {target_type}")]
    Deserialize {
        target_type: String,
    },
}

impl From<KawaError> for StdError {
    fn from(source: KawaError) -> Self {
        match source {
            KawaError::Std(e) => e,
            e => StdError::generic_err(e.to_string()),
        }
    }
}

// TESTS

#[cfg(test)]
mod tests {
    use super::*;
    use crate::error::KawaError;

    #[test]
    fn kawa_error_to_std_error() {
        {
            let kawa_error = KawaError::Unauthorized {};

            let std_error: StdError = kawa_error.into();

            assert_eq!(std_error, StdError::generic_err("Unauthorized"))
        }

        {
            let kawa_error = KawaError::Std(StdError::generic_err("Some error"));

            let std_error: StdError = kawa_error.into();

            assert_eq!(std_error, StdError::generic_err("Some error"))
        }

        {
            let kawa_error = KawaError::Std(StdError::invalid_data_size(1, 2));

            let std_error: StdError = kawa_error.into();

            assert_eq!(std_error, StdError::invalid_data_size(1, 2))
        }
    }
}
