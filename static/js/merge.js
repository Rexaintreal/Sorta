document.addEventListener('DOMContentLoaded', () => {
    let array = [38, 27, 43, 3, 9, 82];
    let sortingSteps = [];
    let currentStep = -1;
    let isPlaying = false;
    let isPaused = false;
    let speed = 1400;
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

        steps.push({
            array: [...tempArr],
            action: 'initial',
            left: -1,
            right: -1,
            mid: -1,
            activeIndices: [],
            message: 'Initial array Ready to sort'
        });

        mergeSortHelper(tempArr, 0, tempArr.length - 1, steps);

        steps.push({
            array: [...tempArr],
            action: 'complete',
            left: -1,
            right: -1,
            mid: -1,
            activeIndices: Array.from({length: tempArr.length}, (_, i) => i),
            message: 'Sorting complete'
        });

        return steps;
    }

    function mergeSortHelper(arr, left, right, steps) {
        if (left >= right) {
            return;
        }

        const mid = Math.floor((left + right) / 2);

        steps.push({
            array: [...arr],
            action: 'divide',
            left: left,
            right: right,
            mid: mid,
            activeIndices: Array.from({length: right - left + 1}, (_, i) => left + i),
            message: `Dividing array from index ${left} to ${right} at midpoint ${mid}`
        });

        mergeSortHelper(arr, left, mid, steps);
        mergeSortHelper(arr, mid + 1, right, steps);

        merge(arr, left, mid, right, steps);
    }

    function merge(arr, left, mid, right, steps) {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);

        steps.push({
            array: [...arr],
            action: 'merge_start',
            left: left,
            right: right,
            mid: mid,
            activeIndices: Array.from({length: right - left + 1}, (_, i) => left + i),
            message: `Merging subarrays [${leftArr.join(', ')}] and [${rightArr.join(', ')}]`
        });

        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length) {
            steps.push({
                array: [...arr],
                action: 'comparing',
                left: left,
                right: right,
                mid: mid,
                activeIndices: [k],
                compareIndices: [left + i, mid + 1 + j],
                message: `Comparing ${leftArr[i]} and ${rightArr[j]}`
            });

            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                steps.push({
                    array: [...arr],
                    action: 'place_left',
                    left: left,
                    right: right,
                    mid: mid,
                    activeIndices: [k],
                    message: `Placing ${leftArr[i]} from left subarray at position ${k}`
                });
                i++;
            } else {
                arr[k] = rightArr[j];
                steps.push({
                    array: [...arr],
                    action: 'place_right',
                    left: left,
                    right: right,
                    mid: mid,
                    activeIndices: [k],
                    message: `Placing ${rightArr[j]} from right subarray at position ${k}`
                });
                j++;
            }
            k++;
        }

        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            steps.push({
                array: [...arr],
                action: 'place_remaining',
                left: left,
                right: right,
                mid: mid,
                activeIndices: [k],
                message: `Placing remaining element ${leftArr[i]} at position ${k}`
            });
            i++;
            k++;
        }

        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            steps.push({
                array: [...arr],
                action: 'place_remaining',
                left: left,
                right: right,
                mid: mid,
                activeIndices: [k],
                message: `Placing remaining element ${rightArr[j]} at position ${k}`
            });
            j++;
            k++;
        }

        steps.push({
            array: [...arr],
            action: 'merge_complete',
            left: left,
            right: right,
            mid: mid,
            activeIndices: Array.from({length: right - left + 1}, (_, i) => left + i),
            message: `Merged subarray from index ${left} to ${right}`
        });
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
            box.classList.remove('dividing', 'merging', 'sorted');
            box.style.borderColor = '#888688';
            box.style.boxShadow = 'none';

            if (data.action === 'complete') {
                box.classList.add('sorted');
            } else if (data.action === 'divide' && data.activeIndices.includes(index)) {
                box.classList.add('dividing');
            } else if ((data.action === 'merge_start' || data.action === 'merge_complete' || 
                       data.action === 'comparing' || data.action === 'place_left' || 
                       data.action === 'place_right' || data.action === 'place_remaining') && 
                       data.activeIndices.includes(index)) {
                box.classList.add('merging');
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

        if (data.action === 'divide') {
            const activeBoxes = data.activeIndices.map(i => wrappers[i]?.querySelector('.array-box')).filter(Boolean);
            activeBoxes.forEach(box => box.classList.add('lifted'));
            await sleep(speed * 0.5);
            activeBoxes.forEach(box => box.classList.remove('lifted'));
            await sleep(speed * 0.2);
        } else if (data.action === 'merge_start') {
            const activeBoxes = data.activeIndices.map(i => wrappers[i]?.querySelector('.array-box')).filter(Boolean);
            activeBoxes.forEach(box => box.classList.add('lifted'));
            await sleep(speed * 0.4);
            activeBoxes.forEach(box => box.classList.remove('lifted'));
            await sleep(speed * 0.2);
        } else if (data.action === 'comparing') {
            if (data.compareIndices) {
                const compareBoxes = data.compareIndices.map(i => wrappers[i]?.querySelector('.array-box')).filter(Boolean);
                compareBoxes.forEach(box => box.classList.add('lifted'));
                await sleep(speed * 0.4);
                compareBoxes.forEach(box => box.classList.remove('lifted'));
                await sleep(speed * 0.2);
            }
        } else if (data.action === 'place_left' || data.action === 'place_right' || data.action === 'place_remaining') {
            const placeBox = wrappers[data.activeIndices[0]]?.querySelector('.array-box');
            if (placeBox) {
                placeBox.classList.add('lifted');
                await sleep(speed * 0.4);
                placeBox.classList.remove('lifted');
                await sleep(speed * 0.2);
            }
        } else if (data.action === 'merge_complete') {
            const activeBoxes = data.activeIndices.map(i => wrappers[i]?.querySelector('.array-box')).filter(Boolean);
            activeBoxes.forEach(box => box.classList.add('lifted'));
            await sleep(speed * 0.4);
            activeBoxes.forEach(box => box.classList.remove('lifted'));
            await sleep(speed * 0.2);
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