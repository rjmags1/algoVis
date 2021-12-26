import { array, paintBar, instantPaintBar, instantPaintSortedBar, foundTargetAnimation, SORTED_COLOR } from "./array.js";
import { reset } from "./index.js";

export const doBinarySearch = async function(target) {
    if (reset()) return true;
    for (let i = 0; i < array.length - 1; i++)  instantPaintBar(i, "blue");
    await paintBar(array.length - 1, "blue");
    if (reset()) return true;

    let r = await binarySearch(0, array.length - 1, target);
    return r === true;
}

export const doTernarySearch = async function(target) {
    if (reset()) return true;
    for (let i = 0; i < array.length - 1; i++) instantPaintBar(i, "blue");
    await paintBar(array.length - 1, "blue");
    if (reset()) return true;

    let r = await ternarySearch(0, array.length - 1, target);
    return r === true;
}

const ternarySearch = async function(start, end, target) {
    if (start > end) {
        alert("target not present in the array!");
        return -1;
    }
    
    let r;
    let mid1 = start + Math.floor((end - start) / 3);
    let mid2 = end - Math.floor((end - start) / 3);
    instantPaintBar(mid1, "red");
    await paintBar(mid2, "red");
    if (reset()) return true;
    if (array[mid1] === target) {
        await foundTargetAnimation(mid1);
        return reset();
    }
    if (array[mid2] === target) {
        await foundTargetAnimation(mid2);
        return reset();
    }
    if (target < array[mid1]) {
        for (let i = mid1; i < end; i++) instantPaintSortedBar(i);
        await paintBar(end, "purple");
        if (reset()) return true;
        r = await ternarySearch(start, mid1 - 1, target);
    }
    else if ((array[mid1] < target) && (target < array[mid2])) {
        for (let i = start; i <= mid1; i++) instantPaintSortedBar(i);
        for (let i = mid2; i < end; i++) instantPaintSortedBar(i);
        await paintBar(end, "purple");
        if (reset()) return true;
        r = await ternarySearch(mid1 + 1, mid2 - 1, target);
    }
    else {
        for (let i = start; i < mid2; i++) instantPaintSortedBar(i);
        await paintBar(mid2, "purple");
        if (reset()) return true;
        r = await ternarySearch(mid2 + 1, end, target);
    }

    return r;
}

const binarySearch = async function(start, end, target) {
    if (start > end) {
        alert("target not present in the array!");
        return -1;
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
