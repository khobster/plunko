let playersData = [];
let correctStreak = 0;
let lastThreeCorrect = [];
const correctSound = new Audio('https://vanillafrosting.agency/wp-content/uploads/2023/11/bing-bong.mp3');
const wrongSound = new Audio('https://vanillafrosting.agency/wp-content/uploads/2023/11/incorrect-answer-for-plunko.mp3');

function simplifyString(str) {
    return str.trim().toLowerCase().replace(/university|college|the| /g, '');
}

function isCloseMatch(guess, answer) {
    if (!guess.trim()) {
        return false;
    }

    let simpleGuess = guess.trim().toLowerCase();
    let simpleAnswer = answer.trim().toLowerCase();

    let normalizedGuess = simpleGuess.replace(/[^a-zA-Z0-9]/g, '');

    const noCollegePhrases = [
        "didntgotocollege",
        "didnotgotocollege",
        "hedidntgotocollege",
        "hedidnotgotocollege",
        "nocollege",
        "didntgotocollege",
        "didnotgotocollege",
        "hedidntgotocollege",
        "hedidnotgotocollege"
    ];

    if (noCollegePhrases.includes(normalizedGuess) && simpleAnswer === '') {
        return true;
    }

    if (simpleAnswer === 'unc' && (simpleGuess === 'north carolina' || simpleGuess === 'carolina')) {
        return true;
    }

    return simpleAnswer.includes(simpleGuess);
}

function updateStreakAndGenerateSnippet(isCorrect, playerName, resultElement) {
    if (isCorrect) {
        correctStreak++;
        lastThreeCorrect.push(playerName);
        if (lastThreeCorrect.length > 3) {
            lastThreeCorrect.shift();
        }
        resultElement.innerHTML = "That's <span style='color: yellow;'>CORRECT!</span> Now you need to get just two more to get a <span class='kaboom'>PLUNKO!</span>";
        resultElement.className = 'correct';
        correctSound.play();
        if (correctStreak >= 3) {
            let shareText = `3 in a row! That's a PLUNK🏀!<br>Players: ${lastThreeCorrect.join(', ')}<br>Play PLUNK🏀: https://khobster.github.io/plunko`;
            document.getElementById('shareSnippet').innerHTML = shareText;
            document.getElementById('copyButton').style.display = 'block';
            resultElement.innerHTML = "<span class='kaboom'>PLUNKO!</span>";
        }
    } else {
        correctStreak = 0;
        lastThreeCorrect.length = 0;
        resultElement.textContent = 'Wrong answer. Try again!';
        resultElement.className = 'incorrect';
        wrongSound.play();
    }
}

function copyToClipboard() {
    const textToCopy = document.getElementById('shareSnippet').textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const copyButton = document.getElementById('copyButton');
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => copyButton.textContent = originalText, 2000);
    });
}

function loadPlayersData() {
    fetch('https://raw.githubusercontent.com/khobster/plunko/main/data.json')
        .then(response => response.json())
        .then(data => {
            playersData = data;
            displayRandomPlayer();
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
            document.getElementById('playerQuestion').textContent = 'Error loading player data.';
        });
}

function displayRandomPlayer() {
    if (playersData.length > 0) {
        const randomIndex = Math.floor(Math.random() * playersData.length);
        const player = playersData[randomIndex];
        document.getElementById('playerName').textContent = player.name;
        document.getElementById('collegeGuess').value = '';
        document.getElementById('result').textContent = '';
        document.getElementById('result').className = '';
    } else {
        console.log("No data available");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPlayersData();
    document.getElementById('submitBtn').addEventListener('click', function() {
        const userGuess = document.getElementById('collegeGuess').value.trim().toLowerCase();
        const playerName = document.getElementById('playerName').textContent;
        const player = playersData.find(p => p.name === playerName);
        let isCorrect = player && isCloseMatch(userGuess, player.college || 'No College');
        updateStreakAndGenerateSnippet(isCorrect, playerName, document.getElementById('result'));
        setTimeout(displayRandomPlayer, 2000);
    });
    document.getElementById('copyButton').addEventListener('click', copyToClipboard);
});
