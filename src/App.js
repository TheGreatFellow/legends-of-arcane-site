import React, { useEffect, useState } from 'react'
import { CONTRACT_ADDRESS, transformCharacterData } from './constants'
import Arena from './Components/Arena'
import myEpicGame from './utils/MyEpicGame.json'
import SelectCharacter from './Components/SelectCharacter'
import LoadingIndicator from './Components/LoadingIndicator'
import './App.css'
import { ethers } from 'ethers'

// Constants

const App = () => {
    const [currentAccount, setCurrentAccount] = useState(null)
    const [characterNFT, setCharacterNFT] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window

            if (!ethereum) {
                console.log('Make sure you have MetaMask!')

                setIsLoading(false)
                return
            } else {
                console.log('We have the ethereum object', ethereum)

                const accounts = await ethereum.request({
                    method: 'eth_accounts',
                })

                if (accounts.length !== 0) {
                    const account = accounts[0]
                    console.log('Found an authorized account:', account)
                    setCurrentAccount(account)
                } else {
                    console.log('No authorized account found')
                }
            }
        } catch (error) {
            console.log(error)
        }

        setIsLoading(false)
    }
    const checkNetwork = async () => {
        try {
            if (window.ethereum.networkVersion !== '4') {
                alert('Please connect to Rinkeby!')
            }
        } catch (error) {
            console.log(error)
        }
    }

    const renderContent = () => {
        if (isLoading) {
            return <LoadingIndicator />
        }

        if (!currentAccount) {
            return (
                <div className='connect-wallet-container'>
                    <img
                        src='https://media1.giphy.com/media/HODJLQURRo4wAcDcVu/giphy.gif?cid=ecf05e47it9qdg8podke7c74l7gnhdqyooddhwk1gqbwnbxo&rid=giphy.gif'
                        alt='Vi and Jinx Gif'
                    />
                    <button
                        className='cta-button connect-wallet-button'
                        onClick={connectWalletAction}
                    >
                        Connect Wallet To Get Started
                    </button>
                </div>
            )
        } else if (currentAccount && !characterNFT) {
            return <SelectCharacter setCharacterNFT={setCharacterNFT} />
        } else if (currentAccount && characterNFT) {
            return (
                <Arena
                    characterNFT={characterNFT}
                    setCharacterNFT={setCharacterNFT}
                />
            )
        }
    }

    const connectWalletAction = async () => {
        try {
            const { ethereum } = window

            if (!ethereum) {
                alert('Get MetaMask!')
                return
            }
            const accounts = await ethereum.request({
                //request access to account
                method: 'eth_requestAccounts',
            })
            console.log('Connected', accounts[0]) //print the public address
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        setIsLoading(true)
        checkIfWalletIsConnected()
        checkNetwork()
    }, [])

    useEffect(() => {
        const fetchNFTMetadata = async () => {
            console.log(
                'Checking for Character NFT on address:',
                currentAccount
            )

            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            )

            const characterNFT = await gameContract.checkIfUserHasNFT()
            if (characterNFT.characterName) {
                console.log('User has character NFT')
                setCharacterNFT(transformCharacterData(characterNFT))
            }

            setIsLoading(false)
        }

        if (currentAccount) {
            console.log('CurrentAccount:', currentAccount)
            fetchNFTMetadata()
        }
    }, [currentAccount])

    return (
        <div className='App'>
            <div className='container'>
                <div className='header-container'>
                    <p className='header gradient-text'>
                        ?????? Legends of Arcane ??????
                    </p>
                    <p className='sub-text'>
                        There's a Monster Inside All of Us!
                    </p>
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}

export default App
