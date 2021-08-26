import { expect } from "chai";
import { ethers, artifacts, waffle } from "hardhat";

describe("SynthSwap", function () {
  it("Should execute swapInto()", async function () {
    const mockProvider = waffle.provider;
    const [wallet] = mockProvider.getWallets();
    const IERC20ABI = (await artifacts.readArtifact("IERC20")).abi;
    const ISwapRouterABI = (await artifacts.readArtifact("ISwapRouter")).abi;
    const ISynthetixABI = (await artifacts.readArtifact("ISynthetix")).abi;
    const mockERC20 = await waffle.deployMockContract(wallet, IERC20ABI);
    const mockSUSD = await waffle.deployMockContract(wallet, IERC20ABI);
    const mockSwapRouter = await waffle.deployMockContract(
      wallet,
      ISwapRouterABI
    );
    const mockSynthetix = await waffle.deployMockContract(
      wallet,
      ISynthetixABI
    );

    const AMOUNT_TO_SWAP = 1;
    const UNISWAP_EXCHANGE_RATE = 10;
    const SYNTHETIX_EXCHANGE_RATE = 100;

    await mockERC20.mock.transferFrom.returns(AMOUNT_TO_SWAP);
    await mockERC20.mock.approve.returns(true);
    await mockSUSD.mock.approve.returns(true);
    await mockSwapRouter.mock.exactInput.returns(
      AMOUNT_TO_SWAP * UNISWAP_EXCHANGE_RATE
    );
    await mockSynthetix.mock.exchangeWithTrackingForInitiator.returns(
      AMOUNT_TO_SWAP * UNISWAP_EXCHANGE_RATE * SYNTHETIX_EXCHANGE_RATE
    );

    const SynthSwap = await ethers.getContractFactory("SynthSwap");
    const synthswap = await SynthSwap.deploy(
      mockSwapRouter.address,
      mockSynthetix.address,
      mockSUSD.address,
      ethers.constants.AddressZero
    );
    await synthswap.deployed();

    await expect(
      synthswap.swapInto(
        mockERC20.address,
        AMOUNT_TO_SWAP,
        ethers.constants.HashZero,
        0,
        ethers.constants.HashZero
      )
    )
      .to.emit(synthswap, "SwapInto")
      .withArgs(
        (
          await ethers.getSigners()
        )[0].address,
        AMOUNT_TO_SWAP * UNISWAP_EXCHANGE_RATE * SYNTHETIX_EXCHANGE_RATE
      );
  });

  it("Should execute swapOutOf()", async function () {
    const mockProvider = waffle.provider;
    const [wallet] = mockProvider.getWallets();
    const IERC20ABI = (await artifacts.readArtifact("IERC20")).abi;
    const ISwapRouterABI = (await artifacts.readArtifact("ISwapRouter")).abi;
    const ISynthetixABI = (await artifacts.readArtifact("ISynthetix")).abi;
    const mockERC20 = await waffle.deployMockContract(wallet, IERC20ABI);
    const mockSUSD = await waffle.deployMockContract(wallet, IERC20ABI);
    const mockSwapRouter = await waffle.deployMockContract(
      wallet,
      ISwapRouterABI
    );
    const mockSynthetix = await waffle.deployMockContract(
      wallet,
      ISynthetixABI
    );

    const AMOUNT_TO_SWAP = 1;
    const UNISWAP_EXCHANGE_RATE = 10;
    const SYNTHETIX_EXCHANGE_RATE = 100;

    await mockERC20.mock.transferFrom.returns(AMOUNT_TO_SWAP);
    await mockERC20.mock.approve.returns(true);
    await mockSUSD.mock.approve.returns(true);
    await mockSwapRouter.mock.exactInput.returns(
      AMOUNT_TO_SWAP * UNISWAP_EXCHANGE_RATE
    );
    await mockSynthetix.mock.exchangeWithTrackingForInitiator.returns(
      AMOUNT_TO_SWAP * UNISWAP_EXCHANGE_RATE * SYNTHETIX_EXCHANGE_RATE
    );

    const SynthSwap = await ethers.getContractFactory("SynthSwap");
    const synthswap = await SynthSwap.deploy(
      mockSwapRouter.address,
      mockSynthetix.address,
      mockSUSD.address,
      ethers.constants.AddressZero
    );
    await synthswap.deployed();

    await expect(
      synthswap.swapOutOf(
        mockSUSD.address,
        ethers.constants.HashZero,
        AMOUNT_TO_SWAP,
        ethers.constants.HashZero,
        0
      )
    )
      .to.emit(synthswap, "SwapOutOf")
      .withArgs(
        (
          await ethers.getSigners()
        )[0].address,
        AMOUNT_TO_SWAP * UNISWAP_EXCHANGE_RATE * SYNTHETIX_EXCHANGE_RATE
      );
  });
});
