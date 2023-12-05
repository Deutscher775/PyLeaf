window.onload = async function () {
    ol_load()
    document.onchange = function () {oc_load()}
    document.onclick = function () {oc_load()}

    /* Actuvate all elements after loading */
    await new Promise(r => setTimeout(r, 1000));
    document.getElementById("check-hd-on_off_switch").disabled = false
    document.getElementById("range-hd-brightness").disabled = false
    document.getElementById("sm-select").disabled = false
}


function ol_load () {
    getBrightness()
    getScenes()
    getCurrentScene()
    getCurrentState()
    getGreeting()
    document.getElementById("check-hd-on_off_switch").onchange = function () {hdToggleOnOff()}
    document.getElementById("range-hd-brightness").onchange = function () {scenesSetBrightness(document.getElementById("range-hd-brightness").value)}
    document.getElementById("range-hd-brightness").oninput = function () {scenesSetBrightness(document.getElementById("range-hd-brightness").value)}
    document.getElementById("sm-select").oninput = function () {scenesSetScene(document.getElementById("sm-select").value)}
    document.getElementById("sm-select").onchnage = function () {scenesSetScene(document.getElementById("sm-select").value)}
}


async function oc_load () {
    await new Promise(r => setTimeout(r, 100));
    getBrightness()
    getScenes()
    getCurrentScene()
    getCurrentState()
    getGreeting()
    document.getElementById("check-hd-on_off_switch").onchange = function () {hdToggleOnOff()}
    document.getElementById("range-hd-brightness").onchange = function () {scenesSetBrightness(document.getElementById("range-hd-brightness").value)}
    document.getElementById("range-hd-brightness").oninput = function () {scenesSetBrightness(document.getElementById("range-hd-brightness").value)}
    document.getElementById("sm-select").oninput = function () {scenesSetScene(document.getElementById("sm-select").value)}
    document.getElementById("sm-select").onchnage = function () {scenesSetScene(document.getElementById("sm-select").value)}
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
    console.log(scenceslist[0])
    for (scene of scenceslist) {
        console.log(scene)
        var option = document.createElement("option")
        option.text = scene
        option.value = scene
        document.getElementById("sm-select").add(option)
    }
}

function set_current_scene(scene) {
    document.getElementById("sm-select").value = scene
}

function set_current_state(state) {
    document.getElementById("check-hd-on_off_switch").checked = state
}

function beGetData() {
    return fetch("https://api.deutscher775.de/nanoleaf/get")
        .then(response => response.json());
}

function beGetGreeting() {
    const dt = new Date();
    const hours = dt.getHours();

    if (hours < 12) {
        return "morning";
    } else if (hours < 18) {
        return "noon";
    } else {
        return "evening";
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

function hdToggleOnOff() {
    beGetData().then(data => {
        const state = data.state.on.value;
        const newState = !state;
        fetch(`https://api.deutscher775.de/nanoleaf/power?state=${newState}`, { method: "POST" });
    });
}

function getGreeting() {
    const g = beGetGreeting();
    if (g === "morning") {
        set_greeting("Good morning!");
    } else if (g === "noon") {
        set_greeting("Good afternoon!");
    } else if (g === "evening") {
        set_greeting("Good evening!");
    }
}

function scenesSetScene(scene) {
    beGetData().then(data => {
        const currentScene = data.effects.current;
        if (scene && scene !== currentScene && scene.indexOf(beGetScenes())) {
            fetch(`https://api.deutscher775.de/nanoleaf/set?effect=${scene}`, { method: "POST" });
        }
    });
}

function scenesSetBrightness(brightness) {
    beGetData().then(data => {
        const currentBrightness = data.state.brightness.value;
        if (brightness && brightness !== currentBrightness) {
            fetch(`https://api.deutscher775.de/nanoleaf/set?brightness=${brightness}`, { method: "POST" });
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
    await new Promise(r => setTimeout(r, 100));
    beGetData().then(data => {
        set_current_scene(data.effects.current)
    });
}

function getCurrentState() {
    beGetData().then(data => {
        set_current_state(data.state.on.value)
    });
}
