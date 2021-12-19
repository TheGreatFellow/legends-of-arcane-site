import React, { useEffect, useState } from 'react'
import './SelectCharacter.css'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants'
import myEpicGame from '../../utils/MyEpicGame.json'

/*
 * Don't worry about setCharacterNFT just yet, we will talk about it soon!
 */
const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([])
    const [gameContract, setGameContract] = useState(null)

    const mintCharacterNFTAction = (characterId) => async () => {
        try {
            if (gameContract) {
                console.log('Minting character in progress...')
                const mintTxn = await gameContract.mintCharacterNFT(characterId)
                await mintTxn.wait()
                console.log('mintTxn:', mintTxn)
            }
        } catch (error) {
            console.warn('MintCharacterAction Error:', error)
        }
    }

    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className='character-item' key={character.name}>
                <div className='name-container'>
                    <p>{character.characterName}</p>
                </div>
                <img src={character.imageURL} alt={character.name} />
                <button
                    type='button'
                    className='character-mint-button'
                    onClick={mintCharacterNFTAction(index)}
                >{`Mint ${character.characterName}`}</button>
            </div>
        ))

    useEffect(() => {
        const { ethereum } = window

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            )

            setGameContract(gameContract)
        } else {
            console.log('Ethereum object not found')
        }
    }, [])

    useEffect(() => {
        const getCharacters = async () => {
            try {
                console.log('Getting contract characters to mint')

                const charactersTxn =
                    await gameContract.getAllDefaultCharacters()
                console.log('charactersTxn:', charactersTxn)

                const characters = charactersTxn.map((characterData) =>
                    transformCharacterData(characterData)
                )

                setCharacters(characters)
            } catch (error) {
                console.error(
                    'Something went wrong fetching characters:',
                    error
                )
            }
        }

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            )

            if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT()
                console.log('CharacterNFT: ', characterNFT)
                setCharacterNFT(transformCharacterData(characterNFT))
                alert(
                    `Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`
                )
            }
        }

        if (gameContract) {
            getCharacters()
            gameContract.on('CharacterNFTMinted', onCharacterMint) //mint listener
        }
        return () => {
            /*
             * When your component unmounts, let;s make sure to clean up this listener
             */
            if (gameContract) {
                gameContract.off('CharacterNFTMinted', onCharacterMint)
            }
        }
    }, [gameContract])

    return (
        <div className='select-character-container'>
            <h2>Mint Your Hero. Choose wisely.</h2>
            <div className='character-grid'>{renderCharacters()}</div>
        </div>
    )
}

export default SelectCharacter
