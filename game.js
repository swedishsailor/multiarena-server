const { gameHeight, gameWidth, playerSpeed, firstSkill, manaRegen, hpRegen, firstSkillHotkey, secondSkillHotkey, secondSkill, thirdSkillHotkey, thirdSkill, exhaust
    , fourthSkill, fourthSkillHotkey } = require('./constants');

let canIMove = true;
let player1MoveRight = true;
let player1MoveLeft = true;
let player1MoveUp = true;
let player1MoveDown = true;
let player2MoveRight = true;
let player2MoveLeft = true;
let player2MoveUp = true;
let player2MoveDown = true;
let castedByPlayer1 = false;
let castedByPlayer2 = false;
let player1GotShot = false;
let player2GotShot = false;
let player1FaceLeft = false;
let player2FaceLeft = false;
let canPlayer1Move = true;
let canPlayer2Move = true;
let playerExhaust = false;
let playAnimation = false;

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
    getUpdatedSkill4,
}

function initGame() {
    const state = createGameState();
    return state;
}


function collisionPlayerAndPlayer(object1, object2, colliderObject) {
    var dx = object1.pos.x - object2.pos.x;
    var dy = object1.pos.y - object2.pos.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < object1.radius + object2.radius) {
        if (colliderObject === 'playersCollision') {
            //console.log('player collides a player');
        }
    }
}

function collisionPlayerAndObject(object1, object2, colliderObject) {
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
            //canMoveRight = false;
        }
        if (colliderObject === 'Skill3Player2') {
            canPlayer2Move = false;  //VERY GOOD EXAMPLE OF STUNN, it will be needed later

            setTimeout(() => {
                canPlayer2Move = true;
            }, thirdSkill.duration / 3);
            //canMoveRight = false;
        }
    }
    return;
}

function collisionCircleAndRectangle(circle, rectangle, colliderObject) {
    var distX = Math.abs(circle.pos.x - rectangle.x - rectangle.width / 2);
    var distY = Math.abs(circle.pos.y - rectangle.y - rectangle.height / 2);

    if (distX > (rectangle.width / 2 + circle.radius)) return false;
    if (distY > (rectangle.height / 2 + circle.radius)) return false;

    if (distX <= (rectangle.width / 2)) return true;
    if (distY <= (rectangle.height / 2)) return true;

    var dx = distX - rectangle.width / 2;
    var dy = distY - rectangle.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
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
        players:[{
            id: 0,
            hp: 100,
            mana: 200,
            width: 128,
            height: 96,
            pos: {
                x: 300,
                y: 450
            },
            vel: {
                x: 0,
                y: 0
            },
            radius: 30,
            img: './images/playersColorFundefined.png',
            color:0,
        }, {
            id: 1,
            hp: 100,
            mana: 200,
            width: 128,
            height: 96,
            pos: {
                x: 1200,
                y: 450
            },
            vel: {
                x: 0,
                y: 0
            },
            radius: 30,
            img: './images/playersColor2undefined.png',
            color:0,
        }
        ],
        healingPotion: {},
        skill1: [],
        skill2: [],
        skill3: [],
        skill4: [],
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
    const skill4 = state.skill4;

    /* Every frame refresh both players movement */ 
    player1MoveDown = true;
    player1MoveUp = true;
    player1MoveLeft = true;
    player1MoveRight = true;
    player2MoveDown = true;
    player2MoveUp = true;
    player2MoveLeft = true;
    player2MoveRight = true;


    collisionPlayerAndPlayer(playerOne, playerTwo, 'playersCollision');
    /* Skill 1 */
    skill1.forEach(object => {
        if (playerTwo.pos.x === object.x) {
            collisionFirst = collisionPlayerAndObject(playerOne, object, 'Skill1Player1');
        }
        if (playerOne.pos.x === object.x) {
            collisionSecond = collisionPlayerAndObject(playerTwo, object, 'Skill1Player2');
        }
    });


    /* Skill 2 */
    skill2.forEach(object => {
        if (playerTwo.pos.x + 274 === object.x || playerTwo.pos.x - 270 === object.x) {
            collisionFirst = collisionPlayerAndObject(playerOne, object, 'Skill2Player1');
        }
        if (playerOne.pos.x + 274 === object.x || playerOne.pos.x - 270 === object.x) {
            collisionSecond = collisionPlayerAndObject(playerTwo, object, 'Skill2Player2');
        }
    });
    /* Skill 3 */

    skill3.forEach(object => {
        collisionSecond = collisionPlayerAndObject(playerTwo, object, 'Skill3Player2');
        collisionFirst = collisionPlayerAndObject(playerOne, object, 'Skill3Player1');
    });
    /* Skill 4 */
    skill4.forEach(object => {

        if (collisionCircleAndRectangle(playerTwo, object, 'Skill4Player2')) {
            /* Player cant go down when he collides with north wall */
            if (playerTwo.pos.y === object.y) {
                player2MoveDown = false;
            }
            /* Player cant go right when he collided with west wall */
            else if (playerTwo.pos.x  === object.x) {
                player2MoveRight = false;
            }
            /* Player cant go left when he collided with east wall */
            else if (playerTwo.pos.x  === object.x + object.width) {
                player2MoveLeft = false;
            }
            /* Player cant go up when he collided with south wall */
            else if (playerTwo.pos.y === object.y + object.height) {
                player2MoveUp = false;
            }
        } else {
            player2MoveDown = true;
            player2MoveUp = true;
            player2MoveLeft = true;
            player2MoveRight = true;
        }
        if (collisionCircleAndRectangle(playerOne, object, 'Skill4Player1')) {
            if (playerOne.pos.y === object.y) {
                player1MoveDown = false;
            }
            /* Player cant go right when he collided with west wall */
            else if (playerOne.pos.x  === object.x) {
                player1MoveRight = false;
            }
            /* Player cant go left when he collided with east wall */
            else if (playerOne.pos.x  === object.x + object.width) {
                player1MoveLeft = false;
            }
            /* Player cant go up when he collided with south wall */
            else if (playerOne.pos.y === object.y + object.height) {
                player1MoveUp = false;
            }
        } else {
            player1MoveDown = true;
            player1MoveUp = true;
            player1MoveLeft = true;
            player1MoveRight = true;
        }
    
    });

    player1TakingDamage(1);
    player2TakingDamage(1);

    /**
     * 
     This block is controling where is the edge of the screen and makes player not corssing those edges
     *
     **/
    /* Player 1 movement */
    if (canPlayer1Move) {
        if ((playerOne.pos.x < gameWidth && playerOne.pos.x > 0) || (playerOne.pos.x >= gameWidth && playerOne.vel.x < 0) || (playerOne.pos.x <= 0 && playerOne.vel.x > 0)) {
                if (playerOne.vel.x > 0 && player1MoveRight || playerOne.vel.x < 0 && player1MoveLeft) {
            playerOne.pos.x += playerOne.vel.x;
                }
        }
        if ((playerOne.pos.y < gameHeight && playerOne.pos.y > 0) || (playerOne.pos.y >= gameHeight && playerOne.vel.y < 0) || (playerOne.pos.y <= 0 && playerOne.vel.y > 0)) {
                    if (playerOne.vel.y > 0 && player1MoveDown || playerOne.vel.y < 0 && player1MoveUp) {
            playerOne.pos.y += playerOne.vel.y;
                    }
        }
    }
    /* Player 2 movement */
    if (canPlayer2Move) {

        if ((playerTwo.pos.x < gameWidth && playerTwo.pos.x > 0) || (playerTwo.pos.x >= gameWidth && playerTwo.vel.x < 0) || (playerTwo.pos.x <= 0 && playerTwo.vel.x > 0)) {
            if (playerTwo.vel.x > 0 && player2MoveRight || playerTwo.vel.x < 0 && player2MoveLeft) {
                playerTwo.pos.x += playerTwo.vel.x;
            }
        }
        if (((playerTwo.pos.y < gameHeight && playerTwo.pos.y > 0) || (playerTwo.pos.y >= gameHeight && playerTwo.vel.y < 0) || (playerTwo.pos.y <= 0 && playerTwo.vel.y > 0))) {
            if (playerTwo.vel.y > 0 && player2MoveDown || playerTwo.vel.y < 0 && player2MoveUp) {
                playerTwo.pos.y += playerTwo.vel.y;
            }
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
        if (keyCode === 37 || keyCode === 65) {// left
            state.x = 0;
            return { x: -playerSpeed, y: state.y };
        }
        else if ((keyCode === 38 || keyCode === 87) && (keyCode === 37 || keyCode === 65)){
            state.x = 0;
            state.y = 0;
            return { x: -playerSpeed, y: -playerSpeed };
        }
        else if ((keyCode === 39 || keyCode === 68) && (keyCode === 40 || keyCode === 83)){
            state.x = 0;
            state.y = 0;
            return { x: playerSpeed, y: playerSpeed };
        }
        else if ((keyCode === 38 || keyCode === 87) && (keyCode === 39 || keyCode === 68)){
            state.x = 0;
            state.y = 0;
            return { x: playerSpeed, y: -playerSpeed };
        }
        else if ((keyCode === 37 || keyCode === 65) && (keyCode === 40 || keyCode === 83)){
            state.x = 0;
            state.y = 0;
            return { x: -playerSpeed, y: playerSpeed };
        }
        else if (keyCode === 38 || keyCode === 87) {// down
            state.y = 0;
            return { x: state.x, y: -playerSpeed };
        }
        else if (keyCode === 39 || keyCode === 68) {// right
            state.x = 0;
            return { x: playerSpeed, y: state.y };
        }
        else if (keyCode === 40 || keyCode === 83) {// up
            state.y = 0;
            return { x: state.x, y: playerSpeed };
        } else {
            return  {x: 0, y: 0 };
        }
    }
}

/*
 * This func informs server that players should have changed images when heading to other direction that image is made for
 */
function imageFlip(keyCode, state, players, color, playerId) {
    //players[state].color = color;
    if (keyCode === 65 || keyCode === 37) {
        if (state === 0 && players[0].color === 0) {
            player1FaceLeft = true;
            return `./images/playersColor${color}.png`;
        }
        if (state === 1 && players[1].color === 0 && color === undefined) {
            player2FaceLeft = true;
            return `./images/playersColor2${color}.png`;
        }
        if (state === 0  && color !== 0) {
            player1FaceLeft = true;
            return `./images/playersColor${color}.png`;
        }
        if (state === 1 && color !== 0) {
            player2FaceLeft = true;
            return `./images/playersColor${color}.png`;
        }
    }
    if (keyCode === 68 || keyCode === 39) {
        if (state === 0 && players[0].color === 0 && color === undefined) {
            player1FaceLeft = false;
            return `./images/playersColorF${color}.png`;
        }
        if (state === 1 && players[1].color === 0 && color === undefined) {
            player2FaceLeft = false;
            return `./images/playersColor2F${color}.png`;
        }
        if (state === 0 && color !== 0) {
            player1FaceLeft = false;
            return `./images/playersColor${color}F.png`;
        }
        if (state === 1 && color !== 0) {
            player2FaceLeft = false;
            return `./images/playersColor${color}F.png`;
        }
    }
}


/*
 * Gives server informations about skill if it's keyCode is pressed
 */
function getUpdatedHp(keyCode) {
    if (!playerExhaust) {
        setTimeout(() => {
            playerExhaust = false;
        }, exhaust + 500);
        if ((keyCode === firstSkillHotkey)) { // Skill 1
            playerExhaust = true;
            playAnimation = true;
            return firstSkill;
        }
        if (keyCode === secondSkillHotkey) {
            playerExhaust = true;
            playAnimation = true;
            return secondSkill;
        }
        if (keyCode === thirdSkillHotkey) {
            playerExhaust = true;
            playAnimation = true;
            return thirdSkill;
        }
        if (keyCode === fourthSkillHotkey) {
            playerExhaust = true;
            playAnimation = true;
            return fourthSkill;
        }
    }
}
/*
 * Draw skill on canvas and controll where should it be displayed!
 */
function getUpdatedSkill1(keyCode, state) {
    let playerState = state;


    if (keyCode === firstSkillHotkey && playAnimation) {
        if (playerState.id === 1) {
            castedByPlayer2 = true;
            playAnimation = false;
            return { x: playerState.pos.x, y: playerState.pos.y, radius: 148 };
        }
        if (playerState.id === 0) {
            castedByPlayer1 = true;
            playAnimation = false;
            return { x: playerState.pos.x, y: playerState.pos.y, radius: 148 };
        }
    }

}

function getUpdatedSkill2(keyCode, state) {
    let playerState = state;

    if (keyCode === secondSkillHotkey && playAnimation) {
        if (playerState.id === 1 && player2FaceLeft) {
            castedByPlayer2 = true;
            playAnimation = false;
            return { x: playerState.pos.x - 270, y: playerState.pos.y, radius: 94 };
        }
        if (playerState.id === 0 && player1FaceLeft) {
            castedByPlayer1 = true;
            playAnimation = false;
            return { x: playerState.pos.x - 270, y: playerState.pos.y, radius: 94 };
        }
        if (playerState.id === 1 && !player2FaceLeft) {
            castedByPlayer2 = true;
            playAnimation = false;
            return { x: playerState.pos.x + 274, y: playerState.pos.y, radius: 94 };
        }
        if (playerState.id === 0 && !player1FaceLeft) {
            castedByPlayer1 = true;
            playAnimation = false;
            return { x: playerState.pos.x + 274, y: playerState.pos.y, radius: 94 };
        }
    }

}

function getUpdatedSkill3(keyCode, state) {
    const playerState = state;
    if (keyCode === thirdSkillHotkey && playAnimation) {
        if (playerState.id === 1 && player2FaceLeft) {
            castedByPlayer2 = true;
            playAnimation = false;
            return { x: playerState.pos.x - 90, y: playerState.pos.y, radius: 48 };
        }
        if (playerState.id === 0 && player1FaceLeft) {
            castedByPlayer1 = true;
            playAnimation = false;
            return { x: playerState.pos.x - 90, y: playerState.pos.y, radius: 48 };
        }
        if (playerState.id === 1 && !player2FaceLeft) {
            castedByPlayer2 = true;
            playAnimation = false;
            return { x: playerState.pos.x + 90, y: playerState.pos.y, radius: 48 };
        }
        if (playerState.id === 0 && !player1FaceLeft) {
            castedByPlayer1 = true;
            playAnimation = false;
            return { x: playerState.pos.x + 90, y: playerState.pos.y, radius: 48 };
        }
    }
}

function getUpdatedSkill4(keyCode, state) {
    let playerState = state;

    if (keyCode === fourthSkillHotkey && playAnimation) {
        if (playerState.id === 1 && player2FaceLeft) {
            castedByPlayer2 = true;
            playAnimation = false;
            return { x: playerState.pos.x - 75, y: playerState.pos.y - 60, radius: 94, width: 60, height: 195 };
        }
        if (playerState.id === 0 && player1FaceLeft) {
            castedByPlayer1 = true;
            playAnimation = false;
            return { x: playerState.pos.x - 75, y: playerState.pos.y - 60, radius: 94, width: 60, height: 195 };
        }
        if (playerState.id === 1 && !player2FaceLeft) {
            castedByPlayer2 = true;
            playAnimation = false;
            return { x: playerState.pos.x + 75, y: playerState.pos.y - 60, radius: 94, width: 60, height: 195 };
        }
        if (playerState.id === 0 && !player1FaceLeft) {
            castedByPlayer1 = true;
            playAnimation = false;
            return { x: playerState.pos.x + 75, y: playerState.pos.y - 60, radius: 94, width: 60, height: 195 };
        }
    }

}