const game = document.getElementById("game");
const bird = document.getElementById("bird");
const scoreDisplay = document.getElementById("score");
const startText = document.getElementById("start-text");
const dieSound = document.getElementById("die-sound");
const flapSound = document.getElementById("flap-sound");
const pointSound = document.getElementById("point-sound");
const backgroundMusic = document.getElementById("background-music");

let birdY = 180; // Initial bird vertical position
let birdVelocity = 0;
let gravity = 0.3; // Easier gravity at the start
let jumpPower = -5; // Small initial jump
let score = 0;
let difficultyLevel = 1; // Start at easiest difficulty

let pipeSpeed = 1.5; // Very slow pipes initially
let pipeGap = 150; // Larger gap to make it easier

let pipes = [];
let gameInterval;
let pipeInterval;
let gameStarted = false;
let isGameOver = false;

// Key press event to make the bird jump
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        if (!gameStarted) {
            startGame();
        } else if (!isGameOver) {
            birdVelocity = jumpPower;
            flapSound.play();
        }
    }
});

// Function to create pipes
function createPipe() {
    const pipeHeight = Math.random() * 150 + 100;

    const topPipe = document.createElement("div");
    topPipe.classList.add("pipe", "top");
    topPipe.style.height = `${pipeHeight}px`;
    topPipe.style.left = "800px";

    const bottomPipe = document.createElement("div");
    bottomPipe.classList.add("pipe", "bottom");
    bottomPipe.style.height = `${380 - pipeHeight - pipeGap}px`;
    bottomPipe.style.left = "800px";
    bottomPipe.style.top = `${pipeHeight + pipeGap}px`;

    game.appendChild(topPipe);
    game.appendChild(bottomPipe);

    pipes.push({ topPipe, bottomPipe });
}

// Function to update pipes and check collisions
function updatePipes() {
    pipes.forEach((pipe, index) => {
        const topPipe = pipe.topPipe;
        const bottomPipe = pipe.bottomPipe;

        const left = parseInt(topPipe.style.left);
        const newLeft = left - pipeSpeed;
        topPipe.style.left = `${newLeft}px`;
        bottomPipe.style.left = `${newLeft}px`;

        if (newLeft < -60) {
            topPipe.remove();
            bottomPipe.remove();
            pipes.splice(index, 1);
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            pointSound.play();

            // Increase difficulty when score reaches 3
            if (score === 3) {
                increaseDifficulty();
            }
        }

        const birdRect = bird.getBoundingClientRect();
        const topPipeRect = topPipe.getBoundingClientRect();
        const bottomPipeRect = bottomPipe.getBoundingClientRect();

        if (
            birdRect.right > topPipeRect.left &&
            birdRect.left < topPipeRect.right &&
            (birdRect.top < topPipeRect.bottom || birdRect.bottom > bottomPipeRect.top)
        ) {
            endGame();
        }
    });
}

// Function to update bird position and check boundaries
function updateBird() {
    birdVelocity += gravity;
    birdY += birdVelocity;
    bird.style.top = `${birdY}px`;

    if (birdY < 0 || birdY > 340) {
        endGame();
    }
}

// Function to increase difficulty
function increaseDifficulty() {
    difficultyLevel++;
    pipeSpeed = 2.5; // Increase pipe speed
    pipeGap = 120; // Reduce gap size
    gravity = 0.4; // Increase gravity slightly
    console.log("Difficulty increased!"); // Log for debugging
}

// Function to end the game
function endGame() {
    clearInterval(gameInterval);
    clearInterval(pipeInterval);
    backgroundMusic.pause();
    dieSound.play();
    isGameOver = true;

    bird.style.display = "none";

    const popup = document.createElement("div");
    popup.id = "popup";

    const gameOverText = document.createElement("h1");
    gameOverText.innerText = `Game Over\nYour Score: ${score}`;
    popup.appendChild(gameOverText);

    const retryButton = document.createElement("button");
    retryButton.innerText = "Retry";
    retryButton.onclick = () => {
        popup.remove();
        resetGame();
    };
    popup.appendChild(retryButton);

    document.body.appendChild(popup);
}

// Reset game to initial state
function resetGame() {
    birdY = 180;
    birdVelocity = 0;
    gravity = 0.3; // Reset to easy gravity
    jumpPower = -5; // Reset jump power
    pipeSpeed = 1.5; // Reset pipe speed
    pipeGap = 150; // Reset gap size
    difficultyLevel = 1;
    pipes.forEach((pipe) => {
        pipe.topPipe.remove();
        pipe.bottomPipe.remove();
    });
    pipes = [];
    score = 0;
    scoreDisplay.textContent = "Score: 0";
    startText.style.display = "block";
    gameStarted = false;
    isGameOver = false;
}

// Main game loop
function gameLoop() {
    updateBird();
    updatePipes();
}

// Start the game
function startGame() {
    gameStarted = true;
    startText.style.display = "none";
    birdY = 180;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    backgroundMusic.play();

    document.querySelectorAll(".pipe").forEach((pipe) => pipe.remove());

    scoreDisplay.textContent = "Score: 0";

    createPipe();
    gameInterval = setInterval(gameLoop, 20);
    pipeInterval = setInterval(createPipe, 2000);
}
