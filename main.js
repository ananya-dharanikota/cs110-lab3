// states
let xMoves = [];
let oMoves = [];
let currPlayer = 'X';
let isGameOver = false;
let scores = {X: 0, O: 0};
let aiPlayer = false; // toggle change from human to AI player 

// ways to win based on the rows and columns 
// styles starts from 1 ad ends at 9
const WIN_COMBOS = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // columns
    [0,4,8], [2,4,6] // diagonals
]

// add DOM stuff here
const cells       = document.querySelectorAll('.game_board .xo');   // 9 <span> elements
const turnDisplay = document.querySelector('.display_player');
const newGameBtn  = document.querySelector('.new_game');
const resetBtn    = document.querySelector('.reset');
 
// the other parts of UI --- score board, button, etc
function buildUI() {
  // Score display
  const scoreDiv = document.createElement('div');
  scoreDiv.className = 'whose_turn';
  scoreDiv.id = 'score_display';
  scoreDiv.textContent = 'Scores: X : 0  O: 0';
  document.querySelector('h2').insertAdjacentElement('afterend', scoreDiv);
 
  // AI toggle button
  const aiBtn = document.createElement('button');
  aiBtn.className = 'new_game';
  aiBtn.id = 'ai_toggle';
  aiBtn.textContent = '🤖 Play vs AI';
  aiBtn.style.backgroundColor = '#6a5acd';
  aiBtn.style.color = '#fff';
  resetBtn.insertAdjacentElement('afterend', aiBtn);
 
  aiBtn.addEventListener('click', () => {
    vsAI = !vsAI;
    aiBtn.textContent = vsAI ? '👥 Play vs Human' : '🤖 Play vs AI';
    aiBtn.style.backgroundColor = vsAI ? '#228b22' : '#6a5acd';
    startNewGame();
  });
}
 
function updateScoreDisplay() {
  document.getElementById('score_display').textContent =
    `Scores: X : ${scores.X}  O: ${scores.O}`;
}
 
// helper functions
function hasWon(moves) {
  return WIN_COMBOS.some(combo => combo.every(i => moves.includes(i)));
}
 
function winningCombo(moves) {
  return WIN_COMBOS.find(combo => combo.every(i => moves.includes(i)));
}
 
function cellIndex(cellEl) {
  return [...cells].indexOf(cellEl);
}
 
function allTaken() {
  return xMoves.length + oMoves.length === 9;
}
 
// rendering / loading board 
function renderBoard() {
  cells.forEach((span, i) => {
    span.parentElement.style.backgroundColor = 'pink';  // reset highlight
    if (xMoves.includes(i))      span.textContent = 'X';
    else if (oMoves.includes(i)) span.textContent = 'O';
    else                         span.textContent = '';
  });
}
 
function highlightWinner(combo) {
  combo.forEach(i => {
    cells[i].parentElement.style.backgroundColor = '#ff6b6b';
  });
}
 
function setTurnText(msg) {
  if (turnDisplay) turnDisplay.textContent = msg;
}
 
// game flow
function handleMove(index) {
  if (gameOver) return;
  if (xMoves.includes(index) || oMoves.includes(index)) return;
 
  if (currentPlayer === 'X') {
    xMoves.push(index);
  } else {
    oMoves.push(index);
  }
 
  renderBoard();
  checkEndConditions();
}
 
function checkEndConditions() {
  if (hasWon(currentPlayer === 'X' ? xMoves : oMoves)) {
    const combo = winningCombo(currentPlayer === 'X' ? xMoves : oMoves);
    highlightWinner(combo);
    scores[currentPlayer]++;
    updateScoreDisplay();
    setTurnText(`${currentPlayer} wins! 🎉`);
    gameOver = true;
    return;
  }
 
  if (allTaken()) {
    setTurnText("It's a tie! 🤝");
    gameOver = true;
    return;
  }
 
  // switching player turns
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  setTurnText(currentPlayer);
 
  // AI move
  if (vsAI && currentPlayer === 'O' && !gameOver) {
    setTimeout(aiMove, 300);
  }
}
 
// AI Player Move Algorithm -- minimax
function minimax(xArr, oArr, isMaximizing) {
  // terminal states
  if (hasWon(xArr)) return -10;
  if (hasWon(oArr)) return  10;
  const taken = xArr.length + oArr.length;
  if (taken === 9) return 0;
 
  const available = [...Array(9).keys()].filter(i => !xArr.includes(i) && !oArr.includes(i));
 
  if (isMaximizing) {
    let best = -Infinity;
    for (const move of available) {
      oArr.push(move);
      best = Math.max(best, minimax(xArr, oArr, false));
      oArr.pop();
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of available) {
      xArr.push(move);
      best = Math.min(best, minimax(xArr, oArr, true));
      xArr.pop();
    }
    return best;
  }
}
 
function bestAIMove() {
  const available = [...Array(9).keys()].filter(i => !xMoves.includes(i) && !oMoves.includes(i));
  let bestVal = -Infinity, bestMove = available[0];
 
  for (const move of available) {
    oMoves.push(move);
    const val = minimax([...xMoves], oMoves, false);
    oMoves.pop();
    if (val > bestVal) { bestVal = val; bestMove = move; }
  }
  return bestMove;
}
 
function aiMove() {
  if (gameOver) return;
  const move = bestAIMove();
  handleMove(move);
}
 
// new game / reset
function startNewGame() {
  xMoves       = [];
  oMoves       = [];
  currentPlayer = 'X';
  gameOver      = false;
  renderBoard();
  setTurnText('X');
}
 
function fullReset() {
  scores = { X: 0, O: 0 };
  updateScoreDisplay();
  startNewGame();
}
 
// event listeners
cells.forEach(span => {
  span.parentElement.addEventListener('click', () => {
    if (vsAI && currentPlayer === 'O') return;  // block human click during AI turn
    handleMove(cellIndex(span));
  });
});
 
newGameBtn.addEventListener('click', startNewGame);
resetBtn.addEventListener('click', fullReset);
 
// init
buildUI();
setTurnText('X');