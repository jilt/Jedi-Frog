import Web3 from "web3";
import ABI from './contracts/StatusContract.json';
import React, { useEffect, useState } from "react";
import EventDate from './Date';


const EventCard = ({ feed }) => {
    const [events, setEvents] = useState([]);
    let provider = window.ethereum;
    let selectedAccount;
    const eventName = "StatusUpdated";
    const web3 = new Web3(provider);

    const contractAddress = "0xEa081e46f5e3B9f240B1EB71E6b76622DB38a7B6";

    const contract = new web3.eth.Contract(ABI.abi, contractAddress);

    provider.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
            selectedAccount = accounts[0];
            // console.log(`Selected account for events: ${selectedAccount}`);
        })
        .catch(error => { console.log(error); });


    useEffect(() => {
        const getEvents = async (contract) => {
            try {
                let events = await contract.getPastEvents(eventName, {
                    filter: {},
                    fromBlock: 1747337,
                    toBlock: "latest"
                });
                let display = events.reverse();
                setEvents(display);
                // console.log(display);
            } catch (error) {
                console.log(error);
            }
            // setList(events);
        }
        getEvents(contract, selectedAccount);
    }, []);

    return (
        <>
            <ol class="my-7 list-outside">
                {events.map(function (data, index) {
                    return (
                        <li className="flex items-center mb-4" key={index}>
                            <strong className="bg-primary text-white rounded-full w-8 h-8 text-lg font-semibold flex items-center justify-center mr-3">{index}</strong>
                            <span className="text-white">{data.returnValues[1]}</span> <br /><EventDate timestamp={data.blockNumber}/>
                        </li>
                    )
                })}
            </ol>
        </>
        )
}
export default EventCard;