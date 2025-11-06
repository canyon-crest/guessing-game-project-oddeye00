// global variables
let level, answer, score;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
date.textContent = time();
const clockId = setInterval(() => { date.textContent = time(); }, 1000);

let player = "";
const nameBtn = document.getElementById("nameBtn");
const playerName = document.getElementById("playerName");
const nameChangeBtn = document.getElementById("nameChangeBtn");
const endBtn = document.getElementById("endBtn");

let startTime = 0;
const fastestArr = [];
let timeArr = []; 

const LEVELS = [3, 10, 100];
const scoreMap = { 3: [], 10: [], 100: [] }; // {score, name}
const fastMap  = { 3: [], 10: [], 100: [] }; // {time, name}

// Disable Game buttons before entering name
playBtn.disabled = true;
guessBtn.disabled = true;
giveUp.disabled = true;
nameChangeBtn.disabled = true;
endBtn.disabled = false;


// add event listeners
nameBtn.addEventListener("click", setName);
playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);
giveUp.addEventListener("click", giveUpGame);
guess.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !guessBtn.disabled) {
    event.preventDefault();  
    makeGuess();
  }
});
nameChangeBtn.addEventListener("click", renamePlayer); 
endBtn.addEventListener("click", endGame);

function getLevelNumber(){
  return parseInt(level, 10);
}

function updateScoreByLevel(){
  const L = getLevelNumber();
  scoreMap[L].push({ score: score, name: player });
  scoreMap[L].sort((a,b) => a.score - b.score);
  renderList(`lb-${L}`, scoreMap[L], (item) => `${item.score} (${item.name})`);
  updateScore();

  const rank = scoreMap[L].findIndex(it => it.score === score && it.name === player) + 1;
  return rank;
}

function updateFastestByLevel(elapsed){
  const L = getLevelNumber();
  fastMap[L].push({ time: elapsed, name: player });
  fastMap[L].sort((a,b) => a.time - b.time);

  renderList(`ft-${L}`, fastMap[L], (item) => `${item.time.toFixed(2)}s (${item.name})`);
  const rank = fastMap[L].findIndex(it => it.time === elapsed && it.name === player) + 1;
  return rank;
}

function setName() {
    const name = playerName.value.trim();
    if (name == "") {
        msg.textContent = "Please enter your name first!";
        return;
    }

    player = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    msg.textContent = "Welcome, " + player + "! Choose a level and press Play.";
    playerName.disabled = true;
    nameBtn.disabled = true;

    playBtn.disabled = false;
    for(let i = 0; i<levelArr.length; i++){
        levelArr[i].disabled = false;
    }
    nameChangeBtn.disabled = false;
}

function renamePlayer(){
  if (!guessBtn.disabled) {
    msg.textContent = "Finish the current game first.";
    return;
  }
  playerName.disabled = false;
  nameBtn.disabled = true;          
  msg.textContent = "Enter a new name and click Enter.";

  playBtn.disabled = true;

  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = true;

  nameBtn.disabled = false;
  playerName.focus();
}


function play(){
    score = 0; //sets score to 0 every new game
    startTime = Date.now(); //sets timer to 0 every new game
    playBtn.disabled = true;
    guessBtn.disabled = false;
    guess.disabled = false;
    giveUp.disabled = false;
    nameChangeBtn.disabled = true;

    for(let i = 0; i<levelArr.length; i++){
        if(levelArr[i].checked){
            level = parseInt(levelArr[i].value, 10); 
        }
        levelArr[i].disabled = true;
    }
    msg.textContent = player + ", guess a number from 1-" + level;
    answer = Math.floor(Math.random()*level)+1;
    // guess.placeholder = answer; 
}

function makeGuess(){
    let userGuess = parseInt(guess.value);
    if(isNaN(userGuess) || userGuess < 1 || userGuess > level){
        msg.textContent = player + ", enter a VALID #1-" + level;
        return;
    }
    score++; //valid guess add 1 to score

    const diff = Math.abs(userGuess - answer);              
    const temp = temperatureWord(diff, level); 
    
    if(userGuess > answer){
        msg.textContent = player + ", " + userGuess + " is too high. Your guess is " + temp + ", try again.";
        return;
    }
    else if(userGuess < answer){
        msg.textContent = player + ", " + userGuess + " is too low. Your guess is " + temp + ", try again.";
        return;
    }
    else{
        const elapsed = (Date.now() - startTime) / 1000;  // in seconds
        const timeRank  = updateFastestByLevel(elapsed);
        const scoreRank = updateScoreByLevel();
        const rating = scoreRating(score, level); 
          

        let rankMsg = "";
        if (scoreRank <= 3 && timeRank <= 3) {
            rankMsg = `You are ranked #${scoreRank} in Score and #${timeRank} in Fastest Time!\n`;
        } else if (scoreRank <= 3) {
            rankMsg = `You are ranked #${scoreRank} in Score!\n`;
        } else if (timeRank <= 3) {
            rankMsg = `You are ranked #${timeRank} in Fastest Time!\n`;
        }

        msg.textContent = player + ", " + userGuess + " is correct!\nIt took you " + score + " tries and " 
            + elapsed.toFixed(2) + " seconds.\nYour score is " + rating + ". " + rankMsg + "Press play to play again.";
        updateAverageTime(elapsed);
        reset();
        return;
    }
}

function giveUpGame(){
    const elapsed = (Date.now() - startTime) / 1000;
    msg.textContent = player + "! You gave up! The answer was " + answer + ". You Played for " + elapsed.toFixed(2) + " seconds.\nPress play to play again.";
    score = Number(level);       
    updateScoreByLevel();
    reset();                     
}

function reset(){
    guessBtn.disabled = true;
    guess.disabled = true;
    giveUp.disabled = true;  
    guess.value = "";
    guess.placeholder = "";
    playBtn.disabled = false;
    nameChangeBtn.disabled = false;
    
    for(let i = 0; i<levelArr.length; i++){
        levelArr[i].disabled = false;
    }
}

function updateScore(){
    scoreArr.push({ score: score, name: player });
    scoreArr.sort((a,b) => a.score - b.score);

    let lb = document.getElementsByName("leaderboard");
    wins.textContent = "Total wins: " + scoreArr.length;
    let sum = 0;
    for(let i=0; i<scoreArr.length; i++){
        sum += scoreArr[i].score;
        if(i<lb.length){
            lb[i].textContent = `${scoreArr[i].score} (${scoreArr[i].name})`;
        }
    }
    let avg = sum/scoreArr.length;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);
    const rank = scoreArr.findIndex(item => item.score === score && item.name === player) + 1;
    return rank;
}

function renderList(olId, arr, fmt){
  const ol = document.getElementById(olId);
  if (!ol) return;                         // 보드가 없으면 조용히 스킵
  const lis = ol.querySelectorAll('li');   // 보드의 <li>들 (예: 3개)
  for (let i = 0; i < lis.length; i++){
    lis[i].textContent = arr[i] ? fmt(arr[i]) : '--';
  }
}

function updateFastest(elapsed){
    fastestArr.push({ time: elapsed, name: player });
    fastestArr.sort((a,b) => a.time - b.time);

    const slots = document.getElementsByName("fastest"); 
    for(let i = 0; i < slots.length; i++){
        if(i < fastestArr.length){
            slots[i].textContent = `${fastestArr[i].time.toFixed(2)}s (${fastestArr[i].name})`;
        }else{
            slots[i].textContent = "--";
        }
    }
    const rank = fastestArr.findIndex(item => item.time === elapsed && item.name === player) + 1;
    return rank;
}

function updateAverageTime(elapsed){
    timeArr.push(elapsed);

    let total = 0;
    for (let i = 0; i < timeArr.length; i++){
        total += timeArr[i];
    }
    const avg = total / timeArr.length;

    const avgEl = typeof avgTime !== 'undefined' ? avgTime : document.getElementById('avgTime');
    if (avgEl) {
        avgEl.textContent = "Average Time: " + avg.toFixed(2) + " seconds";
    }
}

function time(){
    const d = new Date();
    const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const day = d.getDate();
    let suffix = "th";
    if (day < 11 || day > 13) {
        switch (day % 10) {
            case 1: suffix = 'st'; break;
            case 2: suffix = 'nd'; break;
            case 3: suffix = 'rd'; break;
            default: suffix = 'th';   
        }
    }

    const monthName = months[d.getMonth()];
    const year = d.getFullYear();

    const timeZonePart = d.toString().split(year)[1].trim(); 

    return `${monthName} ${day}${suffix}, ${year} ${timeZonePart}`;
}

function temperatureWord(diff, level){
    const p = diff / level;
    if (diff === 0) return "on fire!!!";            
    if (p <= 0.05) return "boiling!!";
    if (p <= 0.10) return "hot!";
    if (p <= 0.20) return "warm";
    if (p <= 0.30) return "cool";
    return "cold";
}

function scoreRating(score, level){
    const binarySearchMin = Math.max(1, Math.log2(level));;
    const r = score / binarySearchMin;

    if (r <= 0.7) return "excellent";
    if (r <= 0.9) return "good";
    if (r <= 1.1) return "ok";
    if (r <= 1.5) return "meh";
    return "bad";
}

function endGame(){
  try { clearInterval(clockId); } catch(e) {}

  playBtn.disabled = true;
  guessBtn.disabled = true;
  giveUp.disabled = true;
  nameBtn.disabled = true;
  playerName.disabled = true;
  nameChangeBtn.disabled = true;
  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = true;
  guess.disabled = true;

  msg.textContent = "Good Bye, " + player +". Reload the page to start over.";

}