import * as sort from "./sort.js";
import * as search from "./search.js";
import * as graphAlgos from "./graphAlgos.js";
import { paintFreshArray, resizeArray, randomArray, MIN_ANIM_SPEED } from "./array.js";
import { paintFreshGraph } from "./graph.js";

const SORT_ALGOS = {"Bubble Sort":true,
                    "Insertion Sort":true,
                    "Selection Sort":true,
                    "Quick Sort":true,
                    "Heap Sort":true,
                    "Merge Sort":true};
const SEARCH_ALGOS = {"Binary Search":true,
                      "Ternary Search":true};
const GRAPH_ALGOS = {"DFS": true,
                     "BFS":true,
                     "Dijsktra":true,
                     "Top Sort":true};

export var selected = "Bubble Sort";

// load actions
document.addEventListener("DOMContentLoaded", () => {
    paintFreshArray();
    bindControlPanelInputs();
    bindSubmenuButtons();
});

export const getSelectedType = () => {
    if (selected in SORT_ALGOS) return "Sort";
    return selected in SEARCH_ALGOS ? "Search" : "Graph";
}

export const reset = () => getRunningStatus() === "no";
export const getCurrentSpeed = () => (MIN_ANIM_SPEED / getSpeedSliderValue()) * 1000;
export const getSizeSliderValue = () => Number(getSizeSlider().value);
export const getSpeedSliderValue = () => Number(document.getElementById("speed-slider").value);
export const getArrayViz = () => document.getElementById("array-visualizer");
export const getGraphViz = () => document.getElementById("graph-visualizer");
export const getStartNode = () => getSearchTargetInput().value;

const bindControlPanelInputs = function() {
    getSizeSlider().addEventListener("mouseup", resizeArray);
    getRandomButton().addEventListener("click", randomArray);
    getPlayButton().addEventListener("click", runAlgorithm);
    getResetButton().addEventListener("click", paintFreshArray);
}

const runAlgorithm = async function() {
    if (algoRunning()) return;

    let algoType = getSelectedType();
    if (algoType === "Sort") await doSort();
    else if (algoType === "Search") await doSearch();
    else if (algoType === "Graph") await doGraph();
}

const doSort = async function() {
    let reset;
    setRunningStatus("yes");
    alterControlsForRun();
    if (selected === "Bubble Sort") reset = await sort.doBubbleSort();
    if (selected === "Insertion Sort") reset = await sort.doInsertionSort();
    if (selected === "Selection Sort") reset = await sort.doSelectionSort();
    if (selected === "Quick Sort") reset = await sort.doQuickSort();
    if (selected === "Heap Sort") reset = await sort.doHeapSort();
    if (selected === "Merge Sort") reset = await sort.doMergeSort();
    if (reset) paintFreshArray();
    resetControlsPostRun();
    setRunningStatus("no");
}

const doSearch = async function() {
    let reset;
    let target = getSearchTargetInput().value;
    if (!validSearchTarget(target)) {
        alert("Please enter a number to search for in the array!");
        return;
    }
    target = Number(target);
    setRunningStatus("yes");
    alterControlsForRun();
    if (selected === "Binary Search") reset = await search.doBinarySearch(target);
    if (selected === "Ternary Search") reset = await search.doTernarySearch(target);
    if (reset) paintFreshArray();
    resetControlsPostRun();
    setRunningStatus("no");
}

const doGraph = async function() {
    let reset;
    setRunningStatus("yes");
    alterControlsForRun();
    if (selected === "DFS") reset = await graphAlgos.doDFS();
    if (selected === "BFS") reset = await graphAlgos.doBFS();
    if (selected === "Dijsktra") reset = await graphAlgos.doDijsktra();
    if (selected === "Top Sort") reset = await graphAlgos.doTopSort();
    if (reset) paintFreshGraph();
    resetControlsPostRun();
    setRunningStatus("no");
}

const disableSearchInput = function() {
    getSearchTargetLabel().style.color = "grey";
    getSearchTargetInput().backgroundColor = "grey";
    getSearchTargetInput().disabled = true;
}

const enableSearchInput = function() {
    getSearchTargetLabel().style.color = "white";
    getSearchTargetInput().backgroundColor = "white";
    getSearchTargetInput().disabled = false;
}

const alterControlsForRun = function() {
    getSizeSlider().disabled = true;
    getSizeSlider().style.cursor = "default";
    getSizeSliderLabel().style.color = "grey";
    getRandomButton().style.backgroundColor = "grey";
    getRandomButton().disabled = true;
    getRandomButton().style.cursor = "default";
    getPlayButton().style.backgroundColor = "grey";
    getPlayButton().disabled = true;
    getPlayButton().style.cursor = "default";
    updateResetEventListenerForRun(true);
    if (selected in SEARCH_ALGOS || selected === "Dijsktra") disableSearchInput(); 
    unbindSubmenuButtons();
}

const resetControlsPostRun = function() {
    getSizeSlider().disabled = false;
    getSizeSlider().style.cursor = "pointer";
    getSizeSliderLabel().style.color = "#f6f7f8";
    getRandomButton().style.backgroundColor = "#254441";
    getRandomButton().removeAttribute("style");
    getRandomButton().disabled = false;
    getPlayButton().style = "";
    getPlayButton().disabled = false;
    updateResetEventListenerForRun(false);
    if (selected in SEARCH_ALGOS || selected === "Dijsktra") enableSearchInput(); 
    bindSubmenuButtons();
}

const unbindSubmenuButtons = function() {
    let sortingSubmenu = getSubmenu("sort");
    let anchor;
    for (let i = 0; i < sortingSubmenu.children.length; i++) {
        anchor = sortingSubmenu.children[i].firstElementChild;
        anchor.removeEventListener("click", updateSelectedAdjustDisplay);
    }
    let searchingSubmenu = getSubmenu("search");
    for (let i = 0; i < searchingSubmenu.children.length; i++) {
        anchor = searchingSubmenu.children[i].firstElementChild;
        anchor.removeEventListener("click", updateSelectedAdjustDisplay);
    }
    let graphSubmenu = getSubmenu("graph");
    for (let i = 0; i < graphSubmenu.children.length; i++) {
        anchor = graphSubmenu.children[i].firstElementChild;
        anchor.removeEventListener("click", updateSelectedAdjustDisplay);
    }
}

const bindSubmenuButtons = function() {
    let sortingSubmenu = getSubmenu("sort");
    let anchor;
    for (let i = 0; i < sortingSubmenu.children.length; i++) {
        anchor = sortingSubmenu.children[i].firstElementChild;
        anchor.addEventListener("click", updateSelectedAdjustDisplay);    
    }
    let searchingSubmenu = getSubmenu("search");
    for (let i = 0; i < searchingSubmenu.children.length; i++) {
        anchor = searchingSubmenu.children[i].firstElementChild;
        anchor.addEventListener("click", updateSelectedAdjustDisplay);     
    }
    let graphSubmenu = getSubmenu("graph");
    for (let i = 0; i < graphSubmenu.children.length; i++) {
        anchor = graphSubmenu.children[i].firstElementChild;
        anchor.addEventListener("click", updateSelectedAdjustDisplay);
    }
}

const updateResetEventListenerForRun = function(preRun) {
    let oldHandler, newHandler;
    if (selected in GRAPH_ALGOS) {
        oldHandler = preRun ? paintFreshGraph : stopRun;
        newHandler = preRun ? stopRun : paintFreshGraph;
    }
    else {
        oldHandler = preRun ? paintFreshArray : stopRun;
        newHandler = preRun ? stopRun : paintFreshArray;
    }
    getResetButton().removeEventListener("click", oldHandler);
    getResetButton().addEventListener("click", newHandler);
}

const updateResetEventListenerNewDisplay = function() {
    let oldHandler, newHandler;
    oldHandler = selected in GRAPH_ALGOS ? paintFreshArray : paintFreshGraph;
    newHandler = selected in GRAPH_ALGOS ? paintFreshGraph : paintFreshArray;
    getResetButton().removeEventListener("click", oldHandler);
    getResetButton().addEventListener("click", newHandler);
}

const updateRandomEventListener = function() {
    let oldHandler, newHandler;
    oldHandler = selected in GRAPH_ALGOS ? randomArray : paintFreshGraph;
    newHandler = selected in GRAPH_ALGOS ? paintFreshGraph : randomArray;
    getRandomButton().removeEventListener("click", oldHandler);
    getRandomButton().addEventListener("click", newHandler);
}

const updateSizeEventListener = function() {
    let oldHandler, newHandler;
    oldHandler = selected in GRAPH_ALGOS ? resizeArray : paintFreshGraph;
    newHandler = selected in GRAPH_ALGOS ? paintFreshGraph : resizeArray;
    getSizeSlider().removeEventListener("click", oldHandler);
    getSizeSlider().addEventListener("click", newHandler);
}

const updateSelectedAdjustDisplay = function(e) {
    // calibrates event listeners and visibility of display inputs 
    let prevSelected = selected;
    selected = e.target.innerText;
    if (selected === prevSelected) return;
    
    // set display to default
    toggleSearchTargetCard(true); // default no target input
    toggleSearchTargetLabel(true); // default label for target is "search target: "
    toggleRandomInput(true); // default dont show random input
    toggleRandomInputLabel(true); // default label for random input is "random input"
    getSelectedAlgoHeader().innerText = "Algorithm: " + selected; // always update sel header
    getPlayButton().value = selected in GRAPH_ALGOS ? "Run" : getSelectedType(); // always update run button 

    if (selected in SORT_ALGOS) adjustDisplayForSort(prevSelected in SEARCH_ALGOS);
    if (selected in SEARCH_ALGOS) adjustDisplayForSearch();
    if (selected in GRAPH_ALGOS) adjustDisplayForGraph();
}

const adjustDisplayForGraph = function() {
    if ((!prevAlgoWasGraph())) {
        toggleVisualizer();
        updateSizeEventListener();
        updateResetEventListenerNewDisplay();
        updateRandomEventListener();
    }
    if (selected === "Dijsktra") {
        toggleRandomInput(false);
        toggleRandomInputLabel(false);

    }
    paintFreshGraph();
}

const adjustDisplayForSort = function(needRandom) {
    if (prevAlgoWasGraph()) {
        toggleVisualizer();
        updateSizeEventListener()
        updateResetEventListenerNewDisplay();
        updateRandomEventListener();
    }
    if (needRandom) randomArray();
    else paintFreshArray();
    toggleRandomInput(false);
}

const adjustDisplayForSearch = function() {
    if (prevAlgoWasGraph()) {
        toggleVisualizer();
        updateSizeEventListener();
        updateResetEventListenerNewDisplay();
        updateRandomEventListener();
    }
    paintFreshArray();
    toggleRandomInput(false);
    toggleSearchTargetCard(false);
}

const toggleVisualizer = function() {
    let showGraph = selected in GRAPH_ALGOS;
    getArrayViz().style.display = showGraph ? "none" : "block";
    getGraphViz().style.display = showGraph ? "flex" : "none";
}

const toggleSearchTargetCard = (erase) => erase ? getSearchTargetCard().style.display = "none" : getSearchTargetCard().style.display = "block";
const algoRunning = () => getRunningStatus() === "yes";
const stopRun = () => setRunningStatus("no");
const prevAlgoWasGraph = () => document.getElementById("array-visualizer").style.display === "none";
const getSizeSlider = () => document.getElementById("size-slider");
const getRandomButton = () => document.getElementById("random-input-button");
const getPlayButton = () => document.getElementById("play-button");
const getResetButton = () => document.getElementById("reset-button");
const getRunningStatus = () =>  document.getElementById("running").innerText;
const setRunningStatus = (status) => document.getElementById("running").innerText = status;
const getSearchTargetLabel = () => document.getElementById("search-target-label");
const getSearchTargetInput = () => document.getElementById("search-target");
const getSearchTargetCard = () => document.getElementById("search-target-card");
const getSizeSliderLabel = () => document.getElementById("size-slider-label"); 
const getSubmenu = (type) => document.getElementById(`${type}ing-submenu`);
const getSelectedAlgoHeader = () => document.getElementById("selected-algo");
const validSearchTarget = (target) => target.match(/^\d+$/) !== null;
const toggleSearchTargetLabel = (target) => getSearchTargetLabel().innerText = target ? "Search Target:" : "Start Node:";
const toggleRandomInputLabel = (input) => getRandomButton().value = input ? "Random Input" : "Random Weight";
const toggleRandomInput = (erase) => getRandomButton().style.display = erase ? "none" : "inline-block";
