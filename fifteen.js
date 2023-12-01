let selectedImage;

function generatePuzzle() {
  changeBackgroundImage();  
  initializePuzzle();       
  document.getElementById('puzzle-container').style.visibility = 'visible';
  document.getElementById('shuffle-container').classList.remove('hidden');
  document.getElementById('moves').classList.remove('hidden');
  document.getElementById('timer').classList.remove('hidden');
  isShuffled = false; 
}

function initializePuzzle() {
  var puzzleContainer = document.getElementById('puzzle-container');
  puzzleContainer.innerHTML = '';

  var puzzleSize = parseInt(document.getElementById('puzzle-size').value);
  var imageSize = puzzleSize * 100;

  for (var i = 1; i <= puzzleSize * puzzleSize - 1; i++) {
    var piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    piece.textContent = i;

    var row = Math.floor((i - 1) / puzzleSize);
    var col = (i - 1) % puzzleSize;
    var xOffset = -col * (imageSize / puzzleSize);
    var yOffset = -row * (imageSize / puzzleSize);

    piece.style.backgroundImage = `url('${selectedImage}')`;
    piece.style.backgroundSize = `${imageSize}px ${imageSize}px`;
    piece.style.backgroundPosition = `${xOffset}px ${yOffset}px`;

    puzzleContainer.appendChild(piece);
  }

  var emptyPiece = document.createElement('div');
  emptyPiece.className = 'puzzle-piece piece-16';
  emptyPiece.style.backgroundImage = `url('${selectedImage}')`; 
  puzzleContainer.appendChild(emptyPiece);

  puzzleContainer.style.gridTemplateColumns = `repeat(${puzzleSize}, 1fr)`;
  puzzleContainer.style.width = `${puzzleSize * 104}px`;
}

function changeBackgroundImage() {
  selectedImage = document.getElementById('background-selector').value;

  const puzzlePieces = document.querySelectorAll('.puzzle-piece');
  puzzlePieces.forEach((piece, index) => {
    const row = Math.floor(index / parseInt(document.getElementById('puzzle-size').value));
    const col = index % parseInt(document.getElementById('puzzle-size').value);
    piece.style.backgroundImage = `url('${selectedImage}')`;
    piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`; 
  });
}

function changePuzzleSize() {
  var newSize = document.getElementById('puzzle-size').value;
  document.documentElement.style.setProperty('--puzzle-size', newSize);
  initializePuzzle();
}


function getInversionCount(arr) {
  var inversions = 0;
  for (var i = 0; i < arr.length - 1; i++) {
    for (var j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j] && arr[i] !== 16 && arr[j] !== 16) {
        inversions++;
      }
    }
  }
  return inversions;
}

let moves = 0;
let timer;
let seconds = 0;

function startTimer() {
  clearInterval(timer);
  timer = setInterval(function () {
    seconds++;
    document.getElementById('timer').textContent = 'Time Elapsed: ' + seconds + ' second(s)';
  }, 1000);
  document.getElementById('shuffle-button').disabled = true;
}

function stopTimer() {
  clearInterval(timer);
}

document.addEventListener('DOMContentLoaded', function () {
  initializePuzzle();

  document.getElementById('puzzle-container').addEventListener('click', function (event) {
    var clickedPiece = event.target.closest('.puzzle-piece');

    if (clickedPiece && !clickedPiece.classList.contains('piece-16')) {
      moveTile(Array.from(clickedPiece.parentNode.children).indexOf(clickedPiece));
    }
  });

  function moveTile(index) {
    const pieces = Array.from(document.querySelectorAll('.puzzle-piece'));
    const emptyIndex = pieces.findIndex(piece => piece.classList.contains('piece-16'));

    if (isShuffled && isAdjacent(index, emptyIndex)) {
      pieces.forEach(piece => piece.classList.remove('movablepiece'));

      moves++;
      document.getElementById('moves').textContent = 'Moves: ' + moves;

      const initialTransformIndex = pieces[index].style.transform;
      const initialTransformEmpty = pieces[emptyIndex].style.transform;
      const initialBackgroundPositionIndex = pieces[index].style.backgroundPosition;
      const initialBackgroundPositionEmpty = pieces[emptyIndex].style.backgroundPosition;

      pieces[index].classList.add('number-swap-animation');
      pieces[emptyIndex].classList.add('number-swap-animation');

      [pieces[index].className, pieces[emptyIndex].className] = [pieces[emptyIndex].className, pieces[index].className];
      [pieces[index].textContent, pieces[emptyIndex].textContent] = [pieces[emptyIndex].textContent, pieces[index].textContent];

      [pieces[index].style.backgroundPosition, pieces[emptyIndex].style.backgroundPosition] = [initialBackgroundPositionEmpty, initialBackgroundPositionIndex];

      setTimeout(() => {
        pieces[index].style.transition = 'transform 0.35s ease-in-out';
        pieces[emptyIndex].style.transition = 'transform 0.35s ease-in-out';

        pieces[index].style.transform = initialTransformEmpty;
        pieces[emptyIndex].style.transform = initialTransformIndex;

        pieces[index].style.backgroundPosition = initialBackgroundPositionEmpty;
        pieces[emptyIndex].style.backgroundPosition = initialBackgroundPositionIndex;
      }, 50);

      setTimeout(() => {
        pieces[index].classList.remove('number-swap-animation');
        pieces[emptyIndex].classList.remove('number-swap-animation');

        pieces[index].style.transition = '';
        pieces[emptyIndex].style.transition = '';

        pieces[index].style.transform = '';
        pieces[emptyIndex].style.transform = '';
      }, 400); 

      setTimeout(() => {
        if (checkWin()) {
          showSuccessMessage();
          stopTimer();
        }
      }, 400);
    }
  }


  function checkWin() {
    var puzzlePieces = document.getElementById('puzzle-container').children;

    for (var i = 0; i < puzzlePieces.length - 1; i++) {
      var piece = puzzlePieces[i];
      var pieceNumber = parseInt(piece.textContent);

      if (pieceNumber !== i + 1 && pieceNumber !== 0) {
        return false;
      }
    }

    return true;
  }

  function isAdjacent(index1, index2) {
    const row1 = Math.floor(index1 / parseInt(document.getElementById('puzzle-size').value));
    const col1 = index1 % parseInt(document.getElementById('puzzle-size').value);
    const row2 = Math.floor(index2 / parseInt(document.getElementById('puzzle-size').value));
    const col2 = index2 % parseInt(document.getElementById('puzzle-size').value);

    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  }

  var isShuffled = false;
  document.getElementById('shuffle-button').addEventListener('click', function () {
    isShuffled = true;
  });

  document.getElementById('puzzle-container').addEventListener('mouseover', function (event) {
    if (isShuffled) {
      var hoveredPiece = event.target.closest('.puzzle-piece');
      if (hoveredPiece && !hoveredPiece.classList.contains('piece-16') && isAdjacentPiece(hoveredPiece)) {
        hoveredPiece.classList.add('movablepiece');
      }
    }
  });

  document.getElementById('puzzle-container').addEventListener('mouseout', function (event) {
    var hoveredPiece = event.target.closest('.puzzle-piece');
    if (hoveredPiece) {
      hoveredPiece.classList.remove('movablepiece');
    }
  });

  function isAdjacentPiece(piece) {
    const pieces = Array.from(document.querySelectorAll('.puzzle-piece'));
    const emptyIndex = pieces.findIndex(p => p.classList.contains('piece-16'));
    const pieceIndex = pieces.indexOf(piece);

    return isAdjacent(emptyIndex, pieceIndex);
  }

  function showSuccessMessage() {
    document.getElementById('success-message').innerHTML = "<strong>Congratulations!</strong> <p>You solved the puzzle in " + moves + " moves and took " + seconds + " second(s)</p>";
    document.getElementById('success-message').style.display = 'block';
    document.getElementById('restart_game').innerHTML = "<p>Please Click <a href='index.html'> here</a> to restart the game</p>";
    document.getElementById('restart_game').style.display = 'block';
    stopTimer();
    document.getElementById('puzzle-container').style.display = 'none';
    document.getElementById('shuffle-container').style.display = 'none';
    document.getElementById('moves').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    isShuffled = false;
  }
});

function shufflePuzzle(callback) {
  var puzzleContainer = document.getElementById('puzzle-container');
  var backgroundSelector = document.getElementById('background-selector');
  var puzzleSizeSelect = document.getElementById('puzzle-size');
  var generateButton = document.getElementById('generate-button');
  var shuffleButton = document.getElementById('shuffle-button');

  document.querySelector('label[for="background-selector"]').style.display = 'none';
  backgroundSelector.style.display = 'none';
  document.querySelector('label[for="puzzle-size"]').style.display = 'none';
  puzzleSizeSelect.style.display = 'none';
  generateButton.style.display = 'none';

  shuffleButton.disabled = true;

  const backgroundMusic = document.getElementById('backgroundMusic');
  backgroundMusic.play();

  var puzzlePieces = puzzleContainer.children;

  var solvedOrder = Array.from({ length: parseInt(puzzleSizeSelect.value) ** 2 }, (_, i) => i + 1);

  for (var i = puzzlePieces.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));

    puzzleContainer.insertBefore(puzzlePieces[i], puzzlePieces[j]);
  }

  var piecesArray = Array.from(puzzlePieces).map(piece => parseInt(piece.textContent));

  if (!isSolvable()) {
    puzzleContainer.insertBefore(puzzlePieces[piecesArray.indexOf(parseInt(puzzleSizeSelect.value) ** 2)], puzzlePieces[piecesArray.indexOf(parseInt(puzzleSizeSelect.value) ** 2 - 1)]);
  }

  isShuffled = true;
  moves = 0; 
  document.getElementById('moves').textContent = 'Moves: ' + moves;

  if (typeof callback === 'function') {
    callback(); 
  }
}

function isSolvable() {
  var puzzlePieces = document.getElementById('puzzle-container').children;
  var piecesArray = Array.from(puzzlePieces).map(piece => parseInt(piece.textContent));
  var inversions = getInversionCount(piecesArray);
  var emptyRowIndex = Math.floor(piecesArray.indexOf(parseInt(document.getElementById('puzzle-size').value) ** 2) / parseInt(document.getElementById('puzzle-size').value)) + 1;
  if (puzzlePieces.length % 2 === 0) {
    return (emptyRowIndex % 2 !== 0) ? inversions % 2 === 0 : inversions % 2 !== 0;
  } else {
    return inversions % 2 === 0;
  }
}