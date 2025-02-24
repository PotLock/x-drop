/// Expands code based on Rust version this is compiled under.
///
/// Example:
/// ```
/// bitcoin_internals::rust_version! {
///     if >= 1.70 {
///         println!("This is Rust 1.70+");
///     } else {
///         println!("This is Rust < 1.70");
///     }
/// }
/// ```
///
/// The `else` branch is optional.
/// Currently only the `>=` operator is supported.
#[macro_export]
macro_rules! rust_version {
    (if >= 1.63 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.64 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.65 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.66 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.67 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.68 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.69 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.70 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.71 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.72 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.73 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.74 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.75 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.76 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.77 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.78 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.79 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.80 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.81 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.82 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.83 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.84 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= 1.85 { $($if_yes:tt)* } $(else { $($if_no:tt)* })?) => {
        $($if_yes)*
    };
    (if >= $unknown:tt $($rest:tt)*) => {
        compile_error!(concat!("unknown Rust version ", stringify!($unknown)));
    };
}
pub use rust_version;
