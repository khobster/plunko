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
        if (correctStreak === 1) {
            resultElement.innerHTML = "That's <span style='color: yellow;'>CORRECT!</span> Now you need to get just two more to get a <span class='kaboom'>PLUNKO!</span>";
        } else if (correctStreak === 2) {
            resultElement.innerHTML = "That's <span style='color: yellow;'>CORRECT!</span> Now you need to get just one more to get a <span class='kaboom'>PLUNKO!</span>";
        } else if (correctStreak >= 3) {
            resultElement.innerHTML = "<span class='kaboom'>PLUNKO!</span>";
            let shareText = `3 in a row! That's a PLUNK🏀!<br>Players: ${lastThreeCorrect.join(', ')}<br>Play PLUNK🏀: https://khobster.github.io/plunko`;
            document.getElementById('shareSnippet').innerHTML = shareText;
            document.getElementById('copyButton').style.display = 'block';
        }
        resultElement.className = 'correct';
        correctSound.play();
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

function showSuggestions(input) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    if (input.length === 0) {
        return;
    }
    const suggestions = Array.from(new Set(playersData
        .map(player => player.college)
        .filter(college => college && college.toLowerCase().includes(input.toLowerCase()))))
        .slice(0, 5); // Show up to 5 unique suggestions
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = suggestion;
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.addEventListener('click', () => {
            document.getElementById('collegeGuess').value = suggestion;
            suggestionsContainer.innerHTML = '';
        });
        suggestionsContainer.appendChild(suggestionItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadPlayersData();
    document.getElementById('collegeGuess').addEventListener('input', (e) => {
        showSuggestions(e.target.value);
    });
    document.getElementById('submitBtn').addEventListener('click', function() {
        const userGuess = document.getElementById('collegeGuess').value.trim().toLowerCase();
        const playerName = document.getElementById('playerName').textContent;
        const player = playersData.find(p => p.name === playerName);
        let isCorrect = player && isCloseMatch(userGuess, player.college || 'No College');
        updateStreakAndGenerateSnippet(isCorrect, playerName, document.getElementById('result'));
        setTimeout(displayRandomPlayer, 5000); // Increase the timeout duration to 3000ms (3 seconds)
    });
    document.getElementById('copyButton').addEventListener('click', copyToClipboard);
});
