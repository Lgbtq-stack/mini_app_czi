import {getWalletData} from './database.js';
import {updateTokenPriceAndArrow} from "./script.js";

const logo = {
    "USDC": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    "BTC": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    "XLM": "https://cryptologos.cc/logos/stellar-xlm-logo.png",
    "XRP": "https://cryptologos.cc/logos/xrp-xrp-logo.png",
    "HBAR": "https://cryptologos.cc/logos/hedera-hashgraph-hbar-logo.png",
    "ALGO": "https://cryptologos.cc/logos/algorand-algo-logo.png",
    "IOTA": "https://cryptologos.cc/logos/iota-miota-logo.png",
};

const token_name = {
    "USDC": "USD Coin",
    "BTC": "Bitcoin",
    "XLM": "Lumens",
    "XRP": "Ripple",
    "HBAR": "Hedera Hashgraph",
    "ALGO": "Algorand",
    "IOTA": "IOTA",
};

const token_bonus = {
    "USDC": {  // level: amount
        1: 10000,
        2: 20000,
        3: 30000,
        4: 50000,
        5: 100000,
        6: 250000,
        7: 500000,
        8: 1000000,
        9: 5000000,
        10: 10000000
    },

    "XLM": {  // level: amount
        1: 10000,
        2: 20000,
        3: 40000,
        4: 80000,
        5: 160000,
        6: 320000,
        7: 640000,
        8: 1280000,
        9: 2560000,
        10: 5120000
    },

    "XRP": {  // level: amount
        1: 10000,
        2: 20000,
        3: 40000,
        4: 80000,
        5: 160000,
        6: 320000,
        7: 640000,
        8: 1280000,
        9: 2560000,
        10: 5120000
    },
    "HBAR": {  // level: amount
        1: 10000,
        2: 20000,
        3: 40000,
        4: 80000,
        5: 160000,
        6: 320000,
        7: 640000,
        8: 1280000,
        9: 2560000,
        10: 5120000
    },
    "ALGO": {  // level: amount
        1: 10000,
        2: 20000,
        3: 40000,
        4: 80000,
        5: 160000,
        6: 320000,
        7: 640000,
        8: 1280000,
        9: 2560000,
        10: 5120000
    },
    "IOTA": {  // level: amount
        1: 10000,
        2: 20000,
        3: 40000,
        4: 80000,
        5: 160000,
        6: 320000,
        7: 640000,
        8: 1280000,
        9: 2560000,
        10: 5120000
    },
};

const tokensForAPI = {
    "USDC": "usd-coin",
    "BTC": "bitcoin",
    "XLM": "stellar",
    "XRP": "ripple",
    "HBAR": "hedera-hashgraph",
    "ALGO": "algorand",
    "IOTA": "iota",
};

export let token_price = {};
export let previous_price = {};

async function fetchTokenPrices() {
    try {
        const ids = Object.values(tokensForAPI).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        const data = await response.json();

        for (const [symbol, id] of Object.entries(tokensForAPI)) {
            const newPrice = data[id]?.usd || 0;
            const oldPrice = token_price[symbol] || 0;

            token_price[symbol] = newPrice;

            let arrow;
            if (newPrice > oldPrice) {
                arrow = '▲';
            } else if (newPrice < oldPrice) {
                arrow = '▼';
            } else {
                arrow = '⧗';
            }

            previous_price[symbol] = arrow;

            const percentageChange = oldPrice !== 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;

            updateTokenPriceAndArrow({
                symbol,
                price: newPrice,
                arrow,
                percentageChange,
            });

            console.log(`Price for ${symbol} updated: $${newPrice}, Change: ${arrow} ${percentageChange.toFixed(2)}%`);
        }
    } catch (error) {
        console.error("Error fetching token prices:", error);
    }
}

fetchTokenPrices().then(r => r).catch(e => e);
setInterval(fetchTokenPrices, 2 * 60 * 1000);


export async function create_config(wallet_address, balance, levels_config) {
    let level = calculate_level(balance, levels_config);
    console.log("level: ", level);
    level = level > 10 ? 10 : level;
    let tokens = [];
    for (let tokenBonusKey in token_bonus) {
        tokens.push(create_token_helper(tokenBonusKey, level));
    }

    const wallet_data = await getWalletData(wallet_address);
    const btc_balance = Object.values(wallet_data.history).reduce((acc, val) => acc + val, 0);

    if (btc_balance > 0) {
        tokens.push(create_custom_token_helper("BTC", btc_balance));
    }
    const transaction = create_transaction_helper(level);

    const config = {
        "wallet_address": wallet_address,
        "tokens": tokens,
        "transaction": transaction,
    };
    console.log("config: ", config);
    return config;
}

function create_transaction_item(symbol, level) {
    let amount = 0;
    // Iterate through each level up to the specified one
    for (let lvl = 1; lvl <= level; lvl++) {
        amount = (token_bonus[symbol] || {})[lvl] || 0;
    }

    return {
        "symbol": symbol,
        "name": token_name[symbol] || "None",
        "logo": logo[symbol] || "None",
        "level": level,
        "amount": amount
    };
}

function create_token_helper(symbol, level) {
    let amount = 0;
    // Iterate through each level up to the specified one
    for (let lvl = 1; lvl <= level; lvl++) {
        const current_amount = (token_bonus[symbol] || {})[lvl] || 0;
        amount += current_amount;
    }

    return {
        "name": token_name[symbol] || "None",
        "symbol": symbol,
        "amount": amount,
        "price": token_price[symbol] || -1,
        "logo": logo[symbol] || "None"
    };
}

function create_custom_token_helper(symbol, amount) {
    return {
        "name": token_name[symbol] || "None",
        "symbol": symbol,
        "amount": amount,
        "price": token_price[symbol] || -1,
        "logo": logo[symbol] || "None"
    };
}

function create_transaction_helper(level) {
    const transaction = [];
    // Add history, for example, if it's the first day +10000, if it's the second day +10000 (20000), etc.
    for (const bonus in token_bonus) {
        for (let lvl = 1; lvl <= level; lvl++) {
            transaction.push(create_transaction_item(bonus, lvl));
        }
    }

    // Reverse the list
    transaction.reverse();
    return transaction;
}

function calculate_level(balance, levels_config) {
    // levels_config show like this {level:[min,max]}
    const levels = Object.entries(levels_config);
    for (let index = 0; index < levels.length; index++) {
        let level_range = levels[index][1][1] - levels[index][1][0];
        if (balance < level_range || index === levels.length - 1) {
            return index + 1;
        }
        balance -= level_range;
    }
}


