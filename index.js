import * as sort from "./sort.js";
import * as search from "./search.js";
import * as graphAlgos from "./graphAlgos.js";
import { paintFreshArray, resizeArray, randomArray, MIN_ANIM_SPEED } from "./array.js";
import { paintFreshGraph, drawEdgeWeights, drawMinDistancesTable, removeMinDistancesTable } from "./graph.js";

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

var selected = "Bubble Sort";



// load actions
document.addEventListener("DOMContentLoaded", () => {
    paintFreshArray();
    bindControlPanelInputs();
    bindSubmenuButtons();
});

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
    disableSearchInput()
    if (selected === "Binary Search") reset = await search.doBinarySearch(target);
    if (selected === "Ternary Search") reset = await search.doTernarySearch(target);
    if (reset) paintFreshArray();
    resetControlsPostRun();
    enableSearchInput()
    setRunningStatus("no");
}

const doGraph = async function() {
    let reset;
    setRunningStatus("yes");
    alterControlsForRun();
    paintFreshGraph();
    if (selected === "DFS") reset = await graphAlgos.doDFS();
    if (selected === "BFS") reset = await graphAlgos.doBFS();
    if (selected === "Dijsktra") reset = await graphAlgos.doDijsktra();
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
    if (selected in GRAPH_ALGOS) getResetButton().removeEventListener("click", paintFreshGraph);
    else getResetButton().removeEventListener("click", paintFreshArray);
    getResetButton().addEventListener("click", stopRun);
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
    getResetButton().removeEventListener("click", stopRun);
    if (selected in GRAPH_ALGOS) getResetButton().addEventListener("click", paintFreshGraph);
    else getResetButton().addEventListener("click", paintFreshArray);
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

const updateSelectedAdjustDisplay = function(e) {
    let prevSelected = selected;
    selected = e.target.innerText;
    if (selected === prevSelected) return;
    
    toggleSearchTargetCard(true);
    toggleSearchTargetLabel(true);
    toggleRandomInput(false);
    toggleRandomInputLabel(true);
    if (selected in GRAPH_ALGOS && !(prevAlgoWasGraph())) {
        toggleVisualizer();
        getResetButton().removeEventListener("click", paintFreshArray);
        getResetButton().addEventListener("click", paintFreshGraph);
    }
    else if (!(selected in GRAPH_ALGOS) && prevAlgoWasGraph()) {
        toggleVisualizer();
        getResetButton().removeEventListener("click", paintFreshGraph);
        getResetButton().addEventListener("click", paintFreshArray);
    }
    if (selected in SORT_ALGOS && !(prevSelected in SORT_ALGOS)) paintFreshArray();
    if (selected in SEARCH_ALGOS) {
        toggleSearchTargetCard(false);
        if (!(prevSelected in SEARCH_ALGOS)) paintFreshArray();
    }
    if (selected in GRAPH_ALGOS) {
        paintFreshGraph();
        if (selected === "Dijsktra") {
            drawEdgeWeights();
            drawMinDistancesTable();
            toggleRandomInputLabel(false);
            toggleSearchTargetCard(false);
            toggleSearchTargetLabel(false);
        }
        else {
            removeMinDistancesTable();
            toggleRandomInput(true);
        }
    }
    getSelectedAlgoHeader().innerText = "Algorithm: " + selected;
    getPlayButton().value = selected in GRAPH_ALGOS ? "Run" : getSelectedType();
}

const toggleSearchTargetLabel = (target) => getSearchTargetLabel().innerText = target ? "Search Target:" : "Start Node:";

const toggleRandomInputLabel = (input) => getRandomButton().value = input ? "Random Input" : "Random Weight";

const toggleRandomInput = (erase) => getRandomButton().style.display = erase ? "none" : "inline-block";

const toggleVisualizer = function() {
    let showGraph = selected in GRAPH_ALGOS;
    getArrayViz().style.display = showGraph ? "none" : "block";
    getGraphViz().style.display = showGraph ? "flex" : "none";
}

export const getSelectedType = () => {
    if (selected in SORT_ALGOS) return "Sort";
    return selected in SEARCH_ALGOS ? "Search" : "Graph";
}
export const reset = () => getRunningStatus() === "no";
export const getCurrentSpeed = () => (MIN_ANIM_SPEED / getSpeedSliderValue()) * 1000;
export const getSizeSliderValue = () => Number(getSizeSlider().value);
export const getSpeedSliderValue = () => Number(document.getElementById("speed-slider").value);
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
const getArrayViz = () => document.getElementById("array-visualizer");
const getGraphViz = () => document.getElementById("graph-visualizer");
