document.addEventListener('DOMContentLoaded', () => {
    
    const audio = document.getElementById('audio');
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');
    const articleActions = document.querySelector('.article-actions');
    const popupNotification = document.getElementById('popupNotification');
    
    yesButton.addEventListener('click', () => {
        articleActions.style.opacity = '0';
        articleActions.style.pointerEvents = 'none';
        popupNotification.classList.add('show');
        
        if (audio && !isPlaying) {
            audio.play().catch(e => console.log('Auto-play prevented:', e));
        }
    });
    
    window.closePopup = function() {
        popupNotification.classList.remove('show');
        
        articleActions.style.opacity = '1';
        articleActions.style.pointerEvents = 'auto';
    };
    
    let hasBeenClicked = false;
    let isEscaping = false;
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (hasBeenClicked && !isEscaping) {
            checkProximityAndEscape();
        }
    });
    
    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    //Pag pinindot hindi dapat nasama
    function getSafePosition() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const buttonWidth = noButton.offsetWidth;
        const buttonHeight = noButton.offsetHeight;
        
        let attempts = 0;
        let safeX, safeY;
        
        do {
            safeX = Math.random() * (viewportWidth - buttonWidth - 40) + 20;
            safeY = Math.random() * (viewportHeight - buttonHeight - 40) + 20;
            attempts++;
        } while (getDistance(mouseX, mouseY, safeX, safeY) < 250 && attempts < 15);
        
        return { x: safeX, y: safeY };
    }
    
    function checkProximityAndEscape() {
        const buttonRect = noButton.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        const distance = getDistance(mouseX, mouseY, buttonCenterX, buttonCenterY);
        
        if (distance < 150) {
            escapeNow();
        }
    }
    
    function escapeNow() {
        if (isEscaping) return;
        
        isEscaping = true;
        const safePos = getSafePosition();
        
        noButton.style.position = 'fixed';
        noButton.style.left = safePos.x + 'px';
        noButton.style.top = safePos.y + 'px';
        noButton.style.transform = 'none';
        noButton.style.transition = 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        setTimeout(() => {
            isEscaping = false;
        }, 250);
    }
    
    noButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!hasBeenClicked) {
            hasBeenClicked = true;
            const initialRect = noButton.getBoundingClientRect();
            
            noButton.style.position = 'fixed';
            noButton.style.left = initialRect.left + 'px';
            noButton.style.top = initialRect.top + 'px';
            noButton.style.margin = '0';
            
            setTimeout(() => {
                escapeNow();
            }, 50);
        } else {
            escapeNow();
        }
    });
    
    noButton.addEventListener('mouseenter', () => {
        if (hasBeenClicked) {
            escapeNow();
        }
    });
    //MUSIC SHMUSIC
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTime = document.getElementById('currentTime');
    const totalTime = document.getElementById('totalTime');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeBar = document.getElementById('volumeBar');
    const volumeFill = document.getElementById('volumeFill');
    
    let isPlaying = false;
    let isSeeking = false;
    
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    });
    
    audio.addEventListener('play', () => {
        isPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    });
    
    audio.addEventListener('pause', () => {
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    });
    
    audio.addEventListener('timeupdate', () => {
        if (!isSeeking && audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = `${percent}%`;
            currentTime.textContent = formatTime(audio.currentTime);
        }
    });
    
    audio.addEventListener('loadedmetadata', () => {
        totalTime.textContent = formatTime(audio.duration);
    });
    
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
        progressFill.style.width = `${percent * 100}%`;
    });
    
    progressBar.addEventListener('mousedown', () => {
        isSeeking = true;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isSeeking) {
            const rect = progressBar.getBoundingClientRect();
            let percent = (e.clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));
            progressFill.style.width = `${percent * 100}%`;
            currentTime.textContent = formatTime(percent * audio.duration);
        }
    });
    
    document.addEventListener('mouseup', (e) => {
        if (isSeeking) {
            const rect = progressBar.getBoundingClientRect();
            let percent = (e.clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));
            audio.currentTime = percent * audio.duration;
            isSeeking = false;
        }
    });
    
    if (volumeBar && volumeFill) {
        audio.volume = 0.7;
        volumeFill.style.width = '70%';
        
        volumeBar.addEventListener('click', (e) => {
            const rect = volumeBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.volume = Math.max(0, Math.min(1, percent));
            volumeFill.style.width = `${percent * 100}%`;
        });
        
        volumeBtn.addEventListener('click', () => {
            if (audio.volume > 0) {
                audio.dataset.prevVolume = audio.volume;
                audio.volume = 0;
                volumeFill.style.width = '0%';
            } else {
                const prevVolume = parseFloat(audio.dataset.prevVolume) || 0.7;
                audio.volume = prevVolume;
                volumeFill.style.width = `${prevVolume * 100}%`;
            }
        });
    }
    
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        progressFill.style.width = '0%';
        currentTime.textContent = '0:00';
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    });
    
    console.log('');
});
//IGHT WE GOOD