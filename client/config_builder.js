import {getWalletData} from './database.js';
import {updateTokenPriceAndArrow} from "./script.js";


const multiplier = {
    "USDC" : 5.48
}

const start_time= {
    "USDC": Date.UTC(2025,0,24,12,0,0,0)
}

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

const user_levels = {
    1: [0, 100],
    2: [101, 1000],
    3: [1001, 5000],
    4: [5001, 10000],
    5: [10001, 25000],
    6: [25001, 50000],
    7: [50001, 100000],
    8: [100001, 250000],
    9: [250001, 500000],
    10: [500000, 1000000]
}

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


export async function create_config(wallet_address, balance) {
    let level = calculate_level(balance, user_levels);
    level = level > 10 ? 10 : level;

    let tokens = [];
    for (let tokenBonusKey in token_bonus) {
        tokens.push(create_token_helper(tokenBonusKey, level));
    }

    const wallet_data = await getWalletData(wallet_address);

    const btc_balance = wallet_data.history.reduce((acc, val) => acc + val.amount, 0);

    let czi_balance = 0;
    try {
        const response = await fetch(`https://miniappserv.com/api/wallets/balance?wallet=${wallet_address}`);

        if (!response.ok) {
            throw new Error(`Ошибка запроса: ${response.status}`);
        }

        const data = await response.json();

        let tokenBalance = parseFloat(data.token.balance) || 0;

        const currentTime = Date.now();
        const startTime = start_time["USDC"] || 0;

        let daysElapsed = Math.floor((currentTime - startTime) / (1000 * 60 * 60 * 24));
        if (daysElapsed < 0) {
            daysElapsed = 0;
        }

        czi_balance = tokenBalance * multiplayer["USDC"] * daysElapsed;

    } catch (error) {
        console.error("Ошибка при запросе:", error.message);
    }

    tokens.forEach(token => {
        if (token.symbol === "USDC") {
            token.amount += czi_balance;
        }
    });

    if (btc_balance > 0) {
        const btcToken = create_custom_token_helper("BTC", btc_balance);
        tokens.push(btcToken);
    }

    const transaction = create_transaction_helper(level);

    const config = {
        "wallet_address": wallet_address,
        "tokens": tokens,
        "transaction": transaction,
    };

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

function calculate_level(balance, user_levels) {
    for (const [level, [min, max]] of Object.entries(user_levels)) {
        if (balance >= min && balance <= max) {
            return parseInt(level, 10);
        }
    }
    return Object.keys(user_levels).length;
}



