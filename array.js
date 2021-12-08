const MAX_ELEMENT = 99;
const MIN_ELEMENT = 1;
const MIN_ANIM_SPEED = 2;
const DEFAULT_COLOR = document.getElementById("title-header").style.backgroundColor;
const SORTED_COLOR = "purple";

// EXPORTS--------------------------------------------------------
export var array = [];
export var resetArray = [];

// add or remove elements from the array, doing any necessary DOM painting or removal
export const resizeArray = function() {
    let currentLength = array.length;
    let target = getSizeSliderValue();
    let cards = getBarCards();
    let newElem;
    while (currentLength !== target) {
        if (currentLength < target) {
            newElem = getRandomElement();
            array.push(newElem);
            resetArray.push(newElem);
            appendCard(createNewBarCard(newElem));
            currentLength++;
        }
        else {
            array.pop();
            resetArray.pop();
            cards[currentLength - 1].remove();
            currentLength--;
        }
    }
}

// reinitializes internal array and paints it to screen
export const randomArray = function() {
    array = [], resetArray = [];
    paintFreshArray();
}

// gets rid of array on screen if any prior to call, fills internal array and paints it
export const paintFreshArray = function() {
    if (array.length === 0) fillArray();
    removeOldBars();
    for (let i = 0; i < resetArray.length; i++) {
        array[i] = resetArray[i];
        appendCard(createNewBarCard(resetArray[i]));
    }
}

export const paintBar = async function(i, color, transient=false) {
    let bar = getBar(i);
    bar.style.transition = "background-color " + getCurrentSpeed() + "s step-start";
    return new Promise(resolve => {
        bar.style.backgroundColor = color;
        bar.addEventListener("transitionend", () => {
            bar.style.transition = "";
            if (transient) bar.style.backgroundColor = DEFAULT_COLOR;
            resolve();
        }, { once: true });
    })
}

export const swapBars = async function(i, j) {
    let first = getBar(i), second = getBar(j);
    let firstH = first.style.height, secondH = second.style.height;
    first.style.transition = "background-color " + getCurrentSpeed() + "s step-start";
    second.style.transition = "background-color " + getCurrentSpeed() + "s step-start";
    return new Promise(resolve => {
        first.style.backgroundColor = "red", second.style.backgroundColor = "red";
        second.addEventListener("transitionend", () => {
            first.style.transition = "", second.style.transition = "";
            first.style.backgroundColor = DEFAULT_COLOR, second.style.backgroundColor = DEFAULT_COLOR;
            first.style.height = secondH, second.style.height = firstH;
            getLabel(i).innerHTML = array[j], getLabel(j).innerHTML = array[i];
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            resolve();
        }, { once: true });
    })
}

export const unpaintBar = (i) => getBar(i).style.backgroundColor = DEFAULT_COLOR;

export const instantPaintSortedBar = (i) => getBar(i).style.backgroundColor = SORTED_COLOR;

export const doSortedAnimation = async function() {
    for (let i = 0; i < array.length; i++) {
        getBar(i).style.backgroundColor = "orange";
    }
    await new Promise(r => { setTimeout(() => r(), 500)});
    for (let i = 0; i < array.length; i++) {
        getBar(i).style.backgroundColor = SORTED_COLOR;
        await new Promise(r => { setTimeout(() => r(), 100); });
    }
}

// PRIVATE MODULE METHODS -----------------------------------------------------

// param size is an integer between in [1, 99]
const createNewBarCard = function(size) {
    let card = document.createElement("div");
    card.setAttribute("class", "bar-card");
    let bar = document.createElement("div");
    bar.style.height = String(size) + "%";
    bar.setAttribute("class", "bar");
    let label = document.createElement("p");
    label.innerHTML = String(size);
    card.appendChild(bar);
    card.appendChild(label);

    return card;
}

// fill internal array based on user size input
const fillArray = function() {
    let size = getSizeSliderValue();
    let elem;
    for (let i = 0; i < size; i++) {
        elem = getRandomElement();
        array.push(elem);
        resetArray.push(elem);
    }
}

const removeOldBars = function() {
    document.getElementById("bars-container").remove();
    let newBarsContainer = document.createElement("div");
    newBarsContainer.id = "bars-container";
    document.getElementById("array-visualizer").appendChild(newBarsContainer);
}

const appendCard = (card) => document.getElementById("bars-container").appendChild(card);

// getters
const getCurrentSpeed = () => String(MIN_ANIM_SPEED / getSpeedSliderValue());
const getSizeSliderValue = () => Number(document.getElementById("size-slider").value);
const getSpeedSliderValue = () => Number(document.getElementById("speed-slider").value);
const getRandomElement = () => Math.floor(Math.random() * (MAX_ELEMENT - MIN_ELEMENT + 1) + MIN_ELEMENT);
const getBarCards = () => document.getElementById("bars-container").children;
const getBar = (i) => getBarCards()[i].firstChild;
const getLabel = (i) => getBarCards()[i].children[1];
