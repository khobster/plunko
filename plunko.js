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

function updateStreakAndGenerateSnippet(isCorrect, playerName, resultElement, nextPlayerCallback) {
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
        } else if (correctStreak === 3) {
            resultElement.innerHTML = "<span class='kaboom'>PLUNKO!</span>";
            const encodedPlayers = encodeURIComponent(lastThreeCorrect.join(','));
            const shareLink = `https://khobster.github.io/plunko?players=${encodedPlayers}`;
            let shareText = `3 in a row! That's a PLUNK🏀!<br>Players: ${lastThreeCorrect.join(', ')}<br>Play PLUNK🏀: ${shareLink}`;
            document.getElementById('shareSnippet').innerHTML = shareText;
            document.getElementById('copyButton').style.display = 'block';
            correctStreak = 0; // Reset the correct streak after achieving PLUNKO
            lastThreeCorrect = []; // Clear the list of last three correct players after achieving PLUNKO
        }
        resultElement.className = 'correct';
        correctSound.play();
    } else {
        correctStreak = 0;
        lastThreeCorrect = [];
        resultElement.textContent = 'Wrong answer. Try again!';
        resultElement.className = 'incorrect';
        wrongSound.play();
    }
    setTimeout(nextPlayerCallback, 3000); // Show next player after a delay
}

function updateStreakAndGenerateSnippetURL(isCorrect, playerName, resultElement, nextPlayerCallback, playerIndex, totalPlayers) {
    if (isCorrect) {
        correctStreak++;
        lastThreeCorrect.push(playerName);
        if (lastThreeCorrect.length > 3) {
            lastThreeCorrect.shift();
        }
        if (correctStreak === totalPlayers) {
            resultElement.innerHTML = "<span class='kaboom'>PLUNKO!</span>";
            const encodedPlayers = encodeURIComponent(lastThreeCorrect.join(','));
            const shareLink = `https://khobster.github.io/plunko?players=${encodedPlayers}`;
            let shareText = `3 in a row! That's a PLUNK🏀!<br>Players: ${lastThreeCorrect.join(', ')}<br>Play PLUNK🏀: ${shareLink}`;
            document.getElementById('shareSnippet').innerHTML = shareText;
            document.getElementById('copyButton').style.display = 'block';
            correctStreak = 0; // Reset the correct streak after achieving PLUNKO
            lastThreeCorrect = []; // Clear the list of last three correct players after achieving PLUNKO
        } else {
            nextPlayerCallback(playerIndex + 1);
        }
        resultElement.className = 'correct';
        correctSound.play();
    } else {
        correctStreak = 0;
        lastThreeCorrect = [];
        resultElement.textContent = 'Wrong answer. Try again!';
        resultElement.className = 'incorrect';
        wrongSound.play();
        endURLChallenge(false);
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
            const urlPlayers = getPlayersFromURL();
            if (urlPlayers.length > 0) {
                startURLChallenge(urlPlayers);
            } else {
                displayRandomPlayer();
            }
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
        document.getElementById('submitBtn').onclick = function() {
            const userGuess = document.getElementById('collegeGuess').value.trim().toLowerCase();
            let isCorrect = player && isCloseMatch(userGuess, player.college || 'No College');
            updateStreakAndGenerateSnippet(isCorrect, player.name, document.getElementById('result'), displayRandomPlayer);
        };
    } else {
        console.log("No data available");
    }
}

function displayPlayer(player) {
    document.getElementById('playerName').textContent = player.name;
    document.getElementById('collegeGuess').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('result').className = '';
}

function startURLChallenge(playerNames) {
    let playerIndex = 0;
    correctStreak = 0; // Reset correct streak when starting a shared link sequence
    lastThreeCorrect = []; // Clear last three correct players

    function nextPlayer(index) {
        if (index < playerNames.length) {
            const playerName = playerNames[index];
            const player = playersData.find(p => p.name === playerName);
            if (player) {
                displayPlayer(player);
                document.getElementById('submitBtn').onclick = function() {
                    const userGuess = document.getElementById('collegeGuess').value.trim().toLowerCase();
                    let isCorrect = player && isCloseMatch(userGuess, player.college || 'No College');
                    updateStreakAndGenerateSnippetURL(isCorrect, player.name, document.getElementById('result'), nextPlayer, index, playerNames.length);
                };
            } else {
                nextPlayer(index + 1); // Skip to the next player if not found
            }
        } else {
            endURLChallenge(true);
        }
    }
    nextPlayer(playerIndex);
}

function endURLChallenge(success) {
    const resultElement = document.getElementById('result');
    if (success) {
        resultElement.innerHTML = "<span class='kaboom'>You got all 3 correct! Share your success!</span>";
        resultElement.className = 'correct';
    } else {
        resultElement.innerHTML = "You didn't get all 3 correct. Better luck next time!";
        resultElement.className = 'incorrect';
    }
    const shareText = success ? "I got all 3 correct on PLUNKO!" : "I couldn't get all 3 correct on PLUNKO. Can you?";
    const encodedPlayers = encodeURIComponent(lastThreeCorrect.join(','));
    const shareLink = `https://khobster.github.io/plunko?players=${encodedPlayers}`;
    let shareSnippet = `${shareText}<br>Players: ${lastThreeCorrect.join(', ')}<br>Play PLUNKO: ${shareLink}`;
    document.getElementById('shareSnippet').innerHTML = shareSnippet;
    document.getElementById('copyButton').style.display = 'block';
    document.getElementById('submitBtn').style.display = 'none';
}

function getPlayersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const playersParam = urlParams.get('players');
    if (playersParam) {
        return playersParam.split(',');
    }
    return [];
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
        updateStreakAndGenerateSnippet(isCorrect, playerName, document.getElementById('result'), displayRandomPlayer);
    });

    document.getElementById('copyButton').addEventListener('click', copyToClipboard);

    // Tooltip handling for mobile
    const tooltip = document.querySelector('.tooltip');
    tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!tooltip.contains(e.target)) {
            tooltip.classList.remove('active');
        }
    });
});
