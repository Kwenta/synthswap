import { expect } from "chai";
import { ethers, artifacts, waffle, network } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

// testing
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const TEST_ADDRESS = "0x42f9134E9d3Bf7eEE1f8A5Ac2a4328B059E7468c"; // EOA
const TEST_VALUE = ethers.BigNumber.from("10000000000000000");

// synthetix
const VOLUME_REWARDS = ethers.constants.AddressZero;
const ADDRESS_RESOLVER = "0x95A6a3f44a70172E7d50a9e28c85Dfd712756B8C";
// synthetix: proxy
const SETH_PROXY = "0xE405de8F52ba7559f9df3C368500B6E6ae6Cee49";
const SUSD_PROXY = "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9";
const SLINK_PROXY = "0xc5Db22719A06418028A40A9B5E9A7c02959D0d08";
// synthetix: key
const SETH_BYTES32 = ethers.utils.formatBytes32String("sETH");
const SLINK_BYTES32 = ethers.utils.formatBytes32String("sLINK");
const SUSD_BYTES32 = ethers.utils.formatBytes32String("sUSD");

// 1inch
const AGGREGATION_ROUTER_V4 = "0x1111111254760F7ab3F16433eea9304126DCd199";

// https://dashboard.tenderly.co/tx/optimistic/0x0c9a18a7f145ab6b64098de909d18a2344dd8f409a19fd2d56936cc36fc50720
const ETH_TO_SUSD_ROUTE = "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000070000000000000000000000000000000000000000000000000000000000000009c00000000000000000000000000000000000000000000000000000000000000ca00000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004d0e30db000000000000000000000000000000000000000000000000000000000800000000000000000000000c858a329bf053be78d6239c4a4343b8fbd21472b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000026271dfddbd250014f87f0f302c099d5a798bab10000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000001000276a400000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000420000000000000000000000000000000000000600000000000000000000000094b008aa00579c1307b0ef2c499ad98a8ce58e58000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000364ad0e7b1a0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000030000000000000000000000000094b008aa00579c1307b0ef2c499ad98a8ce58e5800000000000000000000000000000032000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001408000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064eb5625d900000000000000000000000094b008aa00579c1307b0ef2c499ad98a8ce58e580000000000000000000000001337bedc9d22ecbe766df105c9623922a27963ec0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000008000000000000000000000001337bedc9d22ecbe766df105c9623922a27963ec0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000843df0212400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000044800000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000022414284aab00000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000044000000000000000000000000da10009cbd5d07dd0cecc66161fc93d7c9000da10000000000000000000000000000003200000000000000000000000000000032800000000000000000000000e7ee03b72a89f87d161425e42548bd5492d06679000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000026271dfddbd250014f87f0f302c099d5a798bab100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000fffd8963efd1fc6a506488495d951d5263988d2500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d9000000000000000000000000da10009cbd5d07dd0cecc66161fc93d7c9000da10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000024432ce0a7c0000000000000000000000000000000000000000000000000000000000000080800000000000000000000000000000000000000000000000000000000000004400000000000000000000000026271dfddbd250014f87f0f302c099d5a798bab100000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a4059712240000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000100000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004470bdb9470000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d90000000000000000000000000000000000000000000000018d6e923bd8cb95880000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000018414284aab000000000000000000000000000000000000000000000000000000000000008080000000000000000000000000000000000000000000000000000000000000440000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d900000000000000000000000000000001000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064d1660f990000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d90000000000000000000000001111111254760f7ab3f16433eea9304126dcd19900000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
// https://dashboard.tenderly.co/tx/optimistic/0x63755207f57d19b7616207ce55398c4b0b1925d99c71ba02ad7bbd37ec718313
const WETH_TO_SUSD_ROUTE = "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000da00000000000000000000000000000000000000000000000000000000000001be00000000000000000000000000000000000000000000000000000000000001ec00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000c8414284aab000000000000000000000000000000000000000000000000000000000000008080000000000000000000000000000000000000000000000000000000000000240000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000000010000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000b64aade5c4900000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000042000000000000000000000000000000000000060000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d90000000000000000000000006e1768574dc439ae6ffcd2b0a0f218105f2612c600000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f000000000000000000000000000000000000000000000000271302e8259f315d00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000004e000000000000000000000000000000000000000000000000000000000000007a08000000000000000000000003202c46666e774b44ba463eafaa6da9a968a058f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000fffd8963efd1fc6a506488495d951d5263988d2500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000350a791bfc2c21f9ed5d10980dad2e2638ffa7f6000000000000000000000000420000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000022414284aab00000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000044000000000000000000000000350a791bfc2c21f9ed5d10980dad2e2638ffa7f60000000000000000000000000000000b00000000000000000000000000000032000000000000000000000000d6101cda1a51924e249132cbcae82bfcd0a91fbc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000001000276a400000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000350a791bfc2c21f9ed5d10980dad2e2638ffa7f6000000000000000000000000da10009cbd5d07dd0cecc66161fc93d7c9000da10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000022414284aab00000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000044000000000000000000000000350a791bfc2c21f9ed5d10980dad2e2638ffa7f60000000000000000000000000000002700000000000000000000000000000027800000000000000000000000124657e5bb6afc12a15c439d08fc80070f9a1a1e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000001000276a400000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000350a791bfc2c21f9ed5d10980dad2e2638ffa7f6000000000000000000000000da10009cbd5d07dd0cecc66161fc93d7c9000da10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000022414284aab00000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000044000000000000000000000000da10009cbd5d07dd0cecc66161fc93d7c9000da10000000000000000000000000000003200000000000000000000000000000032800000000000000000000000e7ee03b72a89f87d161425e42548bd5492d06679000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000fffd8963efd1fc6a506488495d951d5263988d2500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d9000000000000000000000000da10009cbd5d07dd0cecc66161fc93d7c9000da1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000da414284aab00000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000024000000000000000000000000420000000000000000000000000000000000000600000000000000000000000000000009000000000000000000000000000000090000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000c84aade5c4900000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000042000000000000000000000000000000000000060000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d90000000000000000000000006e1768574dc439ae6ffcd2b0a0f218105f2612c600000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f00000000000000000000000000000000000000000000000167e59a072c9e8d03000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008c0800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000022414284aab000000000000000000000000000000000000000000000000000000000000008080000000000000000000000000000000000000000000000000000000000000440000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000001c2000000000000000000000000000001c280000000000000000000000019ea026886cbb7a900ecb2458636d72b5cae223b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000fffd8963efd1fc6a506488495d951d5263988d2500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000350a791bfc2c21f9ed5d10980dad2e2638ffa7f600000000000000000000000042000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000022414284aab00000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000044000000000000000000000000350a791bfc2c21f9ed5d10980dad2e2638ffa7f600000000000000000000000000000032000000000000000000000000000000328000000000000000000000008531e48a8611729185be9eaad945acbd6b32e256000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000001000276a400000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000350a791bfc2c21f9ed5d10980dad2e2638ffa7f600000000000000000000000042000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000022414284aab000000000000000000000000000000000000000000000000000000000000008080000000000000000000000000000000000000000000000000000000000000440000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000000020000000000000000000000000000003200000000000000000000000084eb2c5c23999b3ddc87be10f15ccec5d22c7d97000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000001000276a400000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000042000000000000000000000000000000000000060000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d90000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000022414284aab00000000000000000000000000000000000000000000000000000000000000808000000000000000000000000000000000000000000000000000000000000044000000000000000000000000420000000000000000000000000000000000000600000000000000000000000000000030000000000000000000000000000000308000000000000000000000002e80d5a7b3c613d854ee43243ff09808108561eb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb0800000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000001000276a400000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000042000000000000000000000000000000000000060000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000024432ce0a7c0000000000000000000000000000000000000000000000000000000000000080800000000000000000000000000000000000000000000000000000000000004400000000000000000000000094bc2a1c732bcad7343b25af48385fe76e08734f00000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a4059712240000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000100000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004470bdb9470000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d90000000000000000000000000000000000000000000000019b4f7a336c898cd80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000018414284aab000000000000000000000000000000000000000000000000000000000000008080000000000000000000000000000000000000000000000000000000000000440000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d900000000000000000000000000000001000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064d1660f990000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d90000000000000000000000001111111254760f7ab3f16433eea9304126dcd19900000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
const SUSD_TO_WETH_ROUTE = "";

const forkAndImpersonateAtBlock = async (block: number, account: string) => {
    await network.provider.request({
        method: "hardhat_reset",
        params: [
            {
                forking: {
                    jsonRpcUrl: process.env.ARCHIVE_NODE_URL_L2,
                    blockNumber: block,
                },
            },
        ],
    });

    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [account],
    });
};

describe("Integration: Test Synthswap.sol", function () {
    it("Test SynthSwap deployment", async () => {
        await forkAndImpersonateAtBlock(6950543, TEST_ADDRESS);

        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SUSD_PROXY,
            AGGREGATION_ROUTER_V4,
            ADDRESS_RESOLVER,
            VOLUME_REWARDS
        );
        await synthswap.deployed();
        expect(synthswap.address).to.exist;
    });

    ////////////////////////
    ////// swapInto() //////
    ////////////////////////

    it("Test swap ETH into sETH", async () => {
        await forkAndImpersonateAtBlock(6950543, TEST_ADDRESS);

        // ETH -(1inchAggregator)-> sUSD -(Synthetix)-> sETH
        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SUSD_PROXY,
            AGGREGATION_ROUTER_V4,
            ADDRESS_RESOLVER,
            VOLUME_REWARDS
        );
        await synthswap.deployed();

        // pre-swap balance
        const IERC20ABI = (await artifacts.readArtifact("contracts/interfaces/IERC20.sol:IERC20")).abi;
        const sETH = new ethers.Contract(SETH_PROXY, IERC20ABI, waffle.provider);
        const preBalance = await sETH.balanceOf(TEST_ADDRESS);

        const abiCoder = ethers.utils.defaultAbiCoder;
        const caller = "0x26271dfddbd250014f87f0f302c099d5a798bab1";
        const swapDescription = {
            srcToken: ETH_ADDRESS,
            dstToken: SUSD_PROXY,
            srcReceiver: "0x26271dfddbd250014f87f0f302c099d5a798bab1",
            dstReceiver: synthswap.address,
            amount: TEST_VALUE,
            minReturnAmount: ethers.BigNumber.from("28087090916131374921"),
            flags: 0,
            permit: "0x"
        }
        
		const data = abiCoder.encode(
			[
				'address caller',
				'tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint256 amount, uint256 minReturnAmount, uint256 flags, bytes permit) desc',
				'bytes data',
			],
			[caller, swapDescription, ETH_TO_SUSD_ROUTE]
		);

        // swap
        const signer = await ethers.getSigner(TEST_ADDRESS);
		await synthswap.connect(signer).swapInto(
            SETH_BYTES32,
            SETH_PROXY,
            data, 
            {
				value: TEST_VALUE,
            }
        );
        
        const postBalance = await sETH.balanceOf(TEST_ADDRESS);
        expect(postBalance).to.be.above(preBalance);
    }).timeout(600000);

    it("Test swap ETH into sLINK", async () => {
        await forkAndImpersonateAtBlock(6950543, TEST_ADDRESS);

        // ETH -(1inchAggregator)-> sUSD -(Synthetix)-> sLINK
        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SUSD_PROXY,
            AGGREGATION_ROUTER_V4,
            ADDRESS_RESOLVER,
            VOLUME_REWARDS
        );
        await synthswap.deployed();

        // pre-swap balance
        const IERC20ABI = (await artifacts.readArtifact("contracts/interfaces/IERC20.sol:IERC20")).abi;
        const sLINK = new ethers.Contract(SLINK_PROXY, IERC20ABI, waffle.provider);
        const preBalance = await sLINK.balanceOf(TEST_ADDRESS);

        const abiCoder = ethers.utils.defaultAbiCoder;
        const caller = "0x26271dfddbd250014f87f0f302c099d5a798bab1";
        const swapDescription = {
            srcToken: ETH_ADDRESS,
            dstToken: SUSD_PROXY,
            srcReceiver: "0x26271dfddbd250014f87f0f302c099d5a798bab1",
            dstReceiver: synthswap.address,
            amount: TEST_VALUE,
            minReturnAmount: ethers.BigNumber.from("28087090916131374921"),
            flags: 0,
            permit: "0x"
        }
        
		const data = abiCoder.encode(
			[
				'address caller',
				'tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint256 amount, uint256 minReturnAmount, uint256 flags, bytes permit) desc',
				'bytes data',
			],
			[caller, swapDescription, ETH_TO_SUSD_ROUTE]
		);

        // swap
        const signer = await ethers.getSigner(TEST_ADDRESS);
		await synthswap.connect(signer).swapInto(
            SLINK_BYTES32,
            SLINK_PROXY,
            data, 
            {
				value: TEST_VALUE,
            }
        );
        
        const postBalance = await sLINK.balanceOf(TEST_ADDRESS);
        expect(postBalance).to.be.above(preBalance);
    }).timeout(600000);

    it("Test swap WETH into sLINK", async () => {
        await forkAndImpersonateAtBlock(7161862, TEST_ADDRESS);

        // WETH -(1inchAggregator)-> sUSD -(Synthetix)-> sLINK
        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SUSD_PROXY,
            AGGREGATION_ROUTER_V4,
            ADDRESS_RESOLVER,
            VOLUME_REWARDS
        );
        await synthswap.deployed();

        // pre-swap balance
        const IERC20ABI = (await artifacts.readArtifact("contracts/interfaces/IERC20.sol:IERC20")).abi;
        const sLINK = new ethers.Contract(SLINK_PROXY, IERC20ABI, waffle.provider);
        const preBalance = await sLINK.balanceOf(TEST_ADDRESS);

        const abiCoder = ethers.utils.defaultAbiCoder;
        const caller = "0x94bc2a1c732bcad7343b25af48385fe76e08734f";
        const swapDescription = {
            srcToken: "0x4200000000000000000000000000000000000006",
            dstToken: "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9",
            srcReceiver: "0x94bc2a1c732bcad7343b25af48385fe76e08734f",
            dstReceiver: synthswap.address,
            amount: TEST_VALUE,
            minReturnAmount: ethers.BigNumber.from("1"),
            flags: 5,
            permit: "0x"
        }
        
		const data = abiCoder.encode(
			[
				'address caller',
				'tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint256 amount, uint256 minReturnAmount, uint256 flags, bytes permit) desc',
				'bytes data',
			],
			[caller, swapDescription, WETH_TO_SUSD_ROUTE]
		);

        // must approve synthswap to swap tokens
        const signer = await ethers.getSigner(TEST_ADDRESS);
        const WETH = new ethers.Contract(WETH_ADDRESS, IERC20ABI, waffle.provider);
        await WETH.connect(signer).approve(synthswap.address, TEST_VALUE);

        // swap
		await synthswap.connect(signer).swapInto(
            SLINK_BYTES32,
            SLINK_PROXY,
            data
        );
        
        const postBalance = await sLINK.balanceOf(TEST_ADDRESS);
        expect(postBalance).to.be.above(preBalance);
    }).timeout(600000);

    it("Test swap WETH into sUSD", async () => {
        await forkAndImpersonateAtBlock(7161862, TEST_ADDRESS);

        // WETH -(1inchAggregator)-> sUSD
        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SUSD_PROXY,
            AGGREGATION_ROUTER_V4,
            ADDRESS_RESOLVER,
            VOLUME_REWARDS
        );
        await synthswap.deployed();

        // pre-swap balance
        const IERC20ABI = (await artifacts.readArtifact("contracts/interfaces/IERC20.sol:IERC20")).abi;
        const sUSD = new ethers.Contract(SUSD_PROXY, IERC20ABI, waffle.provider);
        const preBalance = await sUSD.balanceOf(TEST_ADDRESS);

        const abiCoder = ethers.utils.defaultAbiCoder;
        const caller = "0x94bc2a1c732bcad7343b25af48385fe76e08734f";
        const swapDescription = {
            srcToken: "0x4200000000000000000000000000000000000006",
            dstToken: "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9",
            srcReceiver: "0x94bc2a1c732bcad7343b25af48385fe76e08734f",
            dstReceiver: synthswap.address,
            amount: TEST_VALUE,
            minReturnAmount: ethers.BigNumber.from("1"),
            flags: 5,
            permit: "0x"
        }
        
		const data = abiCoder.encode(
			[
				'address caller',
				'tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint256 amount, uint256 minReturnAmount, uint256 flags, bytes permit) desc',
				'bytes data',
			],
			[caller, swapDescription, WETH_TO_SUSD_ROUTE]
		);

        // must approve synthswap to swap tokens
        const signer = await ethers.getSigner(TEST_ADDRESS);
        const WETH = new ethers.Contract(WETH_ADDRESS, IERC20ABI, waffle.provider);
        await WETH.connect(signer).approve(synthswap.address, TEST_VALUE);

        // swap
		await synthswap.connect(signer).swapInto(
            SUSD_BYTES32,
            SUSD_PROXY,
            data
        );
        
        const postBalance = await sUSD.balanceOf(TEST_ADDRESS);
        expect(postBalance).to.be.above(preBalance);
    }).timeout(600000);

    ////////////////////////
    ////// swapOutOf() /////
    ////////////////////////

    // TODO
    it.skip("Test swap sETH into WETH", async () => {
    }).timeout(200000);

     // TODO
    it.skip("Test swap sLINK into ETH", async () => {
    }).timeout(200000);

    // TODO
    it.skip("Test swap sUSD into ETH", async () => {
    }).timeout(200000);
});