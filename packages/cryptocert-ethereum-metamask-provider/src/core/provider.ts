import {
  GatewayConfig,
  GenericProvider,
  ProviderEvent,
  SignMethod,
} from "cryptocert/ethereum-generic-provider";

/**
 * Metamask provider options interface.
 */
export interface MetamaskProviderOptions {
  /**
   * Type of signature that will be used in making claims etc.
   */
  signMethod?: SignMethod;

  /**
   * List of addresses where normal transfer not safeTransfer smart contract methods will be used.
   */
  unsafeRecipientIds?: string[];

  /**
   * Source where assetLedger compiled smart contract is located.
   */
  assetLedgerSource?: string;

  /**
   * Source where valueLedger compiled smart contract is located.
   */
  valueLedgerSource?: string;

  /**
   * Number of confirmations (blocks in blockchain after mutation is accepted) are necessary to mark a mutation complete.
   */
  requiredConfirmations?: number;

  /**
   * Gateway configuration.
   */
  gatewayConfig?: GatewayConfig;

  /**
   * The number of milliseconds in which a mutation times out.
   */
  mutationTimeout?: number;

  /**
   * Gas price multiplier. Defaults to 1.1.
   */
  gasPriceMultiplier?: number;

  /**
   * Retry gas price multiplier. Defaults to 2.
   */
  retryGasPriceMultiplier?: number;

  /**
   * Sandbox mode. False by default.
   */
  sandbox?: Boolean;

  /**
   * Verbose mode. False by default.
   */
  verbose?: Boolean;
}

/**
 * Metamask RPC client.
 */
export class MetamaskProvider extends GenericProvider {
  /**
   * Current network version.
   */
  protected _networkVersion: string;

  /**
   * Class constructor.
   */
  public constructor(options?: MetamaskProviderOptions) {
    super({
      ...options,
      signMethod: SignMethod.PERSONAL_SIGN,
    });

    if (this.isSupported()) {
      this.installClient();
      this.installEvents();
    }
  }

  /**
   * Gets an instance of metamask provider.
   */
  public static getInstance(): MetamaskProvider {
    return new this();
  }

  /**
   * Checks if metamask is available.
   */
  public isSupported() {
    if (typeof window === "undefined") {
      return false;
    }

    if (typeof window["ethereum"] !== "undefined") {
      return window["ethereum"].isMetaMask;
    } else if (typeof window["web3"] !== "undefined") {
      return (
        typeof window["web3"]["currentProvider"] !== "undefined" &&
        window["web3"]["currentProvider"].isMetaMask
      );
    } else {
      return false;
    }
  }

  /**
   * Checks if metamask is enabled.
   */
  public async isEnabled() {
    if (!this.isSupported() || !this.accountId) {
      return false;
    }

    if (typeof window["ethereum"] !== "undefined") {
      return true;
    } else {
      return typeof window["web3"] !== "undefined";
    }
  }

  /**
   * Enables metamask.
   */
  public async enable() {
    if (!this.isSupported()) {
      return false;
    }

    if (typeof window["ethereum"] !== "undefined") {
      const accounts = await this.requestAccounts();
      if (accounts && accounts.length > 0) {
        this.accountId = accounts[0];
      } else {
        return false;
      }
    } else {
      this.accountId = window["web3"]["eth"]["coinbase"];
    }
    return true;
  }

  /**
   * Request account.
   */
  public async requestAccounts(): Promise<string[]> {
    const res = await this.post({
      method: "eth_requestAccounts",
      params: [],
    });
    return res.result.map((a) => this.encoder.normalizeAddress(a));
  }

  /**
   * Initializes metamask client.
   */
  protected async installClient() {
    if (typeof window["ethereum"] !== "undefined") {
      // v2 (latest)
      this._client = window["ethereum"];
    } else {
      // v1 (web3 based)
      this._client = {
        ...window["web3"]["currentProvider"],
        send(payload, callback) {
          if (
            ["eth_accounts", "eth_coinbase", "net_version"].indexOf(
              payload.method
            ) !== -1
          ) {
            callback(null, window["web3"]["currentProvider"].send(payload));
          } else {
            window["web3"]["currentProvider"].sendAsync(payload, callback);
          }
        },
      };
    }
  }

  /**
   * Initializes metamask events.
   */
  protected async installEvents() {
    const networkVersion = await this.getNetworkVersion();
    if (networkVersion !== this._networkVersion) {
      this.emit(
        ProviderEvent.NETWORK_CHANGE,
        networkVersion,
        this._networkVersion
      );
      this._networkVersion = networkVersion;
    }

    this.accountId = await this.getAvailableAccounts().then((a) => a[0]);

    setTimeout(() => this.installEvents(), 1000);
  }
}
