export async function getWalletData(wallet_address) {
    try {
        console.log('Getting active wallet for wallet', wallet_address);
        const response = await fetch(`https://miniappserv.com/api/wallets/data/${wallet_address}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting wallets:', error.message);
        throw error;
    }
}

