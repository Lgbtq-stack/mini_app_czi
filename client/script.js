import {getAccountBalance} from "./stellar_helper.js";
import {create_config, previous_price} from "./config_builder.js";
import {web_app_version} from "./Config.js";
import {get_config} from "../datacontoller.js";


const check_token = "CZI:GAATAURKW525OLU4LE27QB5FSM4PQXDSTJ6YEG7E7E6GA2FCWORUSA6Y"

function getConfigFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedConfig = urlParams.get('config');

    console.log("encodedConfig: ", encodedConfig);

    if (encodedConfig) {
        try {
            const decodedConfig = decodeURIComponent(encodedConfig);
            return JSON.parse(decodedConfig);
        } catch (error) {
            console.error('Error decoding config:', error);
            return null;
        }
    } else {
        console.error('No config parameter found in URL');
        showPopup("Please close your wallet app and open it up again to get the your information UpToDate. 🛠", false);
        return null;
    }
}


async function getConfig() {
    let remoteConfig = await get_config(getConfigFromURL());
    // let remoteConfig = wallet_test_config;

    if (!remoteConfig.wallet || remoteConfig.wallet === "") {
        showPopup(`You don't have active wallet. ⚠️`, false);
        return null;
    }

    let all_balances = await getAccountBalance(remoteConfig.wallet);

    let balance = all_balances[check_token];
    if (balance === undefined) {
        console.error('No balance found for check_token');
        showPopup("Please add trusline your wallet to the CZI token. 🛠", false);
        return null;
    }

    console.log("remoteConfig: ", remoteConfig);
    console.log("balance: ", balance);


    if (!remoteConfig.version) {
        showPopup("Please close your wallet app and open it up again to get the your information UpToDate. 🛠", false);
        return null;
    }

    if (remoteConfig.version === web_app_version) {
        console.log('Config is up to date');
        return create_config(remoteConfig.wallet, balance);
    } else if (remoteConfig.version < web_app_version) {
        showPopup("Please close your wallet app and open it up again to get the your information UpToDate. 🛠", false);
        return null;
    } else if (remoteConfig.version > web_app_version) {
        showPopup("Please close your wallet app and open it up again to get the your information UpToDate. 🛠", false);
        return null;
    } else {
        showPopup("Please close your wallet app and open it up again to get the your information UpToDate. 🛠", false);
        return null;
    }

}

function showPopup(message, bool) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("pop-message");
    const closePopupButton = document.getElementById("close-popup");

    popupMessage.textContent = message;
    popup.style.display = "block";

    closePopupButton.addEventListener("click", () => {
        popup.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });
    if (!bool) {
        closePopupButton.style.display = "none";
    }
}

window.addEventListener("load", () => {
    document.body.classList.add("page-loaded");

    window.scrollTo(0, 0);
});

function updateWalletInfo(walletAddress, tokens) {
    document.getElementById('wallet-address').textContent = `${walletAddress}`;

    let totalBalance = 0;
    tokens.forEach(token => {
        totalBalance += token.price * token.amount;
    });

    document.getElementById("balance").textContent = `${round(totalBalance, 2)} USD`;
}

export function updateTokenPriceAndArrow({ symbol, price, arrow, percentageChange }) {
    const priceElement = document.getElementById(`price-${symbol}`);
    const arrowElement = document.getElementById(`arrow-${symbol}`);
    const totalElement = document.getElementById(`total-${symbol}`);

    if (priceElement && arrowElement) {
        priceElement.innerHTML = `$${price.toFixed(2)}`;
        arrowElement.innerHTML = `
            <span class="price-arrow ${getArrowClass(arrow)}">
                ${arrow} ${percentageChange.toFixed(2)}%
            </span>
        `;

        const token = config.tokens.find(t => t.symbol === symbol);
        if (token) {
            const total = price * token.amount;
            totalElement.innerHTML = `~$${total.toFixed(2)}`;
        }
    }
}

function getArrowClass(arrow) {
    if (arrow === '▲') return 'green';
    if (arrow === '▼') return 'red';
    return 'black';
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function createTokenPanel(token) {
    const tokenPanel = document.createElement("div");
    let randomValue = getRandom(0.01, 0.04);

    tokenPanel.classList.add("token-panel");

    tokenPanel.innerHTML = `
    <div class="token-info">
        <img src="${token.logo}" alt="${token.name}" class="token-logo">
        <div class="token-details">
            <div class="token-name-symbol">
                <span class="token-symbol">${token.symbol}</span>
                <span class="token-name">${token.name}</span>
            </div>
            <div class="token-price-container">
                <span class="token-price" id="price-${token.symbol}">$${token.price.toFixed(3)}</span>
                <span class="price-arrow ${getArrowClass(previous_price[token.symbol])}" id="arrow-${token.symbol}">
                    ${previous_price[token.symbol] || '⧫'} ${token.price > 0 ? `${randomValue.toFixed(2)}%` : ''}
                </span>
            </div>
        </div>
    </div>
    <div class="token-right">
        <span class="token-quantity">${round(token.amount, 7)}</span>
        <span id="total-${token.symbol}" class="token-total">~$${round((token.price * token.amount), 2)}</span>
    </div>`;

    return tokenPanel;
}

function createRewardsPanel(transaction) {
    const rewardPanel = document.createElement('div');
    rewardPanel.classList.add('rewards-panel');

    rewardPanel.innerHTML = `
  <div class="rewards-info">
      <div class="rewards-left">
          <img src="${transaction.logo}" alt="${transaction.symbol}" class="rewards-logo">
          <div class="rewards-details">
              <div class="rewards-name-symbol">
                  <span class="rewards-symbol">${transaction.symbol}</span>
                  <span class="rewards-name">${transaction.name}</span>
              </div>
              <span class="rewards-amount">+$${transaction.amount}</span>
              <span class="rewards-text">Crypto account given for being a level ${transaction.level} investor.</span>
          </div>
      </div>
      <div class="rewards-right">
          <span class="rewards-level">Level ${transaction.level}</span>
      </div>
  </div>
`;
    return rewardPanel;
}

const tabButtons = document.querySelectorAll(".tab-button");
const withdrawButton = document.getElementById("withdraw-button");

function toggleTab(activeTab) {
    const tabs = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.classList.remove("active", "left", "right");
    });

    const activeTabContent = document.querySelector(`#${activeTab}`);
    activeTabContent.classList.add("active");
    activeTabContent.innerHTML = "";

    if (activeTab === "rewards-tab") {

        const sortedTransactions = config.transaction.sort((a, b) => b.level - a.level);

        sortedTransactions.forEach(transaction => {
            activeTabContent.appendChild(createRewardsPanel(transaction));
        });
    } else if (activeTab === "coins-tab") {
        for (const token of config.tokens) {
            activeTabContent.appendChild(createTokenPanel(token));
        }
    }
}

tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const activeTabButton = document.querySelector(".tab-button.active");
        const activeTabContent = document.querySelector(".tab-content.active");

        if (activeTabButton !== button) {
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            const nextTab = button.dataset.tab;
            const currentTabContent = document.querySelector(`#${activeTabContent.id}`);

            if (nextTab === "rewards-tab") {
                currentTabContent.classList.add("left");
                withdrawButton.style.display = "none";

                setTimeout(() => {
                    window.scrollTo(0, 0);

                    currentTabContent.innerHTML = "";
                    toggleTab("rewards-tab");

                }, 175);
            } else if (nextTab === "coins-tab") {

                window.scrollTo(0, 0);
                currentTabContent.classList.add("right");

                const nextTabContent = document.querySelector(`#${nextTab}`);
                nextTabContent.classList.add("left");

                setTimeout(() => {
                    currentTabContent.innerHTML = "";
                    currentTabContent.classList.remove("active", "right");

                    nextTabContent.classList.remove("left");
                    nextTabContent.classList.add("active");
                    withdrawButton.style.display = "block";

                    toggleTab(nextTab);
                }, 175);
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const withdrawButton = document.getElementById("withdraw-button");
    const popup = document.getElementById("popup");
    const closePopupButton = document.getElementById("close-popup");

    withdrawButton.addEventListener("click", () => {
        popup.style.display = "block";
    });

    closePopupButton.addEventListener("click", () => {
        popup.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });
});


function round(number, precision, minDecimals = 2) {
    const factor = 10 ** precision;
    const rounded = Math.round(number * factor) / factor;

    const decimals = rounded.toString().split('.')[1]?.length || 0;

    return decimals < minDecimals
        ? rounded.toFixed(minDecimals)
        : rounded.toString();
}


let config = null;

document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
    const walletContainer = document.querySelector(".wallet-container");

    config = await getConfig();

    toggleTab("coins-tab");
    updateWalletInfo(config.wallet_address, config.tokens);

    walletContainer.style.opacity = "0";
    walletContainer.style.transition = "opacity .5s ease-in";

    setTimeout(() => {
        walletContainer.style.opacity = "1";
    }, 50);
}
