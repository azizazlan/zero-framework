import { Spec } from '@specron/spec';
import { Connector } from '../../../core/connector';
import { ConnectorError } from '@0xcert/scaffold';

interface Data {
  coinbase: string;
  bob: string;
  connector: Connector;
}

const spec = new Spec<Data>();

spec.before(async (stage) => {
  const connector = new Connector();
  await connector.attach(stage);

  stage.set('connector', connector);
});

spec.before(async (stage) => {
  const accounts = await stage.web3.eth.getAccounts();

  stage.set('coinbase', accounts[0]);
  stage.set('bob', accounts[1]);
});

spec.test('submits transaction to the network', async (ctx) => {
  const connector = ctx.get('connector');
  const coinbase = ctx.get('coinbase');
  const bob = ctx.get('bob');
  const resolver = () => ctx.web3.eth.sendTransaction({ from: coinbase, to: bob, value: 1000 });

  const mutation = await connector.mutate(resolver);

  ctx.true(!!mutation.hash);
});

spec.test('handles an error', async (ctx) => {
  const connector = ctx.get('connector');
  const resolver = () => { throw 'foo' };

  try {
    await connector.mutate(resolver);
    ctx.fail();
  } catch (error) {
    ctx.is(error.name, 'ConnectorError');
  }
});

export default spec;