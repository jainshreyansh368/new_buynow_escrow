import * as BufferLayout from "buffer-layout";

/**
     * Layout for a public key
     */
const publicKey = (property = "publicKey") => {
  return BufferLayout.blob(32, property);
}
/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = "uint64") => {
  return BufferLayout.blob(8, property);
};

export const ESCROW_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([

  BufferLayout.u8("isInitialized"),
  publicKey("sellerPubkey"),
  publicKey("tokenAccountPubkey"),
  publicKey("mintKey"),
  uint64("expectedAmount"),
]);

export const PLATFORM_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([

  BufferLayout.u8("isInitialized"),
  publicKey("treasuryAccount"),
  uint64("basePercentage"),
]);