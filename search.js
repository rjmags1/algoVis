import { array, paintBar, instantPaintBar, sortForSearch, instantPaintSortedBar, foundTargetAnimation, SORTED_COLOR } from "./array.js";
import { reset } from "./index.js";

export const doBinarySearch = async function(target) {
    await sortForSearch();
    if (reset()) return true;
    for (let i = 0; i < array.length - 1; i++) {
        instantPaintBar(i, "blue");
    }
    await paintBar(array.length - 1, "blue");
    if (reset()) return true;

    let r = await binarySearch(0, array.length - 1, target);
    return r === true;
}

export const doTernarySearch = async function(target) {
}

const binarySearch = async function(start, end, target) {
    if (start > end) {
        alert("target not present in the array!");
        return -1
    }
    // highlight mid
    let r;
    let mid = Math.floor((start + end) / 2);
    await paintBar(mid, "red");
    if (reset()) return true;
    if (array[mid] === target) {
        await foundTargetAnimation(mid);
        return reset();
    }
    if (array[mid] > target) {
        for (let i = mid; i < end; i++) instantPaintSortedBar(i); // unpaint eliminated
        await paintBar(end, "purple");
        if (reset()) return true;
        r = await binarySearch(start, mid - 1, target);
    }
    else {
        for (let i = start; i < mid; i++) instantPaintSortedBar(i); // unpaint eliminated
        await paintBar(mid, "purple");
        if (reset()) return true;
        r = await binarySearch(mid + 1, end, target);
    }
    return r;
}
