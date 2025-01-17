import { GenericProvider } from "cryptocert/ethereum-generic-provider";
import { Protocol } from "cryptocert/ethereum-sandbox";
import {
  AssetLedgerCapability,
  AssetLedgerDeployOrder,
  OrderKind,
} from "cryptocert/scaffold";
import { Spec } from "@specron/spec";
import { Gateway } from "../../../../core/gateway";

interface Data {
  protocol: Protocol;
  makerGenericProvider: GenericProvider;
  sign: string;
  coinbase: string;
  bob: string;
}

const spec = new Spec<Data>();

spec.before(async (stage) => {
  const protocol = new Protocol(stage.web3);
  stage.set("protocol", await protocol.deploy());
});

spec.before(async (stage) => {
  const accounts = await stage.web3.eth.getAccounts();

  stage.set("coinbase", accounts[0]);
  stage.set("bob", accounts[1]);
});

spec.before(async (stage) => {
  const coinbase = stage.get("coinbase");

  const makerGenericProvider = new GenericProvider({
    client: stage.web3,
    accountId: coinbase,
  });

  stage.set("makerGenericProvider", makerGenericProvider);
});

spec.test("check if signature is valid", async (ctx) => {
  const coinbase = ctx.get("coinbase");
  const bob = ctx.get("bob");
  const token = ctx.get("protocol").erc20.instance.options.address;

  const order: AssetLedgerDeployOrder = {
    kind: OrderKind.ASSET_LEDGER_DEPLOY_ORDER,
    makerId: coinbase,
    takerId: bob,
    seed: 1535113220.12345, // should handle floats
    expiration: Date.now() * 60.1234, // should handle floats
    assetLedgerData: {
      name: "test",
      symbol: "TST",
      uriPrefix: "https://base.com/",
      uriPostfix: ".json",
      schemaId:
        "9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
      capabilities: [
        AssetLedgerCapability.TOGGLE_TRANSFERS,
        AssetLedgerCapability.DESTROY_ASSET,
      ],
      ownerId: bob,
    },
    tokenTransferData: {
      ledgerId: token,
      receiverId: coinbase,
      value: "10000",
    },
  };

  const provider = ctx.get("makerGenericProvider");
  const xcertDeployGatewayId =
    ctx.get("protocol").xcertDeployGateway.instance.options.address;

  const gateway = new Gateway(provider, {
    actionsOrderId: "",
    assetLedgerDeployOrderId: xcertDeployGatewayId,
    valueLedgerDeployOrderId: "",
  });
  const sign = await gateway.sign(order);

  ctx.true(await gateway.isValidSignature(order, sign));
});

export default spec;
