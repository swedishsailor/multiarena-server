const { gameHeight, gameWidth, playerSpeed, firstSkill, manaRegen, hpRegen, firstSkillHotkey, secondSkillHotkey, secondSkill, thirdSkillHotkey, thirdSkill, exhaust } = require('./constants');

let canIMove = true;
let canMoveRight = true;
let canMoveLeft = true;
let castedByPlayer1 = false;
let castedByPlayer2 = false;
let player1GotShot = false;
let player2GotShot = false;
let player1FaceLeft = false;
let player2FaceLeft = false;
let canPlayer1Move = true;
let canPlayer2Move = true;


module.exports = {
    gameLoop,
    getUpdatedVelocity,
    initGame,
    getUpdatedHp,
    imageFlip,
    getUpdatedSkill1,
    player1TakingDamage,
    player2TakingDamage,
    getUpdatedSkill2,
    getUpdatedSkill3,
}

function initGame() {
    const state = createGameState();
    return state;
}


function collision(object1, object2, colliderObject) {
    var dx = object1.pos.x - object2.pos.x;
    var dy = object1.pos.y - object2.pos.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < object1.radius + object2.radius) {
        if (colliderObject === 'playersCollision') {
            //console.log('player collides a player');
        }
    }
}

function collision2(object1, object2, colliderObject) {
    var dx = object1.pos.x - object2.x;
    var dy = object1.pos.y - object2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < object1.radius + object2.radius) {
        /* Skill 1 */
        if (colliderObject === 'Skill1Player1' && castedByPlayer2 === true) {
            //console.log('player 1 is damageeed!');
            player1GotShot = true;
            castedByPlayer2 = false;
        }
        if (colliderObject === 'Skill1Player2' && castedByPlayer1 === true) {
            //console.log('player 2 is damaged');
            player2GotShot = true;
            castedByPlayer1 = false;
        }
        /* Skill 2 */
        if (colliderObject === 'Skill2Player1' && castedByPlayer2 === true) {
            //console.log('player 2 is damaged');
            player1GotShot = true;
            castedByPlayer2 = false;
        }
        if (colliderObject === 'Skill2Player2' && castedByPlayer1 === true) {
            //console.log('player 2 is damaged');
            player2GotShot = true;
            castedByPlayer1 = false;
        }
        /* Skill 3 */
        if (colliderObject === 'Skill3Player1') {
            canPlayer1Move = false;

            setTimeout(() => {
                canPlayer1Move = true;
            }, thirdSkill.duration / 3);
            canMoveRight = false;
        }
        if (colliderObject === 'Skill3Player2') {
            canPlayer2Move = false;  //VERY GOOD EXAMPLE OF STUNN, it will be needed later

            setTimeout(() => {
                canPlayer2Move = true;
            }, thirdSkill.duration / 3);
            canMoveRight = false;
        }
    }
    return;
}

/*
 * These two functions below are made to send to server changed vars, which are updated every frame, those vars determine if player should or shouldn't get hit
 */
function player1TakingDamage(result) {
    let result1;
    if (result === 1) {
        if (player1GotShot === true) {
            result1 = player1GotShot;
            return result1;
        }
    } else if (result === false) {
        player1GotShot = false;
    }
    return result1;
}

function player2TakingDamage(result) {
    let result2;
    if (result === 1) {
        if (player2GotShot === true) {
            result2 = player2GotShot;
            return result2;
        }
    } else if (result === false) {
        player2GotShot = false;
    }
    return result2;
}

/*
 * Create new game state, every values are just restarted every new game click! 
 */
function createGameState() {

    return {
        players: [{
            id: 0,
            hp: 100,
            mana: 200,
            pos: {
                x: 620,
                y: 460
            },
            vel: {
                x: 0,
                y: 0
            },
            radius: 30,
            img: './images/player.png',
        }, {
            id: 1,
            hp: 100,
            mana: 200,
            pos: {
                x: 1110,
                y: 460
            },
            vel: {
                x: 0,
                y: 0
            },
            radius: 30,
            img: './images/player2.png',
        }
        ],
        healingPotion: {},
        skill1: [],
        skill2: [],
        skill3: [],
    };
}

/*
 * Gameloop function makes these whole funcs declared below transfered to the server and get it to the setinterval
 */
function gameLoop(state) {
    if (!state) {

        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    const skill1 = state.skill1;
    const skill2 = state.skill2;
    const skill3 = state.skill3;

    collision(playerOne, playerTwo, 'playersCollision');
    /* Skill 1 */
    skill1.forEach(object => {
        if (playerTwo.pos.x === object.x) {
            collisionFirst = collision2(playerOne, object, 'Skill1Player1');
        }
        if (playerOne.pos.x === object.x) {
            collisionSecond = collision2(playerTwo, object, 'Skill1Player2');
        }
    });


    /* Skill 2 */
    skill2.forEach(object => {
        if (playerTwo.pos.x + 274 === object.x || playerTwo.pos.x - 270 === object.x) {
            collisionFirst = collision2(playerOne, object, 'Skill2Player1');
        }
        if (playerOne.pos.x + 274 === object.x || playerOne.pos.x - 270 === object.x) {
            collisionSecond = collision2(playerTwo, object, 'Skill2Player2');
        }
    });
    /* Skill 3 */

    skill3.forEach(object => {
        collisionSecond = collision2(playerTwo, object, 'Skill3Player2');
        collisionFirst = collision2(playerOne, object, 'Skill3Player1');
    });

    player1TakingDamage(1);
    player2TakingDamage(1);

    /**
     * 
     This block is controling where is the edge of the screen and makes player not corssing those edges
     *
     **/
    if (canPlayer1Move) {
        /*var dx = playerOne.pos.x - skill3.x;
        var dy = playerOne.pos.y - skill3.y;
        var dx1 = playerTwo.pos.x - skill3.x;
        var dy1 = playerTwo.pos.y - skill3.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);*/
        //console.log(dx, dy);

        if ((playerOne.pos.x < gameWidth && playerOne.pos.x > 0) || (playerOne.pos.x >= gameWidth && playerOne.vel.x < 0) || (playerOne.pos.x <= 0 && playerOne.vel.x > 0)) {
            /* The block of code which makes player nr 1 not able to get through the wall (skill3) in x axis */
            /*if( !(distance<= playerOne.radius + skill3.radius && dx <= 0) && playerOne.vel.x > 0 ){
            playerOne.pos.x += playerOne.vel.x;
            } else if (!(distance<= playerOne.radius + skill3.radius && dx >= 0) && playerOne.vel.x < 0 ){*/
            playerOne.pos.x += playerOne.vel.x;
            //}
        }
        if ((playerOne.pos.y < gameHeight && playerOne.pos.y > 0) || (playerOne.pos.y >= gameHeight && playerOne.vel.y < 0) || (playerOne.pos.y <= 0 && playerOne.vel.y > 0)) {
            /* The block of code which makes player nr 1 not able to get through the wall (skill3) in y axis */
            /*if( !(distance<= playerOne.radius + skill3.radius && dy <= 0) && playerOne.vel.y > 0){
                playerOne.pos.y += playerOne.vel.y;
                } else if (!(distance<= playerOne.radius + skill3.radius && dy >= 0) && playerOne.vel.y < 0){*/
            playerOne.pos.y += playerOne.vel.y;
            //}
        }
    }
    if (canPlayer2Move) {

        if ((playerTwo.pos.x < gameWidth && playerTwo.pos.x > 0) || (playerTwo.pos.x >= gameWidth && playerTwo.vel.x < 0) || (playerTwo.pos.x <= 0 && playerTwo.vel.x > 0)) {
            /* The block of code which makes player nr 2 not able to get through the wall (skill3) in x axis */
            /*if( !(distance1<= playerTwo.radius + skill3.radius && dx <= 0) && playerTwo.vel.x > 0){
                playerTwo.pos.x += playerTwo.vel.x;
                } else if (!(distance1<= playerTwo.radius + skill3.radius && dx >= 0) && playerTwo.vel.x < 0){*/
            playerTwo.pos.x += playerTwo.vel.x;
            //}
        }
        if (((playerTwo.pos.y < gameHeight && playerTwo.pos.y > 0) || (playerTwo.pos.y >= gameHeight && playerTwo.vel.y < 0) || (playerTwo.pos.y <= 0 && playerTwo.vel.y > 0))) {
            /* The block of code which makes player nr 2 not able to get through the wall (skill3) in x axis */
            /*if( !(distance1<= playerTwo.radius + skill3.radius && dy <= 0) && playerTwo.vel.y > 0){
                playerTwo.pos.y += playerTwo.vel.y;
                } else if (!(distance1<= playerTwo.radius + skill3.radius && dy >= 0) && playerTwo.vel.y < 0){*/
            playerTwo.pos.y += playerTwo.vel.y;
            //}
        }

    }    /*
    * The end of player not going out!
    */

    /*
     * if one of the players dies, end the game and choose winner
     */
    if (playerOne.hp <= 0) {
        return 2;
    }

    if (playerTwo.hp <= 0) {
        return 1;
    }


    /*
     * If mana and hp is not full regenerate it during the time
     */
    if (playerOne.mana < 200) {
        playerOne.mana += manaRegen;
    }
    if (playerTwo.mana < 200) {
        playerTwo.mana += manaRegen;
    }

    if (playerOne.hp < 100) {
        playerOne.hp += hpRegen;
    }
    if (playerTwo.hp < 100) {
        playerTwo.hp += hpRegen;
    }

    return false;
}

function healingPotions(state) {
    healingPotion = {
        x: Math.floor(Math.random() * 50),
        y: Math.floor(Math.random() * 50),
    }

    state.healingPotion = healingPotion;
}

function getUpdatedVelocity(keyCode, state) {

    if (state !== null) {
        switch (keyCode) {
            case 37: {// left
                return { x: -playerSpeed, y: state.y };
            }
            case 38: {// down
                return { x: state.x, y: -playerSpeed };
            }
            case 39: {// right
                return { x: playerSpeed, y: state.y };
            }
            case 40: {// up
                return { x: state.x, y: playerSpeed };
            }
            case 65: {// left
                return { x: -playerSpeed, y: state.y };
            }
            case 87: {// down
                return { x: state.x, y: -playerSpeed };
            }
            case 68: {// right
                return { x: playerSpeed, y: state.y };
            }
            case 83: {// up
                return { x: state.x, y: playerSpeed };
            }
            case 0: {
                return { x: 0, y: 0 };
            }
        }
    }
}

/*
 * This func informs server that players should have changed images when heading to other direction that image is made for
 */
function imageFlip(keyCode, state) {
    if (keyCode === 65 || keyCode === 37) {
        if (state === 0) {
            player1FaceLeft = true;
            return './images/player.png';
        }
        if (state === 1) {
            player2FaceLeft = true;
            return './images/player2.png';
        }
    }
    if (keyCode === 68 || keyCode === 39) {
        if (state === 0) {
            player1FaceLeft = false;
            return './images/playerF.png';
        }
        if (state === 1) {
            player2FaceLeft = false;
            return './images/player2F.png';
        }
    }
}

/*
 * Gives server informations about skill if it's keyCode is pressed
 */
function getUpdatedHp(keyCode) {
    if ((keyCode === firstSkillHotkey)) { // Skill 1
        return firstSkill;
    }
    if (keyCode === secondSkillHotkey) {
        return secondSkill;
    }
}
/*
 * Draw skill on canvas and controll where should it be displayed!
 */
function getUpdatedSkill1(keyCode, state) {
    let playerState = state;
    if (keyCode === firstSkillHotkey) {
        if (playerState.id === 1) {
            castedByPlayer2 = true;
            return { x: playerState.pos.x, y: playerState.pos.y, radius: 256 };
        }
        if (playerState.id === 0) {
            castedByPlayer1 = true;
            return { x: playerState.pos.x, y: playerState.pos.y, radius: 256 };
        }
    }
}

function getUpdatedSkill2(keyCode, state) {
    let playerState = state;
    if (keyCode === secondSkillHotkey) {
        if (playerState.id === 1 && player2FaceLeft) {
            castedByPlayer2 = true;
            return { x: playerState.pos.x - 270, y: playerState.pos.y, radius: 96 };
        }
        if (playerState.id === 0 && player1FaceLeft) {
            castedByPlayer1 = true;
            return { x: playerState.pos.x - 270, y: playerState.pos.y, radius: 96 };
        }
        if (playerState.id === 1 && !player2FaceLeft) {
            castedByPlayer2 = true;
            return { x: playerState.pos.x + 274, y: playerState.pos.y, radius: 96 };
        }
        if (playerState.id === 0 && !player1FaceLeft) {
            castedByPlayer1 = true;
            return { x: playerState.pos.x + 274, y: playerState.pos.y, radius: 96 };
        }
    }
}

function getUpdatedSkill3(keyCode, state) {
    const playerState = state;
    if (keyCode === thirdSkillHotkey) {
        if (playerState.id === 1 && player2FaceLeft) {
            castedByPlayer2 = true;
            return { x: playerState.pos.x - 90, y: playerState.pos.y, radius: 48 };
        }
        if (playerState.id === 0 && player1FaceLeft) {
            castedByPlayer1 = true;
            return { x: playerState.pos.x - 90, y: playerState.pos.y, radius: 48 };
        }
        if (playerState.id === 1 && !player2FaceLeft) {
            castedByPlayer2 = true;
            return { x: playerState.pos.x + 90, y: playerState.pos.y, radius: 48 };
        }
        if (playerState.id === 0 && !player1FaceLeft) {
            castedByPlayer1 = true;
            return { x: playerState.pos.x + 90, y: playerState.pos.y, radius: 48 };
        }
    }
}

function resetVelocity(keyCode) {

}