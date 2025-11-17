document.addEventListener('DOMContentLoaded', () => {
    let array = [5, 2, 8, 1, 9];
    let sortingSteps = [];
    let currentStep = -1;
    let isPlaying = false;
    let isPaused = false;
    let speed = 1200;
    let isAnimating = false;
    const arrayContainer = document.getElementById('arrayContainer');
    const playPauseBtn = document.getElementById('playPause');
    const stepBackBtn = document.getElementById('stepBack');
    const stepForwardBtn = document.getElementById('stepForward');
    const resetBtn = document.getElementById('reset');
    const statusMessage = document.getElementById('statusMessage');
    const arrayLengthInput = document.getElementById('arrayLength');
    const arrayValuesInput = document.getElementById('arrayValues');
    const updateArrayBtn = document.getElementById('updateArray');
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');
    const closeModal = document.getElementById('closeModal');

    function showAlert(message) {
        alertMessage.textContent = message;
        alertModal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => {
        alertModal.classList.add('hidden');
    });

    const langTabs = document.querySelectorAll('.lang-tab');
    const codeBlocks = document.querySelectorAll('.code-block');

    langTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const lang = tab.dataset.lang;
            langTabs.forEach(t => {
                t.classList.remove('active', 'bg-[#DADADA]', 'text-[#000000]');
                t.classList.add('bg-[#1A1A1A]', 'text-[#888688]');
            });
            tab.classList.add('active', 'bg-[#DADADA]', 'text-[#000000]');
            tab.classList.remove('bg-[#1A1A1A]', 'text-[#888688]');
            codeBlocks.forEach(block => {
                if (block.id === `code-${lang}`) {
                    block.classList.remove('hidden');
                } else {
                    block.classList.add('hidden');
                }
            });
        });
    });

    function generateSortingSteps(arr) {
        const steps = [];
        const tempArr = [...arr];
        const n = tempArr.length;

        steps.push({
            array: [...tempArr],
            action: 'initial',
            currentIdx: -1,
            minIdx: -1,
            sorted: [],
            message: 'Initial array Ready to sort'
        });

        for (let i = 0; i < n; i++) {
            let minIdx = i;

            steps.push({
                array: [...tempArr],
                action: 'start_pass',
                currentIdx: i,
                minIdx: minIdx,
                sorted: Array.from({length: i}, (_, k) => k),
                message: `Starting pass ${i + 1} - looking for minimum in unsorted region`
            });

            for (let j = i + 1; j < n; j++) {
                steps.push({
                    array: [...tempArr],
                    action: 'checking',
                    currentIdx: j,
                    minIdx: minIdx,
                    sorted: Array.from({length: i}, (_, k) => k),
                    message: `Checking ${tempArr[j]} against current minimum ${tempArr[minIdx]}`
                });

                if (tempArr[j] < tempArr[minIdx]) {
                    minIdx = j;
                    steps.push({
                        array: [...tempArr],
                        action: 'new_minimum',
                        currentIdx: j,
                        minIdx: minIdx,
                        sorted: Array.from({length: i}, (_, k) => k),
                        message: `Found new minimum: ${tempArr[minIdx]} at position ${minIdx}`
                    });
                }
            }

            if (minIdx !== i) {
                const temp = tempArr[i];
                tempArr[i] = tempArr[minIdx];
                tempArr[minIdx] = temp;

                steps.push({
                    array: [...tempArr],
                    action: 'swap',
                    currentIdx: i,
                    minIdx: minIdx,
                    sorted: Array.from({length: i + 1}, (_, k) => k),
                    message: `Swapping ${tempArr[i]} with minimum ${tempArr[minIdx]}`
                });
            } else {
                steps.push({
                    array: [...tempArr],
                    action: 'no_swap',
                    currentIdx: i,
                    minIdx: minIdx,
                    sorted: Array.from({length: i + 1}, (_, k) => k),
                    message: `Element ${tempArr[i]} already in correct position`
                });
            }
        }

        steps.push({
            array: [...tempArr],
            action: 'complete',
            currentIdx: -1,
            minIdx: -1,
            sorted: Array.from({length: n}, (_, i) => i),
            message: 'Sorting complete'
        });

        return steps;
    }

    function createBox(value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'box-wrapper';
        const square = document.createElement('div');
        const boxSize = array.length >= 8 ? 'w-16 h-16 text-xl' : 'w-20 h-20 text-2xl';
        square.className = `array-box ${boxSize} border-2 border-[#888688] flex items-center justify-center font-bold rounded bg-[#0A0A0A]`;
        square.textContent = value;
        wrapper.appendChild(square);
        return wrapper;
    }

    function updateBoxStates(data) {
        const boxes = arrayContainer.querySelectorAll('.array-box');
        boxes.forEach((box, index) => {
            box.classList.remove('current', 'minimum', 'sorted');
            box.style.borderColor = '#888688';
            box.style.boxShadow = 'none';

            if (data.sorted.includes(index)) {
                box.classList.add('sorted');
            } else if (index === data.currentIdx && (data.action === 'checking' || data.action === 'start_pass')) {
                box.classList.add('current');
            } else if (index === data.minIdx && data.minIdx !== -1) {
                box.classList.add('minimum');
            }
        });
    }

    function renderArray(step, animate = false) {
        const data = sortingSteps[step];
        statusMessage.textContent = data.message;

        if (arrayContainer.children.length !== data.array.length) {
            arrayContainer.innerHTML = '';
            data.array.forEach(value => {
                arrayContainer.appendChild(createBox(value));
            });
        }

        const boxes = arrayContainer.querySelectorAll('.array-box');
        boxes.forEach((box, index) => {
            box.textContent = data.array[index];
        });

        updateBoxStates(data);

        if (animate && data.action !== 'initial') {
            return animateStep(data);
        }

        updateButtons();
        return Promise.resolve();
    }

    async function animateStep(data) {
        isAnimating = true;
        updateButtons();

        const wrappers = Array.from(arrayContainer.children);

        if (data.action === 'checking' || data.action === 'new_minimum' || data.action === 'start_pass') {
            const currentBox = wrappers[data.currentIdx]?.querySelector('.array-box');
            const minBox = wrappers[data.minIdx]?.querySelector('.array-box');

            if (currentBox) currentBox.classList.add('lifted');
            if (minBox && data.minIdx !== data.currentIdx) minBox.classList.add('lifted');

            await sleep(speed * 0.4);

            if (currentBox) currentBox.classList.remove('lifted');
            if (minBox) minBox.classList.remove('lifted');

            await sleep(speed * 0.2);
        } else if (data.action === 'swap') {
            const box1 = wrappers[data.currentIdx]?.querySelector('.array-box');
            const box2 = wrappers[data.minIdx]?.querySelector('.array-box');

            if (!box1 || !box2) {
                isAnimating = false;
                updateButtons();
                return;
            }

            box1.classList.add('lifted');
            box2.classList.add('lifted');
            await sleep(speed * 0.3);

            const rect1 = wrappers[data.currentIdx].getBoundingClientRect();
            const rect2 = wrappers[data.minIdx].getBoundingClientRect();
            const distance = rect2.left - rect1.left;

            wrappers[data.currentIdx].style.transform = `translateX(${distance}px)`;
            wrappers[data.minIdx].style.transform = `translateX(${-distance}px)`;

            await sleep(speed * 0.5);

            if (data.currentIdx < data.minIdx) {
                wrappers[data.minIdx].parentNode.insertBefore(wrappers[data.minIdx], wrappers[data.currentIdx]);
            } else {
                wrappers[data.currentIdx].parentNode.insertBefore(wrappers[data.currentIdx], wrappers[data.minIdx]);
            }

            wrappers[data.currentIdx].style.transform = '';
            wrappers[data.minIdx].style.transform = '';

            const newWrappers = Array.from(arrayContainer.children);
            newWrappers[data.currentIdx]?.querySelector('.array-box')?.classList.remove('lifted');
            newWrappers[data.minIdx]?.querySelector('.array-box')?.classList.remove('lifted');

            await sleep(speed * 0.2);
        } else if (data.action === 'no_swap') {
            await sleep(speed * 0.3);
        }

        isAnimating = false;
        updateButtons();
    }

    function sleep(ms) {
        return new Promise(resolve => {
            const check = () => {
                if (!isPaused) return resolve();
                requestAnimationFrame(check);
            };
            setTimeout(check, ms);
        });
    }

    function updateButtons() {
        stepBackBtn.disabled = currentStep <= 0 || isAnimating || (isPlaying && !isPaused);
        stepForwardBtn.disabled = currentStep >= sortingSteps.length - 1 || isAnimating || (isPlaying && !isPaused);
        playPauseBtn.disabled = false;
        resetBtn.disabled = isAnimating || (isPlaying && !isPaused);
        updateArrayBtn.disabled = isAnimating || isPlaying;

        const stepCounter = document.getElementById('stepCounter');
        if (stepCounter) {
            stepCounter.textContent = `Step ${currentStep + 1} of ${sortingSteps.length}`;
        }
    }

    function initialize() {
        sortingSteps = generateSortingSteps(array);
        currentStep = 0;
        renderArray(currentStep, false);
        stopPlaying();
    }

    function togglePlayPause() {
        if (isPlaying && !isPaused) {
            isPaused = true;
            isAnimating = false;
            const icon = playPauseBtn.querySelector('i');
            const text = playPauseBtn.querySelector('span');
            icon.className = 'fas fa-play';
            text.textContent = 'Play';
            updateButtons();
        } else if (isPlaying && isPaused) {
            isPaused = false;
            const icon = playPauseBtn.querySelector('i');
            const text = playPauseBtn.querySelector('span');
            icon.className = 'fas fa-pause';
            text.textContent = 'Pause';
            updateButtons();
        } else {
            startPlaying();
        }
    }

    async function startPlaying() {
        if (currentStep >= sortingSteps.length - 1) {
            currentStep = 0;
            renderArray(currentStep, false);
        }

        isPlaying = true;
        isPaused = false;
        const icon = playPauseBtn.querySelector('i');
        const text = playPauseBtn.querySelector('span');
        icon.className = 'fas fa-pause';
        text.textContent = 'Pause';
        updateButtons();

        while (isPlaying && currentStep < sortingSteps.length - 1) {
            while (isPaused) {
                isAnimating = false;
                updateButtons();
                await sleep(50);
            }
            if (!isPlaying) break;

            currentStep++;
            await renderArray(currentStep, true);

            if (currentStep >= sortingSteps.length - 1) {
                stopPlaying();
                break;
            }
        }
    }

    function stopPlaying() {
        isPlaying = false;
        isPaused = false;
        const icon = playPauseBtn.querySelector('i');
        const text = playPauseBtn.querySelector('span');
        icon.className = 'fas fa-play';
        text.textContent = 'Play';
        updateButtons();
    }

    async function stepForward() {
        if (isAnimating) return;
        if (isPlaying && isPaused) {
            isPlaying = false;
            isPaused = false;
            if (currentStep < sortingSteps.length - 1) {
                currentStep++;
                await renderArray(currentStep, true);
            }
            updateButtons();
            return;
        }
        if (!isPlaying && currentStep < sortingSteps.length - 1) {
            currentStep++;
            await renderArray(currentStep, true);
        }
    }

    async function stepBack() {
        if (isAnimating) return;
        if (isPlaying && isPaused) {
            isPlaying = false;
            isPaused = false;
            if (currentStep > 0) {
                currentStep--;
                await renderArray(currentStep, false);
            }
            updateButtons();
            return;
        }
        if (!isPlaying && currentStep > 0) {
            currentStep--;
            await renderArray(currentStep, false);
        }
    }

    function reset() {
        if (isAnimating) return;
        stopPlaying();
        currentStep = 0;
        renderArray(currentStep, false);
    }

    function updateArrayFromInputs() {
        if (isAnimating || isPlaying) return;

        const length = parseInt(arrayLengthInput.value);
        if (isNaN(length) || length < 1 || length > 10) {
            showAlert('Array length must be between 1 and 10');
            return;
        }

        const values = arrayValuesInput.value.split(',').map(v => v.trim());
        if (values.length !== length) {
            showAlert(`You entered ${values.length} values but specified length ${length}. Please make sure they match`);
            return;
        }

        const parsedValues = [];
        for (let i = 0; i < values.length; i++) {
            const num = parseInt(values[i]);
            if (isNaN(num)) {
                showAlert(`Invalid value "${values[i]}" at position ${i + 1}. Please enter only numbers`);
                return;
            }
            if (num < 0 || num > 99) {
                showAlert(`Value ${num} at position ${i + 1} is out of range. Please use numbers between 0 and 99`);
                return;
            }
            parsedValues.push(num);
        }

        array = parsedValues;

        const codeArray = document.getElementById('codeArray');
        if (codeArray) {
            codeArray.textContent = array.join(', ');
        }

        initialize();
    }

    playPauseBtn.addEventListener('click', togglePlayPause);
    stepForwardBtn.addEventListener('click', stepForward);
    stepBackBtn.addEventListener('click', stepBack);
    resetBtn.addEventListener('click', reset);
    updateArrayBtn.addEventListener('click', updateArrayFromInputs);

    initialize();
});