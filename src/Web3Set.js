import Web3 from "web3";
import ABI from './contracts/StatusContract.json';

let contract;

export const set = async (provider) => {

        const web3 = new Web3(provider);

        const contractAddress ="0xEa081e46f5e3B9f240B1EB71E6b76622DB38a7B6";

    contract = new web3.eth.Contract(ABI.abi, contractAddress);

    };

const isValidAddress = (adr) => {
    try {
        const web3 = new Web3()
        web3.utils.toChecksumAddress(adr)
        return true
    } catch (e) {
        return false
    }
}

export const setStatus = async (newStatus, account) => {
    let isValid = await isValidAddress(account);
    if (isValid) {
        try {
            const web3 = new Web3(window.ethereum);
            const contractAddress = "0xEa081e46f5e3B9f240B1EB71E6b76622DB38a7B6";
            contract = new web3.eth.Contract(ABI.abi, contractAddress);
            await contract.methods.setStatus(newStatus).send({ from: account });
            console.log(newStatus)
        } catch (error) {
            console.log(error);
            return error;
        }
    }
};
