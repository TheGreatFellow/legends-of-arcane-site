const CONTRACT_ADDRESS = '0x45C6386Df24Fc333ce793926B0Cbf86A0ef1c4eC'

const transformCharacterData = (characterData) => {
    return {
        characterName: characterData.characterName,
        imageURL: characterData.imageURL,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
        origin: characterData.origin,
        specialAttack: characterData.specialAttack,
    }
}

export { CONTRACT_ADDRESS, transformCharacterData }
