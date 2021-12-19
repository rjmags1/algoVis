import * as sort from "./sort.js";
import * as search from "./search.js";
import { paintFreshArray, resizeArray, randomArray } from "./array.js";

// globals
var selected = "Bubble Sort";
var selectedType = "Sort";


// load actions
document.addEventListener("DOMContentLoaded", () => {
    paintFreshArray();
    bindControlPanelInputs();
    bindSubmenuButtons();
});

const bindControlPanelInputs = function() {
    document.getElementById("size-slider").addEventListener("mouseup", resizeArray);
    document.getElementById("random-input-button").addEventListener("click", randomArray);
    document.getElementById("play-button").addEventListener("click", runAlgorithm);
    document.getElementById("reset-button").addEventListener("click", paintFreshArray);
}

const runAlgorithm = async function() {
    if (algoRunning()) return;

    let algoType = document.getElementById("play-button").value;
    if (algoType === "Sort") await doSort();
    else if (algoType === "Search") await doSearch();
    else if (algoType === "Run Graph") await doGraph();
}

const doSort = async function() {
    let reset;
    document.getElementById("running").innerHTML = "yes";
    alterControlsForRun();
    if (selected === "Bubble Sort") reset = await sort.doBubbleSort();
    if (selected === "Insertion Sort") reset = await sort.doInsertionSort();
    if (selected === "Selection Sort") reset = await sort.doSelectionSort();
    if (selected === "Quick Sort") reset = await sort.doQuickSort();
    if (selected === "Heap Sort") reset = await sort.doHeapSort();
    if (selected === "Merge Sort") reset = await sort.doMergeSort();
    if (reset) paintFreshArray();
    resetControls();
    document.getElementById("running").innerHTML = "no";
}

const doSearch = async function() {
    let reset;
    let target = document.getElementById("search-target").value;
    if (target.match(/^\d+$/) === null) { // alert about not entering a number and return
        alert("Please enter a number to search for in the array!");
        return;
    }

    target = Number(target);
    document.getElementById("running").innerHTML = "yes";
    alterControlsForRun();
    disableSearchInput()
    if (selected === "Binary Search") reset = await search.doBinarySearch(target);
    if (selected === "Ternary Search") reset = await search.doTernarySearch(target);
    if (reset) paintFreshArray();
    resetControls();
    enableSearchInput()
    document.getElementById("running").innerHTML = "no";
}

const doGraph = async function() {
    //
}

const disableSearchInput = function() {
    let label = document.getElementById("search-target-label");
    let input = document.getElementById("search-target");
    label.style.color = "grey";
    input.backgroundColor = "grey";
    input.disabled = true;
}

const enableSearchInput = function() {
    let label = document.getElementById("search-target-label");
    let input = document.getElementById("search-target");
    label.style.color = "white";
    input.backgroundColor = "white";
    input.disabled = false;
}

const alterControlsForRun = function() {
    document.getElementById("size-slider").disabled = true;
    document.getElementById("size-slider").style.cursor = "default";
    document.getElementById("size-slider-label").style.color = "grey";
    document.getElementById("random-input-button").style.backgroundColor = "grey";
    document.getElementById("random-input-button").disabled = true;
    document.getElementById("random-input-button").style.cursor = "default";
    document.getElementById("play-button").style.backgroundColor = "grey";
    document.getElementById("play-button").disabled = true;
    document.getElementById("play-button").style.cursor = "default";
    document.getElementById("reset-button").removeEventListener("click", paintFreshArray);
    document.getElementById("reset-button").addEventListener("click", stopRun);
    unbindSubmenuButtons();
}

const resetControls = function() {
    document.getElementById("size-slider").disabled = false;
    document.getElementById("size-slider").style.cursor = "pointer";
    document.getElementById("size-slider-label").style.color = "#f6f7f8";
    document.getElementById("random-input-button").style.backgroundColor = "#254441";
    document.getElementById("random-input-button").removeAttribute("style");
    document.getElementById("random-input-button").disabled = false;
    document.getElementById("play-button").style = "";
    document.getElementById("play-button").disabled = false;
    document.getElementById("reset-button").removeEventListener("click", stopRun);
    document.getElementById("reset-button").addEventListener("click", paintFreshArray);
    bindSubmenuButtons();
}

const unbindSubmenuButtons = function() {
    let sortingSubmenu = document.getElementById("sorting-submenu");
    let anchor;
    for (let i = 0; i < sortingSubmenu.children.length; i++) {
        anchor = sortingSubmenu.children[i].firstElementChild;
        anchor.removeEventListener("click", updateSelectedAlgo);
    }
    let searchingSubmenu = document.getElementById("searching-submenu")
    for (let i = 0; i < searchingSubmenu.children.length; i++) {
        anchor = searchingSubmenu.children[i].firstElementChild;
        anchor.removeEventListener("click", updateSelectedAlgo);
    }
    let graphSubmenu = document.getElementById("graphing-submenu");
    for (let i = 0; i < graphSubmenu.children.length; i++) {
        anchor = graphSubmenu.children[i].firstElementChild;
        anchor.removeEventListener("click", updateSelectedAlgo);
    }
}

const bindSubmenuButtons = function() {
    let sortingSubmenu = document.getElementById("sorting-submenu");
    let anchor;
    for (let i = 0; i < sortingSubmenu.children.length; i++) {
        anchor = sortingSubmenu.children[i].firstElementChild;
        anchor.addEventListener("click", updateSelectedAlgo);    
    }
    let searchingSubmenu = document.getElementById("searching-submenu")
    for (let i = 0; i < searchingSubmenu.children.length; i++) {
        anchor = searchingSubmenu.children[i].firstElementChild;
        anchor.addEventListener("click", updateSelectedAlgo);     
    }
    let graphSubmenu = document.getElementById("graphing-submenu");
    for (let i = 0; i < graphSubmenu.children.length; i++) {
        anchor = graphSubmenu.children[i].firstElementChild;
        anchor.addEventListener("click", updateSelectedAlgo);
    }
}

const updateSelectedAlgo = function(e) {
    selected = e.target.innerHTML;

    let searchTargetCard = document.getElementById("search-target-card")
    if (selected.search("Search") > -1) searchTargetCard.style.display = "inline-block";
    else searchTargetCard.style.display = "none";

    document.getElementById("selected-algo").innerHTML = "Algorithm: " + selected;
    selectedType = "Graph";
    if (selected in {"Bubble Sort":true, "Insertion Sort":true, "Selection Sort":true, "Quick Sort":true, "Heap Sort":true, "Merge Sort":true}) selectedType = "Sort";
    else if (selected in {"Binary Search":true, "Ternary Search":true}) selectedType = "Search";
    document.getElementById("play-button").value = selectedType;
}

// checks if algorithm is currently running
const algoRunning = () => document.getElementById("running").innerHTML === "yes";

// stop a a currently running algorithm
const stopRun = () => document.getElementById("running").innerHTML = "no";

export const reset = () => document.getElementById("running").innerHTML === "no";
