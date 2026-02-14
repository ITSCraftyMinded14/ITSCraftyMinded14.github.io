// === RelayAI trainable bot ===
const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// starter words for random seeds
const starterWords = ["hello","i","you","chat","ai","bot","fun","how","what","ok","hey"];

// weighted memory: { word: {nextWord: weight, ...}, ... }
const botMemory = {};

// bot rules: control when/how words appear
const botRules = {
  "fun": { minDistance: 2 },
  "hello": { startSentence: true },
  "ai": { minDistance: 1 }
};

// track last used words for rules
const lastUsed = {};

// helper: add message
function addMessage(text,type){
  const msg = document.createElement("div");
  msg.className = "msg " + type;
  msg.innerText = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

// train bot memory on user input
function trainMemory(text){
  const words = text.toLowerCase().split(/\s+/);
  for(let i=0;i<words.length-1;i++){
    const w1 = words[i];
    const w2 = words[i+1];
    if(!botMemory[w1]) botMemory[w1]={};
    if(!botMemory[w1][w2]) botMemory[w1][w2]=0;
    botMemory[w1][w2]++;
  }
}

// pick next word based on weighted memory and rules
function pickNextWord(currentWord){
  const nextWords = botMemory[currentWord];
  if(!nextWords || Object.keys(nextWords).length===0){
    // fallback to starter word
    return starterWords[Math.floor(Math.random()*starterWords.length)];
  }
  // filter next words by rules
  let candidates = [];
  for(const w in nextWords){
    const weight = nextWords[w];
    const rule = botRules[w];
    if(rule){
      if(rule.minDistance && lastUsed[w] !== undefined){
        if(lastUsed[w] + rule.minDistance > output.length) continue;
      }
      if(rule.startSentence && output.length>0) continue;
    }
    for(let i=0;i<weight;i++) candidates.push(w);
  }
  if(candidates.length===0){
    return starterWords[Math.floor(Math.random()*starterWords.length)];
  }
  const chosen = candidates[Math.floor(Math.random()*candidates.length)];
  lastUsed[chosen] = output.length;
  return chosen;
}

// generate AI response
function generateResponse(seed){
  const words = seed.toLowerCase().split(/\s+/);
  let word = words[words.length-1] || starterWords[Math.floor(Math.random()*starterWords.length)];
  output = [];
  for(let i=0;i<20;i++){
    output.push(word);
    word = pickNextWord(word);
  }
  // basic punctuation: split into sentences
  for(let i=3;i<output.length;i+=5){
    output[i] += ".";
  }
  return output.join(' ').replace(/^\w/,c=>c.toUpperCase());
}

// handle sending message
function sendMsg(){
  const text = input.value.trim();
  if(!text) return;
  addMessage(text,"user");
  input.value="";
  trainMemory(text);
  addMessage("RelayAI is thinking...","bot");
  setTimeout(()=>{
    messages.lastChild.remove();
    addMessage(generateResponse(text),"bot");
  },500);
}

sendBtn.addEventListener("click",sendMsg);
input.addEventListener("keypress",e=>{if(e.key==="Enter") sendMsg();});
