"use strict";// The JavaScript strict mode is a feature in ECMAScript 5. You can enable the strict mode by declaring this in the top of your script/function. 'use strict'; When a JavaScript engine sees this directive, it will start to interpret the code in a special mode - http://stackoverflow.com/questions/1335851/what-does-use-strict-do-in-javascript-and-what-is-the-reasoning-behind-it
let stage;// From MDN - The let statement declares a block scope local variable, optionally initializing it to a value.
// We categorize users as (1) humans (2) computer
let renderer;
let Graphics;
let lowestUnfilledRow;
let currentplayer;
let board;
let tile;
let isGameOver;
const humanDisk = 16773120;// color code for human's disk
const computerdisk = 4095;// color code for computer's disk
let isFirstMove;
let clickedColoumn;
requestAnimationFrame(animate);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
}
function init() {
    Graphics = PIXI.Graphics;
    stage = new PIXI.Stage(6750105);// sets the background color for the pixi element
    renderer = PIXI.autoDetectRenderer(640, 500);
    // attach the renderer element to the DOM
    document.getElementById('gameContainer').appendChild(renderer.view);
    lowestUnfilledRow = 5;
    currentplayer = 'human';
    displayMessage('');
    isGameOver = false;
    //6*7 matrix (board)
    board = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];

    for (let i = 6; i >= 0; i--) {
        for (let j = 5; j >= 0; j--) {
            tile = new Graphics();// code for creating rectangles
            tile.beginFill(16777215);// 16777215
            tile.drawRect(110 + 60 * i, 80 + 55 * j, 50, 50);//draw rectangles recursively
            tile.endFill();
            tile.buttonMode = true;
            tile.interactive = true;
            tile.val = j + "-" + i;// the value of the rectangle has to contain two attributes - row number & column numbr, we save it as a pair of row_number-col_number (row_number+'-'+'col_number')
            tile.on('click', onTilesClick);
            stage.addChild(tile);// appends the pixi element we created (tile) to the original pixi element (stage)
        }
    }
}
// finding the bottom most available row and fill a rectangle.
function onTilesClick() {// onclick event for every rectangle space we click on
    if (!isGameOver) {
        // the val is saved as "rownum - colnum" so split on "-" and get the 1st element, that will be the column; the reason we are not interested in the row number is because we have to determine the first available row (from bottom to up)
        clickedColoumn = Number(this.val.split('-')[1]);
        const rowLength = board.length;
        const rowObj = findEmptyRow(clickedColoumn, rowLength - 1);
        if (rowObj.available) {//success, save the row & column number as above, row_num-col_num
            const insertionSlot = `${ rowObj.slot }-${ clickedColoumn }`;
            place(insertionSlot);
        }
    }
}
// finding the bottom most available row in a column by recursively search for a empty slot
function findEmptyRow(a, index) {
    if (index === -1) {// base case for recursion, -1 says that we have reached the top of the parent rectangle (board) -> No empty slot in the col
        return {
            available: false,
            slot: -1
        };    
    }
    if (board[index][a] === 0) {// empty slot found, return availability status (true) & the column index of the slot
        return {
            available: true,
            slot: index
        };
    }
    return findEmptyRow(a, index - 1);
}

// check for horizontal connection winner (human-human-human-human or computer-computer-computer-computer)
function checkHorizontalConnect(checkForPlayer) {
    const retVal = false;
    for (let i = board.length - 1; i >= lowestUnfilledRow; i--) {
        for (let j = 0; j < board[i].length; j++) {
            // check if the middle col for that row is occupied
            const midCol = board[0].length - 4;
            const middleElement = board[i][midCol];
            if (middleElement !== checkForPlayer || middleElement === 0) {
                // No chance of horizontal match with this condition as for 4 matches in horizontal (for a given row), we need to have the rectanlge in 3rd row
                break;
            }
            
            if (checkForPlayer === board[i][j] && board[i][j] === board[i][j + 1] && board[i][j] === board[i][j + 2] && board[i][j] === board[i][j + 3] && board[i][j + 3] !== undefined) {
                console.log(`horizontal connection winner ${ checkForPlayer }`);
                return true;
            }
        }
    }
    return retVal;
}
//check for vertical connection winner (human-
//                                      human-
//                                      human-
//                                      human or computer-
//                                               computer-
//                                               computer-
//                                               computer)
function checkVerticalConnection(checkForPlayer) {
    const retVal = false;
    for (let i = board.length - 1; i >= lowestUnfilledRow; i--) {
        for (let j = 0; j < board[i].length; j++) {
            if (i - 3 < 0) {
                break;
            }
            if (checkForPlayer === board[i][j] && board[i][j] === board[i - 1][j] && board[i - 1][j] === board[i - 2][j] && board[i - 2][j] === board[i - 3][j] && board[i - 3] !== undefined) {
                console.log(`vertical connection winner ${ currentplayer }`);
                return true;
            }
        }
    }
    return retVal;
}
//check for diagonal connection winner (human-
//                                    human-
//                                   human-
//                                  human or computer-
//                                            computer-
//                                             computer-
//                                              computer)
function checkDiagonalConnection(checkForPlayer) {
    const retVal = false;
    // check for diagonal connection towards left
    for (let i = board.length - 1; i >= 3; i--) {
        for (let j = board[i].length - 1; j >= 0; j--) {
            if (board[i - 3] !== undefined && checkForPlayer === board[i][j] && board[i][j] === board[i - 1][j - 1] && board[i - 1][j - 1] === board[i - 2][j - 2] && board[i - 2][j - 2] === board[i - 3][j - 3]) {
                return true;
            }
        }
    }
    // check for diagonal connection towards right
    for (let i = board.length - 1; i >= 3; i--) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i - 3] !== undefined && checkForPlayer === board[i][j] && board[i][j] === board[i - 1][j + 1] && board[i - 1][j + 1] === board[i - 2][j + 2] && board[i - 2][j + 2] === board[i - 3][j + 3]) {
                return true;
            }
        }
    }
    return retVal;
}
// message board to display messages on the game's message board.
function displayMessage(msg) {
    document.getElementById("message").innerHTML = msg;
}

// reset button to reset the game
function resetGame() {
    document.getElementById('gameContainer').removeChild(renderer.view);
    init();//call the init (initialize) function again
}

// check for the winner before changing the player
function checkCurrentGameStatus() {
    if (checkHorizontalConnect(currentplayer) || checkVerticalConnection(currentplayer) || checkDiagonalConnection(currentplayer)) {
        isGameOver = true;
        displayMessage(`Game Over, ${ currentplayer } is the winner, click 'reset' to play again.`);
    } else if (checkIfTie()) {//check for tie
        isGameOver = true;
        displayMessage('Game Over, Game resulted in a tie... click \'reset\' to play again.');
    }
}

// check if game is a tie
function checkIfTie() {
    // if the last available row for all the columns is not available, and the game is not won by anyone then it's a tie
    if (!findEmptyRow(0, board.length - 1).available && !findEmptyRow(1, board.length - 1).available && !findEmptyRow(2, board.length - 1).available && !findEmptyRow(3, board.length - 1).available && !findEmptyRow(4, board.length - 1).available && !findEmptyRow(5, board.length - 1).available && !findEmptyRow(6, board.length - 1).available) {
        return true;
    } else
        false;
}

// the logic from the computer's side (upon its turn) - strategy explained in the README file
function getNextMove() {
    let nextSmartMove;

    if (isFirstMove) {// we set isFirstMove as true in the init function
        isFirstMove = false;
        // check if the middle column is filled by the player (optimal strategy - explained in the README file)
        const rowObj = findEmptyRow(3, board.length - 1);
        // execute if empty slot present in that coloumn
        if (rowObj.available) {
            nextSmartMove = `${ rowObj.slot }-3`;
            return nextSmartMove;
        }
    }

    // case 2.1 - if next move is computer's win move, then do it (refer strategy in README file)
    let col = 0;
    while (col < 7) {
        const row = findEmptyRow(col, board.length - 1);
        if (row.available) {
            board[row.slot][col] = 'computer';
            const isFourConnectPossiable = checkHorizontalConnect('computer') || checkVerticalConnection('computer') || checkDiagonalConnection('computer');
            if (isFourConnectPossiable) {
                board[row.slot][col] = 0;//block if the user wins in the next chance
                nextSmartMove = `${ row.slot }-${ col }`;
                break;
            }
            // backtrack
            board[row.slot][col] = 0;
        }
        col++;
    }

    if (nextSmartMove != undefined)
        return nextSmartMove;
    // case 2.2 - check if next move is human's win move, then block it (refer strategy in README file)
    col=0;
    while (col<7) {
        const row = findEmptyRow(col, board.length - 1);
        if (row.available) {
            board[row.slot][col] = 'human';
            const isFourConnectPossiable = checkHorizontalConnect('human') || checkVerticalConnection('human') || checkDiagonalConnection('human');
            if (isFourConnectPossiable) {
                board[row.slot][col] = 0;//block if the user wins in the next chance
                nextSmartMove = `${ row.slot }-${ col }`;
                break;
            }
            // backtrack
            board[row.slot][col] = 0;
        }
        col++;
    }

    if (nextSmartMove!= undefined)
        return nextSmartMove;

    // case 2.3 - try putting a disk on the same column where the human has clicked (refer strategy in README file)
    let rowObj = findEmptyRow(clickedColoumn, board.length - 1);
    // execute if empty slot present in that coloumn
    if (rowObj.available) {
        nextSmartMove = `${ rowObj.slot }-${ clickedColoumn }`;
        return nextSmartMove;
    }

    // case 2.4 - try putting the rectangle on the next available column (refer strategy in README file)
    clickedColoumn = 0;
    while (clickedColoumn<7) {
        if(clickedColoumn == 6) clickedColoumn =0;
        rowObj = findemptyrow(clickedColoumn++, board.length - 1);
        if (rowObj.available) {
            nextSmartMove = `${ rowObj.slot }-${ clickedColoumn }`;
            return nextSmartMove;
        }
    }
}

// place the disk at the available slot (slot clicked by user or slot chosen by our strategy in case of computer) 
function place(slot) {
    var insertionSlot = slot;
    // color the cell with above row and col value.
    for (var i = 0; i < stage.children.length; i++) {
        if (stage.children[i].val !== undefined && stage.children[i].val === insertionSlot) {
            if (currentplayer == 'human')
                stage.children[i].tint = humanDisk;
            else stage.children[i].tint = computerdisk;
            if (slot.split('-')[0] < lowestUnfilledRow) {
                lowestUnfilledRow = slot.split('-')[0];
            }
            // finally update the board matrix for our internal calculation
            // add some non 0 value to know it's filled
            board[slot.split('-')[0]][slot.split('-')[1]] = currentplayer;
            renderer.render(stage);
            checkCurrentGameStatus();
            // change the player turn
            if (!isGameOver) {
                if (currentplayer == 'human') {
                    currentplayer = 'computer';
                } else {
                    currentplayer = 'human';
                }
            }
            if (!isGameOver && currentplayer == 'computer') {
                place(getNextMove());// if its computer's chance, choose the optimal move as per our strategy (mentioned in the README file)
            }
        }
    }
}