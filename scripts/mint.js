// Import necessary modules from Hardhat and SwisstronikJS
const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

// Function to send a shielded transaction using the provided signer, destination, data, and value
const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Get the RPC link from the network configuration
  const rpcLink = hre.network.config.url;

  // Encrypt transaction data
  const [encryptedData] = await encryptDataField(rpcLink, data);

  // Construct and sign transaction with encrypted data
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  // Address of the deployed contract
  const contractAddress = "0xb20919974a1bc4130b2bc42d95d9fc7b5783e5d3"

  // Get the signer (your account)
  const [signer] = await hre.ethers.getSigners();

  // Create a contract instance
  const contractFactory = await hre.ethers.getContractFactory("NajibNFT");
  const contract = contractFactory.attach(contractAddress);

  // Send a shielded transaction to mint 100 tokens in the contract
  const functionName = "safeMint";
  const mintTo = "0x5B42ED0c326f36Ec8223Fe31599654CBFf4BaF41"
  const tokenId = 1;
  const mintNFT = await sendShieldedTransaction(
    signer,
    contractAddress,
    contract.interface.encodeFunctionData(functionName, [mintTo, tokenId]),
    0
  );

  await mintNFT.wait();

  // It should return a TransactionReceipt object
  console.log("Transaction Receipt: ", mintNFT);
}

// Using async/await pattern to handle errors properly
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

