import { encodeFunctionCall, decodeParameters } from '@0xcert/ethereum-utils';
import { AssetLedger } from '../core/ledger';
import xcertAbi from '../config/xcertAbi';

/**
 * Smart contract method abi.
 */
const abis = ['name', 'symbol', 'uriBase', 'conventionId', 'totalSupply'].map((name) => {  
  return xcertAbi.find((a) => (
    a.name === name && a.type === 'function'
  ));
});

/**
 * 
 */
export default async function(ledger: AssetLedger) {
  const info = await Promise.all(
    abis.map(async (abi) => {
      const attrs = {
        to: ledger.id,
        data: encodeFunctionCall(abi, []),
      };
      const res = await ledger.provider.send({
        method: 'eth_call',
        params: [attrs, 'latest'],
      });
      return decodeParameters(abi.outputs, res.result)[0];
    })
  );
  return {
    name: info[0],
    symbol: info[1],
    uriBase: info[2],
    conventionId: info[3],
    supply: info[4],
  };
}