function enhanceSectionSelects() {
    const selects = document.getElementsByClassName("section-select");
    for (var i = selects.length - 1; i >= 0; i--) {
        enhanceSectionSelect(selects[i]);
    }
}

/**
 * 
 * @param {HTMLElement} sectionSelectParentElem 
 */
function enhanceSectionSelect(sectionSelectParentElem) {
    if(sectionSelectParentElem.childElementCount == 2) enhanceMinuteSelect(sectionSelectParentElem);
    else enhanceSeasonEpisodeSelect(sectionSelectParentElem);
}

/**
 * 
 * @param {HTMLElement} sectionSelectParentElem 
 */
function enhanceMinuteSelect(sectionSelectParentElem) {
    
}

/**
 * 
 * @param {HTMLElement} sectionSelectParentElem 
 */
function enhanceSeasonEpisodeSelect(sectionSelectParentElem) {
    const inputs = sectionSelectParentElem.getElementsByTagName("input");
    
    const seasonInput = inputs[0];
    const episodeInput = inputs[1];
    seasonInput.addEventListener("change", function() {
       const season = cache.tmdb.seasons.find(x=>x.season_number == seasonInput.value);
       updateMax(episodeInput, season.episode_count);
    });
    
    seasonInput.addEventListener("keyup", function () {
        const season = cache.tmdb.seasons.find(x => x.season_number == seasonInput.value);
        updateMax(episodeInput, season.episode_count);
    });
}

function updateMax(input, newMax) {
    input.max = newMax;
    
    const maxDisplay = input.nextElementSibling;
    if (maxDisplay && maxDisplay.classList.contains("outof")) {
        maxDisplay.textContent = "/" + newMax;
    }
    
    checkMinMax(input);
}

function enhanceInputs() {
    const inputs = document.getElementsByClassName("big-number-input");
    for (var i = inputs.length - 1; i >= 0; i--) {
        enhanceInput(inputs[i]);
    }
}

/**
 * 
 * @param {HTMLElement} inputParentElem 
 */
function enhanceInput(inputParentElem) {
    const inputElem = inputParentElem.querySelector("input");
    inputElem.addEventListener("wheel", function (e) {
        inputElem.value -= (+inputElem.step || 1) * (e.deltaY > 0 ? -1 : 1);
        

        checkMinMax(inputElem);
        inputElem.dispatchEvent(new Event("change"));
    });

    let touchStartX = 0, touchStartY = 0, valueStart = +inputElem.value;

    inputElem.addEventListener("touchstart", function (e) {
        touchStartX = e.touches.item(0).clientX;
        touchStartY = e.touches.item(0).clientY;
        valueStart = +inputElem.value;
    })

    inputElem.addEventListener("touchmove", function (e) {
        e.preventDefault();
        
        const pixelPerMovement = inputElem.clientHeight;
        
        const touch = e.touches.item(0);
        const deltaX = (touch.clientX - touchStartX) / pixelPerMovement;
        const deltaY = -(touch.clientY - touchStartY) / pixelPerMovement;
        
        const delta = Math.round(deltaX + deltaY);
        
        inputElem.value = valueStart + delta;
        
        checkMinMax(inputElem);
        inputElem.dispatchEvent(new Event("change"));
    });
}

function checkMinMax(inputElem) {
    if (inputElem.valueAsNumber < inputElem.min) inputElem.value = inputElem.min;
    if (inputElem.valueAsNumber > inputElem.max) inputElem.value = inputElem.max;
}