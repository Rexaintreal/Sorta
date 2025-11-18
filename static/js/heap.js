document.addEventListener('DOMContentLoaded', () => {
    let array = [12, 11, 13, 5, 6, 7];
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
            heapifyIdx: -1,
            compareIdx: -1,
            sorted: [],
            message: 'Initial array Ready to sort'
        });
        steps.push({
            array: [...tempArr],
            action: 'build_heap_start',
            heapifyIdx: -1,
            compareIdx: -1,
            sorted: [],
            message: 'Building max heap from array'
        });

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            heapify(tempArr, n, i, steps, []);
        }

        steps.push({
            array: [...tempArr],
            action: 'heap_built',
            heapifyIdx: -1,
            compareIdx: -1,
            sorted: [],
            message: 'Max heap built largest element is at root'
        });

        for (let i = n - 1; i > 0; i--) {
            steps.push({
                array: [...tempArr],
                action: 'extract_max',
                heapifyIdx: 0,
                swapIdx: i,
                sorted: Array.from({length: n - i - 1}, (_, k) => n - 1 - k),
                message: `Extracting maximum ${tempArr[0]} and placing at position ${i}`
            });

            const temp = tempArr[0];
            tempArr[0] = tempArr[i];
            tempArr[i] = temp;

            steps.push({
                array: [...tempArr],
                action: 'swap_complete',
                heapifyIdx: 0,
                swapIdx: i,
                sorted: Array.from({length: n - i}, (_, k) => n - 1 - k),
                message: `Swapped ${tempArr[i]} to sorted position`
            });

            heapify(tempArr, i, 0, steps, Array.from({length: n - i}, (_, k) => n - 1 - k));
        }

        steps.push({
            array: [...tempArr],
            action: 'complete',
            heapifyIdx: -1,
            compareIdx: -1,
            sorted: Array.from({length: n}, (_, i) => i),
            message: 'Sorting complete'
        });

        return steps;
    }

    function heapify(arr, n, i, steps, sorted) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        steps.push({
            array: [...arr],
            action: 'heapify_start',
            heapifyIdx: i,
            compareIdx: -1,
            sorted: sorted,
            message: `Heapifying subtree rooted at index ${i} (value ${arr[i]})`
        });

        if (left < n) {
            steps.push({
                array: [...arr],
                action: 'compare_left',
                heapifyIdx: i,
                compareIdx: left,
                sorted: sorted,
                message: `Comparing root ${arr[i]} with left child ${arr[left]}`
            });

            if (arr[left] > arr[largest]) {
                largest = left;
                steps.push({
                    array: [...arr],
                    action: 'update_largest',
                    heapifyIdx: largest,
                    compareIdx: i,
                    sorted: sorted,
                    message: `Left child ${arr[left]} is larger updating largest`
                });
            }
        }

        if (right < n) {
            steps.push({
                array: [...arr],
                action: 'compare_right',
                heapifyIdx: largest,
                compareIdx: right,
                sorted: sorted,
                message: `Comparing current largest ${arr[largest]} with right child ${arr[right]}`
            });

            if (arr[right] > arr[largest]) {
                largest = right;
                steps.push({
                    array: [...arr],
                    action: 'update_largest',
                    heapifyIdx: largest,
                    compareIdx: -1,
                    sorted: sorted,
                    message: `Right child ${arr[right]} is larger updating largest`
                });
            }
        }

        if (largest !== i) {
            steps.push({
                array: [...arr],
                action: 'swap_heapify',
                heapifyIdx: i,
                swapIdx: largest,
                sorted: sorted,
                message: `Swapping ${arr[i]} with ${arr[largest]} to maintain heap property`
            });

            const temp = arr[i];
            arr[i] = arr[largest];
            arr[largest] = temp;

            steps.push({
                array: [...arr],
                action: 'after_swap',
                heapifyIdx: largest,
                compareIdx: -1,
                sorted: sorted,
                message: `Swap complete - recursively heapifying affected subtree`
            });

            heapify(arr, n, largest, steps, sorted);
        } else {
            steps.push({
                array: [...arr],
                action: 'heap_valid',
                heapifyIdx: i,
                compareIdx: -1,
                sorted: sorted,
                message: `Subtree at index ${i} already satisfies heap property`
            });
        }
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
            box.classList.remove('heapifying', 'comparing', 'swapping', 'sorted');
            box.style.borderColor = '#888688';
            box.style.boxShadow = 'none';

            if (data.sorted && data.sorted.includes(index)) {
                box.classList.add('sorted');
            } else if (index === data.heapifyIdx && data.action !== 'complete') {
                box.classList.add('heapifying');
            } else if (index === data.compareIdx) {
                box.classList.add('comparing');
            } else if (index === data.swapIdx) {
                box.classList.add('swapping');
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

        if (data.action === 'heapify_start' || data.action === 'build_heap_start' || 
            data.action === 'heap_built' || data.action === 'heap_valid' || 
            data.action === 'after_swap' || data.action === 'update_largest') {
            if (data.heapifyIdx >= 0) {
                const box = wrappers[data.heapifyIdx]?.querySelector('.array-box');
                if (box) {
                    box.classList.add('lifted');
                    await sleep(speed * 0.4);
                    box.classList.remove('lifted');
                    await sleep(speed * 0.2);
                }
            } else {
                await sleep(speed * 0.3);
            }
        } else if (data.action === 'compare_left' || data.action === 'compare_right') {
            const heapBox = wrappers[data.heapifyIdx]?.querySelector('.array-box');
            const compareBox = wrappers[data.compareIdx]?.querySelector('.array-box');

            if (heapBox) heapBox.classList.add('lifted');
            if (compareBox) compareBox.classList.add('lifted');

            await sleep(speed * 0.4);

            if (heapBox) heapBox.classList.remove('lifted');
            if (compareBox) compareBox.classList.remove('lifted');

            await sleep(speed * 0.2);
        } else if (data.action === 'swap_heapify' || data.action === 'extract_max' || data.action === 'swap_complete') {
            const idx1 = data.heapifyIdx;
            const idx2 = data.swapIdx;

            if (idx1 === undefined || idx2 === undefined) {
                isAnimating = false;
                updateButtons();
                return;
            }

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