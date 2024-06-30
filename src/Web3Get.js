import Web3 from "web3";


const isValidAddress = (adr) => {
    try {
        const web3 = new Web3()
        web3.utils.toChecksumAddress(adr)
        return true
    } catch (e) {
        return false
    }
}

export const getStatus = async (contract, account) => {

    console.log(account);
    let isValid = await isValidAddress(account);
    if (isValid) {
        try {
            let timeline = await contract.methods.getStatus(account).call();
            console.log(timeline);
        } catch (error) {
            console.log(error);
            return error;
        }
    }
};