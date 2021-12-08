import { array, paintBar, unpaintBar, swapBars, instantPaintSortedBar, doSortedAnimation } from "./array.js";
import { reset } from "./index.js";

const SELECT_COLOR = "grey";

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

}

export const doSelectionSort = async function() {

}

export const doQuickSort = async function() {
     
}

export const doHeapSort = async function() {

}

export const doMergeSort = async function() {

}
