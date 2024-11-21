// User management
let currentUser = null;
const users = JSON.parse(localStorage.getItem('users') || '{}');
const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');

function saveToStorage() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (users[username] && users[username].password === password) {
        currentUser = username;
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'flex';
        document.getElementById('highScore').textContent = users[username].highScore || 0;
        updateLeaderboard();
        game = new Game2048();
    } else {
        alert('Invalid username or password');
    }
}

function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (users[username]) {
        alert('Username already exists');
        return;
    }

    users[username] = {
        password: password,
        highScore: 0
    };
    saveToStorage();
    alert('Registration successful! Please login.');
    toggleForms();
}

function logout() {
    currentUser = null;
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

function toggleForms() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('registerForm').classList.toggle('hidden');
}

function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';

    const sortedScores = Object.entries(users)
        .map(([username, data]) => ({username, score: data.highScore || 0}))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    sortedScores.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <span>${index + 1}. ${entry.username}</span>
            <span>${entry.score}</span>
        `;
        leaderboardList.appendChild(item);
    });
}

class Game2048 {
    constructor() {
        this.GRID_SIZE = 4;
        this.CELL_COUNT = this.GRID_SIZE * this.GRID_SIZE;
        
        this.grid = Array(this.GRID_SIZE).fill().map(() => Array(this.GRID_SIZE).fill(0));
        this.score = 0;
        this.gridElement = document.querySelector('.grid');
        this.scoreElement = document.getElementById('score');
        this.highScore = users[currentUser]?.highScore || 0;
        document.getElementById('highScore').textContent = this.highScore;
        this.lastMove = '';
        this.newTilePositions = [];
        this.init();
    }

    init() {
        this.gridElement.innerHTML = ''; 
        for (let i = 0; i < this.CELL_COUNT; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            this.gridElement.appendChild(cell);
        }

        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('new-game').addEventListener('click', () => {
            this.reset();
        });
    }

    reset() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.lastMove = '';
        this.newTilePositions = [];
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
            this.newTilePositions.push({x, y});
        }
    }

    updateDisplay() {
        const cells = document.querySelectorAll('.cell');
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = this.grid[i][j];
                const cell = cells[i * 4 + j];
                
                cell.classList.remove('slide-up', 'slide-down', 'slide-left', 'slide-right', 'new-tile');
                
                cell.textContent = value || '';
                cell.className = `cell ${value ? 'cell-' + value : ''}`;
                
                if (value && this.lastMove) {
                    cell.classList.add(this.lastMove);
                }
                
                if (value && this.newTilePositions && 
                    this.newTilePositions.some(pos => pos.x === i && pos.y === j)) {
                    cell.classList.add('new-tile');
                }
            }
        }
        this.scoreElement.textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            users[currentUser].highScore = this.highScore;
            document.getElementById('highScore').textContent = this.highScore;
            saveToStorage();
            updateLeaderboard();
        }
    }

    handleKeyPress(event) {
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();  
        }
        
        let moved = false;
        this.lastMove = '';
        
        switch(event.key) {
            case 'ArrowUp':
                moved = this.moveUp();
                this.lastMove = 'slide-up';
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                this.lastMove = 'slide-down';
                break;
            case 'ArrowLeft':
                moved = this.moveLeft();
                this.lastMove = 'slide-left';
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                this.lastMove = 'slide-right';
                break;
            default:
                return;
        }

        if (moved) {
            this.newTilePositions = [];
            this.addRandomTile();
            this.updateDisplay();
            if (this.isGameOver()) {
                alert('Game Over! Score: ' + this.score);
            }
        }
    }

    moveLeft() {
        return this.move(row => {
            const newRow = row.filter(cell => cell !== 0);
            for (let i = 0; i < newRow.length - 1; i++) {
                if (newRow[i] === newRow[i + 1]) {
                    newRow[i] *= 2;
                    this.score += newRow[i];
                    newRow.splice(i + 1, 1);
                }
            }
            while (newRow.length < 4) newRow.push(0);
            return newRow;
        });
    }

    moveRight() {
        return this.move(row => {
            const newRow = row.filter(cell => cell !== 0);
            for (let i = newRow.length - 1; i > 0; i--) {
                if (newRow[i] === newRow[i - 1]) {
                    newRow[i] *= 2;
                    this.score += newRow[i];
                    newRow.splice(i - 1, 1);
                    i--;
                }
            }
            while (newRow.length < 4) newRow.unshift(0);
            return newRow;
        });
    }

    moveUp() {
        return this.move(col => {
            const newCol = col.filter(cell => cell !== 0);
            for (let i = 0; i < newCol.length - 1; i++) {
                if (newCol[i] === newCol[i + 1]) {
                    newCol[i] *= 2;
                    this.score += newCol[i];
                    newCol.splice(i + 1, 1);
                }
            }
            while (newCol.length < 4) newCol.push(0);
            return newCol;
        }, true);
    }

    moveDown() {
        return this.move(col => {
            const newCol = col.filter(cell => cell !== 0);
            for (let i = newCol.length - 1; i > 0; i--) {
                if (newCol[i] === newCol[i - 1]) {
                    newCol[i] *= 2;
                    this.score += newCol[i];
                    newCol.splice(i - 1, 1);
                    i--;
                }
            }
            while (newCol.length < 4) newCol.unshift(0);
            return newCol;
        }, true);
    }

    move(moveFunction, isVertical = false) {
        const oldGrid = JSON.stringify(this.grid);
        
        for (let i = 0; i < 4; i++) {
            const line = isVertical 
                ? this.grid.map(row => row[i])
                : [...this.grid[i]];
            
            const newLine = moveFunction(line);
            
            if (isVertical) {
                for (let j = 0; j < 4; j++) {
                    this.grid[j][i] = newLine[j];
                }
            } else {
                this.grid[i] = newLine;
            }
        }
        
        return oldGrid !== JSON.stringify(this.grid);
    }

    isGameOver() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i][j];
                if (
                    (i < 3 && current === this.grid[i + 1][j]) ||
                    (j < 3 && current === this.grid[i][j + 1])
                ) {
                    return false;
                }
            }
        }
        return true;
    }
}

window.onload = () => {
    if (currentUser) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'flex';
        updateLeaderboard();
        game = new Game2048();
    }
};
