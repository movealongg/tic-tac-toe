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

function initalizeGame() {
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

initalizeGame();

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

function takeATurn(e) {
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
            
        setTimeout(() => {
            // Generate random cell index for cpu turn 
            let cpuTurn = Math.floor(Math.random() * emptyCells.length);

            // Select a random blank cell 
            let randomCellId = emptyCells[cpuTurn];

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

            if (currentPlayer === player1) {
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
        }, 500);
    } 
}

function onePlayerGame() {
    startGame('new');
    gameType = 'cpu';
}

function twoPlayerGame() {
    startGame('new');
    gameType = 'regular';
}

function checkWinner() {
    winner = false;
    // Go through list of solutions and see if all three cells in solution match X or O. If so, update status with winner 
    solutions.forEach(solution => {
        let xWins = solution.every(cell => blankCells[cell] === 'X');
        if (xWins) {
            gameStatus.innerHTML = `X wins!!!`;
            solution.forEach(cell => document.getElementById(cell).firstChild.classList.add('win'));
            winner = true;
        }
        let oWins = solution.every(cell => blankCells[cell] === 'O');
        if (oWins) {
            gameStatus.innerHTML = `O wins!!!`;
            solution.forEach(cell => document.getElementById(cell).firstChild.classList.add('win'));
            winner = true;
        }
    });

    // If someone wins, remove event listeners on all cells and default cursor 
    if (winner) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.removeEventListener('click', takeATurn);
            cell.style.cursor = 'default';
        });
    }

    // If no one wins and there's no winner, change status and remove event listener and default cursor 
    let noWins = blankCells.every(cell => cell !== '');
    if (noWins && !winner) {
        gameStatus.innerHTML = `No one wins!!!`;
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.removeEventListener('click', takeATurn);
            cell.style.cursor = 'default';
        });
    }
}

function resetGame() {
    blankCells = [
        '', '', '',
        '', '', '',
        '', '', '',
    ];
    gameType = '';
    startGame('reset');
}