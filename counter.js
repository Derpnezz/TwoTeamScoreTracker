document.addEventListener('DOMContentLoaded', function() {
    // Keep screen awake with periodic touches
    const keepAwakeElement = document.getElementById('keep-awake-touch');
    setInterval(() => {
        const touch = new Touch({
            identifier: Date.now(),
            target: keepAwakeElement,
            clientX: 0,
            clientY: 0,
            radiusX: 2,
            radiusY: 2,
            force: 1
        });
        
        const touchEvent = new TouchEvent('touchstart', {
            touches: [touch],
            targetTouches: [touch],
            changedTouches: [touch],
            bubbles: true,
            cancelable: true
        });
        
        keepAwakeElement.dispatchEvent(touchEvent);
    }, 30000); // Touch every 30 seconds

    const redScore = document.getElementById('red-score');
    const blueScore = document.getElementById('blue-score');
    const redSide = document.getElementById('red-side');
    const blueSide = document.getElementById('blue-side');

    let redCount = 0;
    let blueCount = 0;
    let pressTimer = null;
    let lastTap = 0;
    let isLongPress = false;

    // Function to handle score increase
    function increaseScore(scoreElement, side) {
        if (side === 'red') {
            redCount++;
            scoreElement.textContent = redCount;
        } else {
            blueCount++;
            scoreElement.textContent = blueCount;
        }

        // Add quick feedback animation
        scoreElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
        }, 100);
    }

    // Function to handle score decrease
    function decreaseScore(scoreElement, side) {
        if (side === 'red' && redCount > 0) {
            redCount--;
            scoreElement.textContent = redCount;
        } else if (side === 'blue' && blueCount > 0) {
            blueCount--;
            scoreElement.textContent = blueCount;
        }
    }

    // Function to handle long press reset
    function startPress(scoreElement, side) {
        isLongPress = false;
        pressTimer = setTimeout(() => {
            // Reset both scores
            redCount = 0;
            blueCount = 0;
            redScore.textContent = '0';
            blueScore.textContent = '0';
            isLongPress = true;

            // Add feedback animation for reset on both sides
            redScore.style.transform = 'scale(0.8)';
            blueScore.style.transform = 'scale(0.8)';
            setTimeout(() => {
                redScore.style.transform = 'scale(1)';
                blueScore.style.transform = 'scale(1)';
            }, 200);
        }, 3000); // 3 seconds for reset
    }

    function endPress() {
        clearTimeout(pressTimer);
    }

    // Handle events for red side
    redSide.addEventListener('mousedown', () => startPress(redScore, 'red'));
    redSide.addEventListener('touchstart', () => startPress(redScore, 'red'));
    redSide.addEventListener('mouseup', () => endPress());
    redSide.addEventListener('touchend', (e) => {
        endPress();
        if (!isLongPress) {
            handleTap(redScore, 'red');
        }
    });

    // Function to handle tap with Promise.race
    function handleTap(scoreElement, side) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // This is a double tap
            decreaseScore(scoreElement, side);
            lastTap = 0; // Reset lastTap
        } else {
            const tapTime = currentTime;
            // Wait to see if another tap occurs
            Promise.race([
                new Promise(resolve => {
                    setTimeout(() => resolve('timeout'), 300);
                }),
                new Promise(resolve => {
                    lastTap = tapTime;
                })
            ]).then(result => {
                if (result === 'timeout' && lastTap === tapTime) {
                    // No second tap occurred
                    increaseScore(scoreElement, side);
                }
            });
        }
    }

    // Disable right click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Handle events for blue side
    blueSide.addEventListener('mousedown', () => startPress(blueScore, 'blue'));
    blueSide.addEventListener('touchstart', () => startPress(blueScore, 'blue'));
    blueSide.addEventListener('mouseup', () => endPress());
    blueSide.addEventListener('touchend', (e) => {
        endPress();
        if (!isLongPress) {
            handleTap(blueScore, 'blue');
        }
    });

    // Lock orientation to landscape if supported
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(function(error) {
            console.log('Orientation lock failed:', error);
        });
    }

    // Prevent default touch behavior
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
});
