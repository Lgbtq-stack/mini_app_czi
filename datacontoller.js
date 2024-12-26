import {getActiveWallet} from './Core/database.js';

//user-id 350104566
export async function get_config(data) {
    const wallet_data = await getActiveWallet(data.user_id);

    return {
        'wallet': wallet_data.address,
        'levels_config': data.levels_config,
        'version': data.version
    };

}