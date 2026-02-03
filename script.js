let mediaRecorder;
let audioChunks = [];
let timerInterval;
let seconds = 0;

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendBtn');
const messageList = document.getElementById('messageList');
const timerDisplay = document.getElementById('timer');

recordBtn.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        seconds = 0;

        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        
        mediaRecorder.onstop = () => {
            clearInterval(timerInterval);
            sendBtn.disabled = false;
            stream.getTracks().forEach(t => t.stop());
        };

        mediaRecorder.start();
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        
        // Timer & 14s Limit
        timerInterval = setInterval(() => {
            seconds++;
            timerDisplay.innerText = `00:${seconds < 10 ? '0' + seconds : seconds}`;
            if (seconds >= 14) stopBtn.click(); // Automatischer Stopp
        }, 1000);

    } catch (err) { alert("Mikrofon aktivieren!"); }
};

stopBtn.onclick = () => {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
};

sendBtn.onclick = () => {
    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
    const url = URL.createObjectURL(audioBlob);
    
    // Erstelle Custom Player Element
    const bubble = document.createElement('div');
    bubble.className = 'voice-bubble';
    bubble.innerHTML = `
        <button class="play-trigger">▶</button>
        <div class="progress-container"><div class="progress-fill"></div></div>
        <span style="font-size:10px; color:#666;">${seconds}s</span>
        <audio src="${url}"></audio>
    `;

    messageList.appendChild(bubble);
    
    // Player Logik
    const audio = bubble.querySelector('audio');
    const btn = bubble.querySelector('.play-trigger');
    const fill = bubble.querySelector('.progress-fill');

    btn.onclick = () => {
        if (audio.paused) {
            audio.play();
            btn.innerText = "⏸";
        } else {
            audio.pause();
            btn.innerText = "▶";
        }
    };

    audio.ontimeupdate = () => {
        fill.style.width = (audio.currentTime / audio.duration * 100) + "%";
    };
    audio.onended = () => btn.innerText = "▶";

    // Reset UI
    sendBtn.disabled = true;
    timerDisplay.innerText = "00:00";
    messageList.scrollTop = messageList.scrollHeight;
};