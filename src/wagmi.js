import { createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';
import { http } from 'viem';

export const config = createConfig({
  chains: [sepolia],
  connectors: [metaMask()],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/Vbj8EtZ_hxq_YYUw3wCJ7eanbe8_el_X'), 
  },
});