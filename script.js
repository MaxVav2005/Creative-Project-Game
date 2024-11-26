const game = document.getElementById("game");
const bird = document.getElementById("bird");
const scoreDisplay = document.getElementById("score");
const startText = document.getElementById("start-text");
const dieSound = document.getElementById("die-sound");
const flapSound = document.getElementById("flap-sound");
const pointSound = document.getElementById("point-sound");
const backgroundMusic = document.getElementById("background-music");

let birdY = 180; // Initial bird vertical position (adjusted for horizontal canvas)
let birdVelocity = 0;
const gravity = 0.5;
const jumpPower = -6; // Reduced jump power for shorter jumps
let score = 0;

let pipes = [];
let gameInterval;
let pipeInterval;
let gameStarted = false;
let isGameOver = false; // Tracks if the game is over
let pipeSpeed = 2; // Initial pipe speed
let pipeGap = 120; // Initial gap between pipes

// Preload point sound
pointSound.load();

// Key press event to make the bird jump
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        if (!gameStarted) {
            startGame();
        } else if (!isGameOver) { // Play flap sound only if the game is not over
            birdVelocity = jumpPower;
            flapSound.play();
        }
    }
});

// Function to create pipes
function createPipe() {
    const pipeHeight = Math.random() * 150 + 100; // Random height for top pipe

    // Top pipe (flipped)
    const topPipe = document.createElement("div");
    topPipe.classList.add("pipe", "top");
    topPipe.style.height = `${pipeHeight}px`;
    topPipe.style.left = "800px";

    // Bottom pipe (normal)
    const bottomPipe = document.createElement("div");
    bottomPipe.classList.add("pipe", "bottom");
    bottomPipe.style.height = `${380 - pipeHeight - pipeGap}px`;
    bottomPipe.style.left = "800px";
    bottomPipe.style.top = `${pipeHeight + pipeGap}px`;

    game.appendChild(topPipe);
    game.appendChild(bottomPipe);

    pipes.push({ topPipe, bottomPipe, passed: false });
}

// Function to update pipes and check collisions
function updatePipes() {
    pipes.forEach((pipe, index) => {
        const topPipe = pipe.topPipe;
        const bottomPipe = pipe.bottomPipe;

        // Move pipes to the left
        const left = parseInt(topPipe.style.left);
        const newLeft = left - pipeSpeed; // Move left by pipe speed
        topPipe.style.left = `${newLeft}px`;
        bottomPipe.style.left = `${newLeft}px`;

        // Update score when bird passes the pipe
        if (!pipe.passed && newLeft + 60 < bird.offsetLeft) { // Check if pipe has been passed
            pipe.passed = true;
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            pointSound.currentTime = 0; // Reset the sound to the start
            pointSound.play();

            // Adjust difficulty at specific scores
            if (score === 3) {
                pipeSpeed += 0.5;
                pipeGap -= 10; // Reduce the gap slightly
            } else if (score === 8) {
                pipeSpeed += 0.7;
                pipeGap -= 10; // Reduce the gap further
            } else if (score === 13) {
                pipeSpeed += 1;
                pipeGap -= 10; // Reduce the gap more
            }
        }

        // Remove pipes that are off-screen
        if (newLeft < -60) {
            topPipe.remove();
            bottomPipe.remove();
            pipes.splice(index, 1);
        }

        // Collision detection
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

    // Check if the bird hits the top or bottom of the game area
    if (birdY < 0 || birdY > 340) {
        endGame();
    }
}

// Function to end the game
function endGame() {
    clearInterval(gameInterval);
    clearInterval(pipeInterval);
    backgroundMusic.pause(); // Stop background music
    dieSound.play(); // Play die sound
    isGameOver = true; // Set game over flag to true

    // Hide the bird
    bird.style.display = "none";

    // Show Game Over dialog
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
    birdY = 180; // Reset bird position
    bird.style.top = `${birdY}px`;
    bird.style.display = "block"; // Show bird after reset
    pipes.forEach((pipe) => {
        pipe.topPipe.remove();
        pipe.bottomPipe.remove();
    });
    pipes = [];
    score = 0;
    pipeSpeed = 2; // Reset pipe speed
    pipeGap = 120; // Reset pipe gap
    scoreDisplay.textContent = "Score: 0";
    startText.style.display = "block";
    gameStarted = false;
    isGameOver = false; // Reset game over flag
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
    pipeSpeed = 2; // Initial pipe speed
    pipeGap = 120; // Initial pipe gap
    backgroundMusic.play(); // Play background music

    // Clear previous pipes
    document.querySelectorAll(".pipe").forEach((pipe) => pipe.remove());

    // Update score display
    scoreDisplay.textContent = "Score: 0";

    // Shorten time for the first pipe
    createPipe(); // Immediately create the first pipe
    gameInterval = setInterval(gameLoop, 20);
    pipeInterval = setInterval(createPipe, 1500); // Shorter delay
}
