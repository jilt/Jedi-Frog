import logo from './assets/images/frog-logo.png';
import './assets/css/custom.css';
import './assets/css/styles.css';
import './assets/css/tailwind.css';
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { Dune } from "dune-api-client";
import ABI from './contracts/StatusContract.json';
import { set, setStatus } from './Web3Set';
import EventCard from './EventCard';
import { GoogleGenerativeAI } from '@ai-sdk/google';
// const { GoogleGenerativeAI } = require("@google/generative-ai");

function App() {
    const [status, foundStatus] = useState('');
    const [feed, setFeed] = useState('');
    const [timeline, setTimeline] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState({});
    const { REACT_APP_CHAINSAFE } = process.env;
    const { REACT_APP_BUCKET } = process.env;
    const { REACT_APP_CID } = process.env;
    const { REACT_APP_AI } = process.env;


    let selectedAccount;
    let provider;

    

    const init = async () => {

        // get addresses of EigerLAyer investors

        // const dune = new Dune('REACT_APP_DUNE');
        // const execute = await dune.execute(3592801);
        // const eiger = await dune.results(execute.data.execution_id);


        // console.log(eiger);

        // const providerUrl = process.env.INFURA_RPC;

        let provider = window.ethereum;

        if (typeof provider !== 'undefined') {

            // metamask is installed

            provider.request({ method: 'eth_requestAccounts' })
                .then(accounts => {
                    selectedAccount = accounts[0];
                    setAccount(selectedAccount);
                    console.log(`Selected account is: ${selectedAccount}`);
                })
                .catch(error => { console.log(error); });

            provider.on('accountsChanged', function (accounts) {
                selectedAccount = accounts[0];
                setAccount(selectedAccount);
                // console.log(`Selected account is: ${selectedAccount}`);
            });

            const web3 = new Web3(provider);
            

            const lineaChain = "0xe705";

            // get current metamask network

            const getCurrentChainId = async () => {
                const currentChainId = await web3.eth.getChainId();
                // console.log("current chainId:", currentChainId);
                return currentChainId;
            }

            getCurrentChainId();

            // add Linea Sepholia network to metamask

            const addNetwork = async () => {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        "params": [
                            {
                                "chainId": "0xe705",
                                "chainName": "Linea Sepolia",
                                "rpcUrls": [
                                    "https://rpc.sepolia.linea.build"
                                ],
                                "nativeCurrency": {
                                    "name": "ETH",
                                    "symbol": "ETH",
                                    "decimals": 18
                                },
                                "blockExplorerUrls": [
                                    "https://sepolia.lineascan.build/"
                                ]
                            }
                        ]
                    });
                } catch (err) {
                    console.log(`error occured while adding new chain, err: ${err.message}`)
                }
            }

            // switch to Linea Sepolia on metamask

            const switchNetwork = async (chainId) => {
                const currentChainId = await web3.eth.getChainId();
                if (currentChainId !== chainId) {
                    try {
                        await provider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: Web3.utils.toHex(chainId) }]
                        });
                        console.log(`switched to chainid : ${chainId} succesfully`);
                    } catch (err) {
                        console.log(`error occured while switching chain to chainId ${chainId}, err: ${err.message} code: ${err.code}`);
                        if (err.code === 4902) {
                            addNetwork();
                        }
                    }
                }
            }

            await switchNetwork(lineaChain);

            const contractAddress = "0xEa081e46f5e3B9f240B1EB71E6b76622DB38a7B6";

            let contract = new web3.eth.Contract(ABI.abi, contractAddress);

            setContract(contract);

        };

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

    const getPrompt = async () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const response = await fetch(`https://ipfs-chainsafe.dev/ipfs/${REACT_APP_CID}`, requestOptions);
        const data = await response.json();
        let feedNumber = Math.floor(Math.random() * 100);
        // setFeed(data.journal[feedNumber].prompt);

        // call ai model
        const genAI = new GoogleGenerativeAI(REACT_APP_AI);


        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        async function run() {
            const prompt = `can you refrase "what's the difference from then to now?" for the context of ${data.journal[feedNumber].prompt}in a general way? please give only one answer`

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            setFeed(text);
        }

        run();
    }

    const getStatus = async (contract, account) => {

        let isValid = await isValidAddress(account);
        if (isValid) {
            try {
                let timeline = await contract.methods.getStatus(account).call();
                setTimeline(timeline);
                getPrompt();
                let previous = await contract.methods.statuses(account).call();
                foundStatus(previous);
            } catch (error) {
                console.log(error);
                return error;
            }
        }
    };

    useEffect(() => {
        set(provider);
    }, []);

    return (
        <div className="App">
            <header className="bg-gray-dark sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center py-4">
                <div className="flex items-center">
                        <img src={ logo } alt="Logo" className="h-14 w-auto mr-4" />
                </div>

                <div className="flex md:hidden">
                    <button id="hamburger" className="text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                    </div>

                    <nav className="hidden md:flex md:flex-grow justify-center">
                    <ul className="flex justify-center space-x-4 text-white">
                        <li><a href="#home" className="hover:text-secondary font-bold">AI Jedi Master</a></li>
                        <li><a href="#team" className="hover:text-secondary font-bold">Fam</a></li>
                        <li><a href="#contact" className="hover:text-secondary font-bold">Contact</a></li>
                    </ul>
                    </nav>

                    <div className="hidden lg:flex items-center space-x-4">
                        <a href="https://github.com/spacemadev/Free-blue-star-tailwind-landing-page-template" className="bg-secondary hover:bg-primary text-white font-semibold px-4 py-2 rounded inline-block">Github</a>
                        <a href="https://huggingface.co/jeeltcraft" className="bg-primary hover:bg-secondary text-white font-semibold px-4 py-2 rounded inline-block">My AI Models</a>
                    </div>
                </div>
            </header>
            <nav id="mobile-menu-placeholder" className="mobile-menu hidden flex flex-col items-center space-y-8 md:hidden">
                <ul>
                    <li><a href="#home" className="hover:text-secondary font-bold">AI Jedi Master</a></li>
                    <li><a href="#team" className="hover:text-secondary font-bold">Fam</a></li>
                    <li><a href="#contact" className="hover:text-secondary font-bold">Contact</a></li>
                </ul>
                <div className="flex flex-col mt-6 space-y-2 items-center">
                    <a href="https://github.com/spacemadev/Free-blue-star-tailwind-landing-page-template" className="bg-secondary hover:bg-primary text-white font-semibold px-4 py-2 rounded inline-block flex items-center justify-center min-w-[110px]">Github</a>
                    <a href="https://huggingface.co/jeeltcraft" className="bg-primary hover:bg-secondary text-white font-semibold px-4 py-2 rounded inline-block flex items-center justify-center min-w-[110px]">My AI models</a>
                </div>
            </nav>
            <section id="home" className="py-4 bg-gray-dark">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 mb-8 md:mb-0">
                        <img src="assets/images/2.png" alt="Image" className="w-full md:mx-auto md:max-w-md" />
                    </div>

                    <div className="md:w-1/2">
                        <h2 className="text-5xl font-bold mb-4 text-white">Journal with a <span className="text-primary">Jedi</span></h2>
                        <p className="my-5 text-white">A simple journaling dapp where you can publish your day in 140 characters on the Linea blockchain, you'll get prompts by our <span className="text-primary">Jedi master</span> if you're part of our fam.</p>
          { account.length > 1 ? <>
                    <button className="bg-primary hover:bg-primary text-white font-semibold px-4 py-2 rounded" onClick={() => getStatus(contract, account)}>Get Status</button>
          <textarea
              className="message rounded-lg shadow-md px-4 py-2"
              value={newStatus}
              onChange={(e) => {
                  setNewStatus(e.target.value)
              }}
              placeholder="Your journal for today (less than 140 characters)"
          />                            {!newStatus ? <button className="bg-primary hover:bg-primary text-white font-semibold px-4 py-2 rounded" onClick={() => setStatus(newStatus, account)} disabled>Set Status</button> : <button onClick={() => setStatus(newStatus, account)}>Set Status</button>}

                            {!feed ? <div className="text-center mb-12 lg:mb-20 alert">Click "Get Status"</div> : <div className="text-center mb-12 mt-12 timeline"><EventCard feed={feed} address={account} /></div>}
                                            </> :
                                                <button className="bg-primary hover:bg-primary text-white font-semibold px-4 py-2 rounded" onClick={() => init()}>Connect</button>
                        }
                    </div>
                </div>
            </section>
            <section id="team" className="bg-gray-dark py-16 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-12 lg:mb-20">
                        <h2 className="text-5xl font-bold mb-4 text-white">AI Jedi Master for our FAM</h2>
                        <p className="text-lg text-primary font-semibold">You get to journal whoever you are but only the Fam gets to the Jedi Frog</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg overflow-hidden shadow-md">
                            <img src="assets/images/team-1.png" alt="Efrogs" className="w-full h-auto" />
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-semibold text-primary">Efrogs</h3>
                                    <p className="text-gray-dark">NFT</p>
                                </div>
                        </div>
                        <div className="bg-white rounded-lg overflow-hidden shadow-md">
                            <img src="assets/images/team-2.png" alt="Croack" className="w-full h-auto" />
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-semibold text-primary">$Croack</h3>
                                    <p className="text-gray-dark">Memecoin</p>
                                </div>
                        </div>
                        <div className="bg-white rounded-lg overflow-hidden shadow-md">
                            <img src="assets/images/team-3.png" alt="Team Member 3" className="w-full h-auto" />
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-semibold text-primary">$LXP</h3>
                                    <p className="text-gray-dark">SBToken olders</p>
                                </div>
                        </div>
                        <div className="bg-white rounded-lg overflow-hidden shadow-md">
                            <img src="assets/images/team-4.png" alt="Team Member 4" className="w-full h-auto" />
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-semibold text-primary">EigerLayer</h3>
                                    <p className="text-gray-dark">Investors</p>
                                </div>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="bg-gray-dark text-white py-16">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold mb-4">About Me</h3>
                        <p className="text-white space-y-2">I am a UX/UI developer who Just got certified to write smart contracts on Linea!</p>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold mb-4">Services</h3>
                        <ul className="space-y-2">
                            <li><a href="https://www.jeeltcraft.com" className="hover:text-secondary font-bold">Product design</a></li>
                            <li><a href="https://www.jeeltcraft.com" className="hover:text-secondary font-bold">Frontend</a></li>
                            <li><a href="https://www.jeeltcraft.com" className="hover:text-secondary font-bold">Backend</a></li>
                        </ul>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold mb-4">Contacts</h3>
                        <ul className="space-y-2">
                            <li><a href="https://www.linkedin.com/in/jeeltcraft" className="hover:text-secondary font-bold">Contact Information</a></li>
                            <li><a href="mailto:jilt@jeeltcraft.com" className="hover:text-secondary font-bold">Email</a></li>
                            <li><a href="https://www.linkedin.com/in/jeeltcraft" className="hover:text-secondary font-bold">Request a Quote</a></li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center md:items-start">
                        <img src={ logo } alt="Logo" className="h-14 w-auto mb-4"/>
                            <p>Developed by <a href="https://spacema-dev.com/" className="text-primary hover:text-secondary font-bold">Spacema-dev</a> and <a href="https://www.jeeltcraft.com/" className="text-primary hover:text-secondary font-bold">Jeeltcraft</a></p>
                    </div>
                </div>
            </footer>
        </div>
  );
};

export default App;
