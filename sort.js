import { SORTED_COLOR, SELECT_COLOR, array, paintBar, instantPaintBar, unpaintBar, swapBars, instantPaintSortedBar, doSortedAnimation } from "./array.js";
import { reset } from "./index.js";

export const doBubbleSort = async function() {
    let sorted;
    for (let i = array.length - 1; i > 0; i--) {
        sorted = true;
        for (let j = 1; j <= i; j++) {
            await paintBar(j - 1, SELECT_COLOR, true);
            if (reset()) return true;
            if (array[j - 1] > array[j]) {
                sorted = false;
                await swapBars(j - 1, j);
                if (reset()) return true;
            }
        }
        instantPaintSortedBar(i);
        if (sorted) break;
    } 
    await doSortedAnimation();
    return false;
}

export const doInsertionSort = async function() {
    let i, j;
    instantPaintSortedBar(0); // subarray of length 1 is sorted
    for (i = 1; i < array.length; i++) {
        await paintBar(i, SELECT_COLOR, false);
        if (reset()) return true;
        for (j = i; j > 0; j--) {
            if (array[j - 1] <= array[j]) break;
            await swapBars(j - 1, j, true, true);
            if (reset()) return true;
            await paintBar(j - 1, SELECT_COLOR);
            if (reset()) return true;
        }
        await paintBar(j, SORTED_COLOR);
        if (reset()) return true;
    }

    await doSortedAnimation();
    return false;
}

export const doSelectionSort = async function() {
    let k;
    for (let i = array.length - 1; i > 0; i--) {
        k = 0;
        await paintBar(k, "yellow");
        if (reset()) return true;

        for (let j = 1; j < i + 1; j++) {
            await paintBar(j, SELECT_COLOR);
            if (reset()) return true;
            if (array[j] > array[k]) {
                unpaintBar(k);
                await paintBar(j, "yellow");
                if (reset()) return true;
                k = j;
            }
            else unpaintBar(j);
        }

        if (k !== i) {
            await swapBars(k, i, true, true);
            if (reset()) return true;
        }
        await paintBar(i, SORTED_COLOR);
        if (reset()) return true;
    }

    await paintBar(0, SORTED_COLOR);
    if (reset()) return true;
    await doSortedAnimation();
    return false;
}

export const doQuickSort = async function() {
    let r = await quicksort(0, array.length - 1);
    if (!r) await doSortedAnimation();
    return r;
}

export const doHeapSort = async function() {
    let r = await maxHeapify(array);
    if (r) return true;

    for (let i = array.length - 1; i > 0; i--) {
        r = await sortBarByHeapRemove(i);
        if (r) return true;
    }
    r = await paintBar(0, SORTED_COLOR);
    if (!r) await doSortedAnimation();
    return r;
}

export const doMergeSort = async function() {

}

const sortBarByHeapRemove = async function(heapEnd) {
    await swapBars(0, heapEnd, true, true);
    if (reset()) return true;
    await paintBar(heapEnd, SORTED_COLOR);
    if (reset()) return true;
    let r = await siftDown(array, 0, heapEnd - 1);
    return r;
}

const maxHeapify = async function(array) {
    let lastParentIdx = Math.floor((array.length - 2) / 2);
    let r;
    for (let i = array.length - 1; i >= 0; i--) { 
        if (i > lastParentIdx) r = await paintBar(i, "blue");
        else r = await siftDown(array, i, array.length - 1);
        if (r) return true;
    }
    return false;
}

const siftDown = async function(array, parentIdx, lastChildIdx) {
    let leftChildIdx, leftChild;
    let rightChildIdx, rightChild;
    let parent;
    if (reset()) return true;
    await paintBar(parentIdx, SELECT_COLOR);
    while (2 * parentIdx + 1 <= lastChildIdx) {
        leftChildIdx = 2 * parentIdx + 1;
        rightChildIdx = leftChildIdx < lastChildIdx ? leftChildIdx + 1 : null;
        leftChild = array[leftChildIdx], parent = array[parentIdx];
        if (reset()) return true;
        if (rightChildIdx !== null) {
            rightChild = array[rightChildIdx];
            if (leftChild > rightChild && leftChild > parent) {
                await swapBars(leftChildIdx, parentIdx, true, true);
                if (reset()) return true;
                parentIdx = leftChildIdx;
                await paintBar(parentIdx, SELECT_COLOR);
                if (reset()) return true;
                continue;
            }
            else if (rightChild > parent) {
                await swapBars(rightChildIdx, parentIdx, true, true);
                if (reset()) return true;
                parentIdx = rightChildIdx;
                await paintBar(parentIdx, SELECT_COLOR);
                if (reset()) return true;
                continue;
            }
        }
        else if (leftChild > parent) {
            await swapBars(leftChildIdx, parentIdx, true, true);
            if (reset()) return true;
            parentIdx = leftChildIdx;
        }

        break;
    }
    let r = await paintBar(parentIdx, "blue");
    return r;
}

const quicksort = async function(start, end) {
    if (start >= end) {
        if (start === end) await paintBar(start, SORTED_COLOR);
        return reset();
    }
    let pivotIdx = start, pivot = array[start];
    let i = start + 1, j = end;

    await paintBar(pivotIdx, "orange"); // paint pivot
    instantPaintBar(i); // paint i and j "simultaneously" in one animation
    await paintBar(j, SELECT_COLOR);
    if (reset()) return true;

    while (i <= j) {
        if (array[i] > pivot && array[j] <= pivot) {
            await swapBars(i, j, true, true);
            if (reset()) return true;
            i++;
            j--;
            unpaintBar(i - 1);
            unpaintBar(j + 1);
            if (i <= j) await paintBar(i, SELECT_COLOR);
            if (reset()) return true;
            await paintBar(j, SELECT_COLOR);
            if (reset()) return true;
        }
        else if (array[i] <= pivot && array[j] > pivot) {
            i++;
            j--;
            unpaintBar(i - 1);
            unpaintBar(j + 1);
            if (i <= j) await paintBar(i, SELECT_COLOR);
            if (reset()) return true;
            await paintBar(j, SELECT_COLOR);
            if (reset()) return true;
        }
        else if (array[i] <= pivot) {
            unpaintBar(i);
            if (reset()) return true;
            i++;
            if (i <= j) await paintBar(i, SELECT_COLOR);
        }
        else if (array[j] > pivot) {
            unpaintBar(j);
            if (reset()) return true;
            j--;
            await paintBar(j, SELECT_COLOR);
            if (reset()) return true;
        }
    }

    if (j !== pivotIdx) {
        await paintBar(j, "orange"); // highlight bar in pivot posn
        if (reset()) return true;
        await swapBars(pivotIdx, j); // swap bars
        if (reset()) return true;
    }
    instantPaintSortedBar(j);

    if (await quicksort(start, j - 1)) return true;
    if (await quicksort(j + 1, end)) return true;
    return false;
}