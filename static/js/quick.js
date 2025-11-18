document.addEventListener('DOMContentLoaded', () => {
    let array = [10, 7, 8, 9, 1, 5, 3];
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

        steps.push({
            array: [...tempArr],
            action: 'initial',
            pivotIdx: -1,
            compareIdx: -1,
            sorted: [],
            message: 'Initial array Ready to sort'
        });

        quickSortHelper(tempArr, 0, tempArr.length - 1, steps);

        steps.push({
            array: [...tempArr],
            action: 'complete',
            pivotIdx: -1,
            compareIdx: -1,
            sorted: Array.from({length: tempArr.length}, (_, i) => i),
            message: 'Sorting complete'
        });

        return steps;
    }

    function quickSortHelper(arr, low, high, steps) {
        if (low < high) {
            steps.push({
                array: [...arr],
                action: 'select_pivot',
                pivotIdx: high,
                compareIdx: -1,
                partitionRange: [low, high],
                sorted: [],
                message: `Selected pivot ${arr[high]} at position ${high}`
            });

            const pi = partition(arr, low, high, steps);
            
            steps.push({
                array: [...arr],
                action: 'pivot_placed',
                pivotIdx: pi,
                compareIdx: -1,
                sorted: [pi],
                message: `Pivot ${arr[pi]} placed at correct position ${pi}`
            });

            quickSortHelper(arr, low, pi - 1, steps);
            quickSortHelper(arr, pi + 1, high, steps);
        } else if (low === high) {
            steps.push({
                array: [...arr],
                action: 'single_element',
                pivotIdx: low,
                compareIdx: -1,
                sorted: [low],
                message: `Single element ${arr[low]} at position ${low} is already sorted`
            });
        }
    }

    function partition(arr, low, high, steps) {
        const pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            steps.push({
                array: [...arr],
                action: 'compare',
                pivotIdx: high,
                compareIdx: j,
                partitionRange: [low, high],
                sorted: [],
                message: `Comparing ${arr[j]} with pivot ${pivot}`
            });

            if (arr[j] < pivot) {
                i++;
                if (i !== j) {
                    const temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;

                    steps.push({
                        array: [...arr],
                        action: 'swap',
                        pivotIdx: high,
                        swapIndices: [i, j],
                        partitionRange: [low, high],
                        sorted: [],
                        message: `Swapped ${arr[i]} and ${arr[j]} - moving smaller element to left`
                    });
                } else {
                    steps.push({
                        array: [...arr],
                        action: 'no_swap',
                        pivotIdx: high,
                        compareIdx: j,
                        partitionRange: [low, high],
                        sorted: [],
                        message: `${arr[j]} is smaller than pivot already in correct partition`
                    });
                }
            } else {
                steps.push({
                    array: [...arr],
                    action: 'skip',
                    pivotIdx: high,
                    compareIdx: j,
                    partitionRange: [low, high],
                    sorted: [],
                    message: `${arr[j]} is greater than or equal to pivot stays on right`
                });
            }
        }

        const temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;

        steps.push({
            array: [...arr],
            action: 'pivot_swap',
            pivotIdx: i + 1,
            swapIndices: [i + 1, high],
            partitionRange: [low, high],
            sorted: [],
            message: `Placing pivot ${arr[i + 1]} at its final position ${i + 1}`
        });

        return i + 1;
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
            box.classList.remove('pivot', 'comparing', 'swapping', 'sorted');
            box.style.borderColor = '#888688';
            box.style.boxShadow = 'none';

            if (data.sorted && data.sorted.includes(index)) {
                box.classList.add('sorted');
            } else if (index === data.pivotIdx && data.action !== 'complete') {
                box.classList.add('pivot');
            } else if (index === data.compareIdx || (data.swapIndices && data.swapIndices.includes(index))) {
                if (data.action === 'compare' || data.action === 'skip' || data.action === 'no_swap') {
                    box.classList.add('comparing');
                } else if (data.action === 'swap' || data.action === 'pivot_swap') {
                    box.classList.add('swapping');
                }
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

        if (data.action === 'select_pivot' || data.action === 'pivot_placed' || data.action === 'single_element') {
            const pivotBox = wrappers[data.pivotIdx]?.querySelector('.array-box');
            if (pivotBox) {
                pivotBox.classList.add('lifted');
                await sleep(speed * 0.5);
                pivotBox.classList.remove('lifted');
                await sleep(speed * 0.2);
            }
        } else if (data.action === 'compare' || data.action === 'skip' || data.action === 'no_swap') {
            const compareBox = wrappers[data.compareIdx]?.querySelector('.array-box');
            const pivotBox = wrappers[data.pivotIdx]?.querySelector('.array-box');
            
            if (compareBox) compareBox.classList.add('lifted');
            if (pivotBox) pivotBox.classList.add('lifted');
            
            await sleep(speed * 0.4);
            
            if (compareBox) compareBox.classList.remove('lifted');
            if (pivotBox) pivotBox.classList.remove('lifted');
            
            await sleep(speed * 0.2);
        } else if (data.action === 'swap' || data.action === 'pivot_swap') {
            if (!data.swapIndices || data.swapIndices.length < 2) {
                isAnimating = false;
                updateButtons();
                return;
            }

            const [idx1, idx2] = data.swapIndices;
            const box1 = wrappers[idx1]?.querySelector('.array-box');
            const box2 = wrappers[idx2]?.querySelector('.array-box');

            if (!box1 || !box2) {
                isAnimating = false;
                updateButtons();
                return;
            }

            box1.classList.add('lifted');
            box2.classList.add('lifted');
            await sleep(speed * 0.3);

            const rect1 = wrappers[idx1].getBoundingClientRect();
            const rect2 = wrappers[idx2].getBoundingClientRect();
            const distance = rect2.left - rect1.left;

            wrappers[idx1].style.transform = `translateX(${distance}px)`;
            wrappers[idx2].style.transform = `translateX(${-distance}px)`;

            await sleep(speed * 0.5);

            if (idx1 < idx2) {
                wrappers[idx2].parentNode.insertBefore(wrappers[idx2], wrappers[idx1]);
            } else {
                wrappers[idx1].parentNode.insertBefore(wrappers[idx1], wrappers[idx2]);
            }

            wrappers[idx1].style.transform = '';
            wrappers[idx2].style.transform = '';

            const newWrappers = Array.from(arrayContainer.children);
            newWrappers[idx1]?.querySelector('.array-box')?.classList.remove('lifted');
            newWrappers[idx2]?.querySelector('.array-box')?.classList.remove('lifted');

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