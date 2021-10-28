const io = require('socket.io')({
    cors: {
        origin: "*"
    }
});

const { FRAME_RATE, firstSkill, firstSkillHotkey, secondSkill, thirdSkill } = require('./constants');
const { gameLoop, getUpdatedVelocity, initGame, getUpdatedHp, imageFlip, getUpdatedSkill1, player1TakingDamage, player2TakingDamage, getUpdatedSkill2, getUpdatedSkill3 } = require('./game');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};


io.on('connection', client => {
    client.on('keydown', handleKeydown);
    client.on('keyup', handleKeyUp);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms[roomName];


        let allUsers;
        if (room) {
            allUsers = room.sockets;
        }

        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }


        if (numClients === 1) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(roomName);

        console.log('game has started');
    }

    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch (e) {
            console.error(e);
            return;
        }

        if (state[roomName] !== null) {
            /*
             * Set character velocity by a certain value
             */
            const vel = getUpdatedVelocity(keyCode, state[roomName].players[client.number - 1].vel);


            if (vel) {
                state[roomName].players[client.number - 1].vel = vel;
            }
        }

        /*
         * First skill damage and mana cost config
         * We get player who used skill, then we get from game.js if this skill aimed other player, then with little delay update both players status
         */

        const hp = getUpdatedHp(keyCode, state[roomName].players[client.number - 1].hp);
        if (hp && (client.number - 1 === 1)) {
            setTimeout(() => {
                if (hp && (client.number - 1 === 1) && player1TakingDamage(1) === true && state[roomName].players[1].mana >= firstSkill.mana) {
                    client.emit('minusHp', state[roomName].players[0].pos, hp.damage);
                    state[roomName].players[0].hp -= hp.damage;
                    state[roomName].players[1].mana -= hp.mana;
                    player1TakingDamage(false);
                } else if (hp && (client.number - 1 === 1) && state[roomName].players[1].mana >= firstSkill.mana) {
                    state[roomName].players[1].mana -= hp.mana;
                }
            }, 10);
        }
        if (hp && (client.number - 1 === 0)) {
            setTimeout(() => {
                if (hp && (client.number - 1 === 0) && player2TakingDamage(1) === true && state[roomName].players[0].mana >= firstSkill.mana) {
                    client.emit('minusHp', state[roomName].players[1].pos, hp.damage);
                    state[roomName].players[1].hp -= hp.damage;
                    state[roomName].players[0].mana -= hp.mana;
                    player2TakingDamage(false);
                } else if (hp && (client.number - 1 === 0) && state[roomName].players[0].mana >= firstSkill.mana) {
                    state[roomName].players[0].mana -= hp.mana;
                }
            }, 10);
        }

        const img = imageFlip(keyCode, client.number - 1);

        if (img && (client.number - 1 === 0)) {
            state[roomName].players[client.number - 1].img = img;
        }
        if (img && (client.number - 1 === 1)) {
            state[roomName].players[client.number - 1].img = img;
        }

        /*
         * Draw skill and delete it after a certain time
         * Also when player doesn't have enought mana, he can't use skill and it will not be drawn on canvas
         */
        const skill1 = getUpdatedSkill1(keyCode, state[roomName].players[client.number - 1]);

        if (skill1 && (client.number - 1 === 1) && state[roomName].players[1].mana >= firstSkill.mana) {
            state[roomName].skill1.push(skill1);
            setTimeout(function () {
                if (state[roomName] !== null) {
                    state[roomName].skill1 = [];

                }
            }, 450);
        }
        if (skill1 && (client.number - 1 === 0) && state[roomName].players[0].mana >= firstSkill.mana) {
            state[roomName].skill1.push(skill1);
            setTimeout(function () {
                if (state[roomName] !== null) {
                    state[roomName].skill1 = [];

                }
            }, 450);
        }

        const skill2 = getUpdatedSkill2(keyCode, state[roomName].players[client.number - 1]);

        if (skill2 && (client.number - 1 === 1) && state[roomName].players[1].mana >= secondSkill.mana) {
            state[roomName].skill2.push(skill2);
            setTimeout(function () {
                if (state[roomName] !== null) {
                    state[roomName].skill2 = [];

                }
            }, 350);
        }
        if (skill2 && (client.number - 1 === 0) && state[roomName].players[0].mana >= secondSkill.mana) {
            state[roomName].skill2.push(skill2);
            setTimeout(function () {
                if (state[roomName] !== null) {
                    state[roomName].skill2 = [];

                }
            }, 350);
        }

        const skill3 = getUpdatedSkill3(keyCode, state[roomName].players[client.number - 1]);

        if (skill3 && (client.number - 1 === 1) && state[roomName].players[1].mana >= secondSkill.mana) {
            state[roomName].skill3.push(skill3);
            setTimeout(function () {
                if (state[roomName] !== null) {
                    state[roomName].skill3.forEach(object => {
                        const index = state[roomName].skill3.indexOf(object);
                        state[roomName].skill3.splice(index, 1);
                    })


                }
            }, thirdSkill.duration);
        }
        if (skill3 && (client.number - 1 === 0) && state[roomName].players[0].mana >= secondSkill.mana) {
            state[roomName].skill3.push(skill3);
            setTimeout(function () {
                if (state[roomName] !== null) {
                    state[roomName].skill3.forEach(object => {
                        const index = state[roomName].skill3.indexOf(object);
                        state[roomName].skill3.splice(index, 1);
                    })


                }
            }, thirdSkill.duration);
        }
    }

    function handleKeyUp(keyCode) {
        const roomName = clientRooms[client.id];
        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch (e) {
            console.error(e);
            return;
        }
        const negateVel = getUpdatedVelocity(0, state[roomName].players[client.number - 1].vel);
        if (negateVel) {
            state[roomName].players[client.number - 1].vel = negateVel;
        }
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if (!winner) {
            emitGameState(roomName, state[roomName]);
            //client.emit('gameState', JSON.stringify(state));
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
            console.log('game has ended');
        }
    }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
    io.sockets.in(room)
        .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
    io.sockets.in(room)
        .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(3000);