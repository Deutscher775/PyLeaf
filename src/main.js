window.onload = async function () {
    syncStorage()
    ol_load()
    console.log(document.cookie)

    /* Activate all elements after loading */
    await new Promise(r => setTimeout(r, 1000));
    document.getElementById("check-hd-on_off_switch").disabled = false
    document.getElementById("range-hd-brightness").disabled = false
    document.getElementById("popup-btn-retry").onclick = function () {ol_load()}
    document.getElementById("settings").onclick = async function () {
        location.assign("./settings.html")
    }
}

function syncStorage () {
    for (item of Object.keys(sessionStorage)) {
        localStorage.setItem(item, sessionStorage.getItem(item))
    }
}

function getPanelAddress() {
    return localStorage.getItem("panel.address")
}

async function available () { 
    try {
        const request = await fetch(`${getPanelAddress()}/get`)
        console.log(request.ok)
        return request.ok
    } catch (e) {
        console.log(e)
        return false
    }
    }

async function ol_load() {
    var _available = await available()
    console.log(_available)
    if (_available) {
        cancelPopup()
        getGreeting();
        getCurrentState();
        getBrightness();
        getCurrentScene();
        getScenes();
        document.getElementById("header-dashboard").onclick = function () {
            hdToggleOnOff();
        };
        document.getElementById("range-hd-brightness").oninput = function () {
            scenesSetBrightness(document.getElementById("range-hd-brightness").value);
        };
        return;
    } else {
        console.log("Error");
        raisePopup("Connection error", `Could not connect with the API (${getPanelAddress()}/get)`);
    } 
        
}

function raisePopup(title, description) {
    document.getElementById("app").style.display = "none"
    document.getElementById("popup-header").innerHTML = title
    document.getElementById("popup-description").innerHTML = description
    document.getElementById("popup-div").style.display = "flex"
}

function cancelPopup() {
    document.getElementById("popup-div").style.display = "none"
    document.getElementById("app").style.display = "initial"
}

async function oc_load () {
    const check_if_available = fetch(`${getPanelAddress()}/get`)
    if (!(await check_if_available).ok) {
        console.log("down")
    }
    await new Promise(r => setTimeout(r, 100));
    getGreeting()
    getCurrentState()
    getBrightness()
    getCurrentScene()
    await new Promise(r => setTimeout(r, 100));
    getScenes()
    document.getElementById("check-hd-on_off_switch").onchange = function () {hdToggleOnOff()}
    document.getElementById("range-hd-brightness").oninput = function () {
        scenesSetBrightness(document.getElementById("range-hd-brightness").value)}
    document.getElementById("sm-selector-item").onclick = function () {scenesSetScene(this.innerHTML)}
}

function set_greeting(greeting) {
    document.getElementById("hd-title").innerHTML = greeting
}

function set_current_brightness(min, max, current) {
    document.getElementById("range-hd-brightness").min = min
    document.getElementById("range-hd-brightness").max = max
    document.getElementById("range-hd-brightness").value = current
    document.getElementById("span-brightness").innerHTML = current
}

function set_scenes_option(scenceslist=Array) {
    document.getElementById("sm-selector").innerHTML = null
    for (scene of scenceslist) {
        var item = document.createElement("button")
        item.id = "sm-selector-item"
        item.innerHTML = scene
        item.addEventListener("click", function () {scenesSetScene(this.innerHTML)})
        document.getElementById("sm-selector").appendChild(item)
    }
}

async function set_current_scene(scene) {
    updateDashboardBorder()
    const respone = await fetch(`${getPanelAddress()}/get/effect/colortheme`, {method: "GET"})
    const respone_json = await respone.json()
    for (scene_card of document.getElementById("sm-selector").children) {
        if (scene_card.innerHTML == scene) {
            scene_card.style.fontWeight = "bold"
            scene_card.style.border = "4px solid transparent"
            scene_card.style.background = `
            linear-gradient(to bottom right, hsl(${respone_json[scene_card.innerHTML][0]["hue"]}, ${respone_json[scene_card.innerHTML][0]["saturation"]}%, 50%), 
            hsl(${respone_json[scene_card.innerHTML][1]["hue"]}, ${respone_json[scene_card.innerHTML][1]["saturation"]}%, 40%)) padding-box,
            linear-gradient(to bottom right, hsl(${respone_json[scene_card.innerHTML][0]["hue"]}, ${respone_json[scene_card.innerHTML][0]["saturation"]}%, 60%), 
            hsl(${respone_json[scene_card.innerHTML][1]["hue"]}, ${respone_json[scene_card.innerHTML][1]["saturation"]}%, 70%)) border-box`;
        } else {
            scene_card.style.background = "#1f1f1e"
            scene_card.style.border = "none"
            scene_card.style.fontWeight = "normal"
            scene_card.style.background = `
            linear-gradient(to bottom right, hsl(${respone_json[scene_card.innerHTML][0]["hue"]}, ${respone_json[scene_card.innerHTML][0]["saturation"]}%, 10%), 
            hsl(${respone_json[scene_card.innerHTML][1]["hue"]}, ${respone_json[scene_card.innerHTML][1]["saturation"]}%, 10%))`;
            
            }
        }
    }

async function updateDashboardBorder() {
    const scene = await beGetData().then(data => data.effects.current)
    const respone = await fetch(`${getPanelAddress()}/get/effect/colortheme`, {method: "GET"})
    const respone_json = await respone.json()
    document.getElementById("header-dashboard").style.border = "4px solid transparent"
    document.getElementById("header-dashboard").style.background = `
    linear-gradient(to bottom right, hsl(${respone_json[scene][0]["hue"]}, ${respone_json[scene][0]["saturation"]}%, 10%), 
    hsl(${respone_json[scene][1]["hue"]}, ${respone_json[scene][1]["saturation"]}%, 20%)) padding-box,
    linear-gradient(to bottom right, hsl(${respone_json[scene][0]["hue"]}, ${respone_json[scene][0]["saturation"]}%, 50%), 
    hsl(${respone_json[scene][1]["hue"]}, ${respone_json[scene][1]["saturation"]}%, 60%)) border-box`
}

function set_current_state(state) {
    document.getElementById("check-hd-on_off_switch").checked = state
    if (state == true) {
        updateDashboardBorder()
    } else {
        document.getElementById("header-dashboard").style.background = `linear-gradient(#292928, #292928) padding-box`
        }
    }

function beGetData() {
    return fetch(`${getPanelAddress()}/get`)
        .then(response => response.json());
}

function beGetGreeting() {
    const dt = new Date();
    const hours = dt.getHours();

    if (hours < 12) {
        return "morning";
    } else if (hours < 14) {
        return "noon";
    } else if (hours < 18) {
        return "afternoon";
    } else {
        return "evening"
    }
}

function beGetScenes() {
    return beGetData().then(data => data.effects.effectsList);
}

function beGetBrightness() {
    return beGetData().then(data => {
        const brightness = data.state.brightness;
        return [brightness.min, brightness.max, brightness.value];
    });
}

async function hdToggleOnOff() {
    beGetData().then(async data => {
        const state = data.state.on.value;
        const newState = !state;
        await fetch(`${getPanelAddress()}/power?state=${newState}`, { method: "POST" })
        .then(async response => {
            const response_json = await response.json()
            set_current_state(response_json["state"])
            document.getElementById("check-hd-on_off_switch").value = response_json["state"]
        })
    });
}

function getGreeting() {
    const g = beGetGreeting();
    set_greeting(`Good ${g}`)
}

function scenesSetScene(scene) {
    beGetData().then(data => {
        const currentScene = data.effects.current;
        if (scene && scene !== currentScene && scene.indexOf(beGetScenes())) {
            fetch(`${getPanelAddress()}/set?effect=${scene}`, { method: "POST" })
            .then(respone => {
                if (respone.ok) {
                    getCurrentScene()
                }
            })
        }
    });
}

function scenesSetBrightness(brightness) {
    beGetData().then(data => {
        const currentBrightness = data.state.brightness.value;
        if (brightness && brightness !== currentBrightness) {
            fetch(`${getPanelAddress()}/set?brightness=${brightness}`, { method: "POST" })
            .then(respone => {
                if (respone.ok) {
                    getBrightness()
                }
            })
        }
    });
}

function getBrightness() {
    beGetBrightness().then(b => {
        const [min, max, value] = b;
        set_current_brightness(min, max, value)
    });
}

function getScenes() {
    beGetScenes().then(scenes => {
        set_scenes_option(scenes)
    });
}

async function getCurrentScene() {
    await new Promise(r => setTimeout(r, 200));
    beGetData().then(data => {
        set_current_scene(data.effects.current)
    });
}

function getCurrentState() {
    beGetData().then(data => {
        set_current_state(data.state.on.value)
        document.getElementById("check-hd-on_off_switch").value = data.state.on.value
    });
}
