import StellarSdk from 'https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk/+esm';
//import { Horizon1 } from '@stellar/stellar-sdk';


const server = new StellarSdk.Horizon.Server("https://horizon.stellar.org");

export async function getAccountBalance(wallet_address) {
    try {

        const account = await server.loadAccount(wallet_address);

        let balances = [];
        account.balances.forEach((balance) => {
            if (balance.asset_type === "native") {
                balances.push({ asset: "XLM:Native", balance: balance.balance });
            } else {
                balances.push({
                    asset: `${balance.asset_code}:${balance.asset_issuer}`,
                    balance: balance.balance,
                });
            }
        });
        return balances;


    } catch (error) {
        return { error: "Stellar error" };
    }
}

