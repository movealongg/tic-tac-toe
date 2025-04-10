const board = document.querySelector('#board');
const container = document.querySelector('.container');
const gameSelection = document.querySelector('#game-selection');
const onePlayerGameSelection = document.querySelector('#player-1');
const twoPlayerGameSelection = document.querySelector('#player-2');
const gameStatus = document.querySelector('#status');
const restart = document.querySelector('#restart');

let blankCells = [
    '', '', '',
    '', '', '',
    '', '', '',
];
const solutions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
const player1 = 'X';
const player2 = 'O';
let currentPlayer;
let gameType = '';
let winner;

// Initialize the game board. For each blank cell, add a div with the class cell and give it an id equal to the index
// Add click events to all the buttons
function initializeGame() {
    blankCells.forEach((_cell, index) => {
        const cells = document.createElement('div');
        cells.classList.add('cell');
        cells.id = index;
        board.append(cells);
    });
    restart.addEventListener('click', resetGame);
    onePlayerGameSelection.addEventListener('click', onePlayerGame);
    twoPlayerGameSelection.addEventListener('click', twoPlayerGame);
}

initializeGame();

// Start the game and style it according to type. Add click events to each game cell
function startGame(type) {
    if (type === 'new') {
        container.style.display = 'flex';
        gameSelection.style.display = 'none';
    }
    if (type === 'reset') {
        container.style.display = 'none';
        gameSelection.style.display = 'flex';
    }

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', takeATurn);
        if (type === 'reset') {
            cell.innerHTML = '';
            cell.style.cursor = 'pointer';
        }
    });
    currentPlayer = player1;
    gameStatus.innerHTML = `${currentPlayer}'<span>s</span> turn`;
}

// Take turns in the game (as long as there is no winner)
function takeATurn(e) {
    if (!winner) {
        const clickedCell = e.target;

        // Create and add player piece to board after player takes a turn 
        let player = document.createElement('p');
        player.classList.add('player');
        clickedCell.append(player);
        player.innerHTML = currentPlayer;
        blankCells[clickedCell.id] = currentPlayer;
    
        // Remove pointer cursor and click event once cell has been clicked already 
        clickedCell.removeEventListener('click', takeATurn);
        clickedCell.style.cursor = 'default';
    
        // Update current player to opposite player after taking a turn and also update status
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        gameStatus.innerHTML = `${currentPlayer}'<span>s</span> turn`;
    
        // Check for winner after each turn
        checkWinner();
    
        // If one player game is selected & it's player2 aka cpu's turn 
        if (gameType === 'cpu' && currentPlayer === player2) {
            // Get all cells on the page
            const cells = [...document.querySelectorAll('.cell')];
    
            const emptyCells = [];
            // For each empty cell, push its id to the emptyCells array 
            cells.forEach(cell => {
                if (cell.innerHTML === '') {
                    emptyCells.push(cell.id);
                    // Remove event listeners while cpu takes a turn
                    cell.removeEventListener('click', takeATurn)
                }
            });
            
            // For each X and O move, push its id to their respective play arrays
            let xPlays = [];
            let oPlays = [];
            blankCells.forEach((cell, i) => cell === 'X' ? xPlays.push(i) : cell === 'O' ? oPlays.push(i) : '');
    
            /*
                Figure out potential win situations. If the board matches 2/3 indexes in a solution,
                have the computer's next move be that third slot to block player 1 from winning or to win the game.
                If there's more than one potential win situation, find the first situation that has a blank
                spot on the board.
            */
            let xPotentialWin;
            let oPotentialWin;
    
            let xPotentialWins = solutions.filter(
                solution => {
                    let count = 0;
                    xPlays.forEach(x => solution.includes(x) ? count++ : count + 0)
                    if (count > 1) {
                        return solution;
                    }
                }
            );
            for (const cell of emptyCells) {
                let openSpot = xPotentialWins.find(win => win.includes(Number(cell)));
                if (openSpot) {
                    xPotentialWin = openSpot;
                    break;
                }
            }
    
            let oPotentialWins = solutions.filter(
                solution => {
                    let count = 0;
                    oPlays.forEach(o => solution.includes(o) ? count++ : count + 0)
                    if (count > 1) {
                        return solution;
                    }
                }
            );
            for (const cell of emptyCells) {
                let openSpot = oPotentialWins.find(win => win.includes(Number(cell)));
                if (openSpot) {
                    oPotentialWin = openSpot;
                    break;
                }
            }
      
            let randomCellId;
    
            setTimeout(() => {
                // If there's a potential spot for O to win, make that move
                if (oPotentialWin !== undefined) {
                    randomCellId = oPotentialWin.filter(o => !oPlays.includes(o));
                // If there's a potential spot for X to win, block that move
                } else if (xPotentialWin !== undefined) {
                    randomCellId = xPotentialWin.filter(x => !xPlays.includes(x));
                // If all else fails, pick a random spot
                } else {
                    // Generate random cell index for cpu turn 
                    let cpuTurn = Math.floor(Math.random() * emptyCells.length);
    
                    // Select a random blank cell 
                    randomCellId = emptyCells[cpuTurn];
                }
     
                /* 
                    If there's no winner yet and the random cell index you generated is blank on the board,
                    add the cpu/player2 to the cell, change the status, update the board,
                    remove click event and cursor 
                */
                if (blankCells[randomCellId] === '' && !winner) {
                    // Create and add player piece to board after cpu takes a turn
                    let player2 = document.createElement('p');
                    player2.classList.add('player');
                    cells[randomCellId].append(player2);
                    player2.innerHTML = currentPlayer;
                    blankCells[randomCellId] = currentPlayer;
    
                    // Remove pointer cursor and click event after cpu takes a turn
                    cells[randomCellId].removeEventListener('click', takeATurn);
                    cells[randomCellId].style.cursor = 'default';
                } 
          
                // Update current player and status after each turn
                currentPlayer = player1;
                gameStatus.innerHTML = `${currentPlayer}'<span>s</span> turn`;
    
                if (currentPlayer === player1 && !winner) {
                    cells.forEach(cell => {
                        if (cell.innerHTML === '') {
                            // Add event listeners back after cpu takes a turn
                            setTimeout(() => {
                                cell.addEventListener('click', takeATurn);
                            }, 100);
                        }
                    });
                }
    
                // check for winner after each turn 
                checkWinner();
            }, 400);
        } 
    }

}

// Starts a one player game against the computer
function onePlayerGame() {
    startGame('new');
    gameType = 'cpu';
}

// Starts a regular two player game 
function twoPlayerGame() {
    startGame('new');
    gameType = 'regular';
}

// Removes click events after game ends and winner or tie is announced
function disableCellClicks() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.removeEventListener('click', takeATurn);
        cell.style.cursor = 'default';
    }); 
}

// Find a winner
function checkWinner() {
    winner = false;
    // Go through list of solutions and see if all three cells in solution match X or O. If so, update status with winner 
    // If someone wins, remove event listeners on all cells and default cursor 
    solutions.forEach(solution => {
        let xWins = solution.every(cell => blankCells[cell] === 'X');
        let oWins = solution.every(cell => blankCells[cell] === 'O');

        if (xWins || oWins) {
            gameStatus.innerHTML = `${xWins ? 'X' : 'O'} wins!!!`;
            solution.forEach(cell => document.getElementById(cell).firstChild.classList.add('win'));
            winner = true;
            disableCellClicks();
            return;
        }
    });

    // If no one wins and there's no winner, change status and remove event listener and default cursor 
    let noWins = blankCells.every(cell => cell !== '');
    if (noWins && !winner) {
        gameStatus.innerHTML = `No one wins!!!`;
        disableCellClicks();
    }
}

// Reset the game to play again
function resetGame() {
    blankCells = [
        '', '', '',
        '', '', '',
        '', '', '',
    ];
    gameType = '';
    winner = false;
    startGame('reset');
}