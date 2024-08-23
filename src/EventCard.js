import Web3 from "web3";
import ABI from './contracts/StatusContract.json';
import React, { useEffect, useState } from "react";
import EventDate from './Date';
const { REACT_APP_INFURA_RPC } = process.env;

const EventCard = ({ feed, address }) => {
    const [events, setEvents] = useState([]);
    const [fam, setFam] = useState(false);
    let provider = window.ethereum;
    const eventName = "StatusUpdated";
    const web3 = new Web3(provider);

    const contractAddress = "0xEa081e46f5e3B9f240B1EB71E6b76622DB38a7B6";

    const contract = new web3.eth.Contract(ABI.abi, contractAddress);

    // gating on Fam contracts

    // Fam ABI import

    const erc20ABI = [
        {
            constant: true,

            inputs: [{ name: '_owner', type: 'address' }],

            name: 'balanceOf',

            outputs: [{ name: 'balance', type: 'uint256' }],

            type: 'function',
        },
    ];

    // Fam tokens addresses

    const efrogs = "0x194395587d7b169e63eaf251e86b1892fa8f1960";
    const croack = "0xacb54d07ca167934f57f829bee2cc665e1a5ebef";
    const lxp = "0xd83af4fbd77f3ab65c3b1dc4b38d7e67aecf599a";

    // check Fam ownership

    const lineaProv = REACT_APP_INFURA_RPC;

    const LineaClient = new Web3(new Web3.providers.HttpProvider(lineaProv));

    var web3linea = new Web3(LineaClient);

    const croackcontract = new web3linea.eth.Contract(erc20ABI, croack);
    const lxpcontract = new web3linea.eth.Contract(erc20ABI, lxp);
    const efrogcontract = new web3linea.eth.Contract(erc20ABI, efrogs);

    const getDev = async (add) => {
        if (add === "0xb67153a6005edbc61aD945057063885bB639dC23") {
            setFam(true);
        }
    };

    const getFam2 = async (add) => {

        const isFam = await lxpcontract.methods.balanceOf(add).call();
        if (isFam > 0) {
            setFam(true);
        } else {
            getDev(add);
           // console.log("not lxp");
        }
    };

    const getFam1 = async (add) => {

        const isFam = await efrogcontract.methods.balanceOf(add).call();
        if (isFam > 0) {
            setFam(true);
        } else {
            getFam2(add)
            // console.log("not efrog");
        }

    };

    const getFam = async (add) => {
        let isValid = await isValidAddress(add);
        if (isValid) {
            const isFam = await croackcontract.methods.balanceOf(add).call();
            if (isFam > 0) {
                setFam(true);
            } else {
                getFam1(add);
                // console.log("not croack");
            }
        }
    };

    const isValidAddress = (adr) => {
        try {
            const web3 = new Web3();
            web3.utils.toChecksumAddress(adr);
            return true;
        } catch (e) {
            return false;
        }
    }

    useEffect(() => {
        const getEvents = async (contract, address) => {
            try {
                let events = await contract.getPastEvents(eventName, {
                    filter: {
                        user: address,
                    },
                    fromBlock: 1747337,
                    toBlock: "latest"
                });
                let display = events.reverse();
                setEvents(display);
            } catch (error) {
                console.log(error);
            }
        }
        getEvents(contract, address);
        getFam(address);
    }, []);

    return (
        <> {!fam ? "" : <p className="text-white jedi">{ feed }</p>}
            <ol class="my-7 list-outside">
                {events.map(function (data, index) {
                    return (
                        <li className="flex items-center mb-4" key={index}>
                            <strong className="bg-primary text-white rounded-full w-8 h-8 text-lg font-semibold flex items-center justify-center mr-3">{((events.length) - index)}</strong>
                            <span className="text-white">{data.returnValues[1]}</span> <EventDate timestamp={data.blockNumber} />
                        </li>
                    )
                })}
            </ol>
        </>
        )
}
export default EventCard;
