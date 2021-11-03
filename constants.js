/*
 * GAME options 
 */

const FRAME_RATE = 60;
const gameHeight = 700;
const gameWidth = 1360;

/*
 * Player options and constants
 */
const playerSpeed = 15;
const manaRegen = 0.05;
const hpRegen =0.0025;
const exhaust = 1000;

/*
 * Skills setup
 */
const firstSkill={
    damage: 15,
    mana: 30,
};
const secondSkill={
    damage: 25,
    mana: 25,
}
const thirdSkill ={
    damage:0,
    mana:30,
    duration: 3750, // in miliseconds
}
const fourthSkill ={
    damage:0,
    mana:30,
    duration: 6500,
}
const firstSkillHotkey = 49;
const secondSkillHotkey = 50;
const thirdSkillHotkey = 51;
const fourthSkillHotkey = 52;


module.exports = {
    FRAME_RATE,
    gameHeight,
    gameWidth,
    playerSpeed,
    firstSkill,
    manaRegen,
    hpRegen,
    firstSkillHotkey,
    secondSkillHotkey,
    secondSkill,
    thirdSkillHotkey,
    thirdSkill,
    exhaust,
    fourthSkill,
    fourthSkillHotkey,
}