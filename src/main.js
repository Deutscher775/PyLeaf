async function getPanelAdress() {
    let panelAdress = localStorage.getItem("panel.adress");
    if (panelAdress == null) {
        throw "No panel adress";
    }
    console.info("Panel adress: " + panelAdress);
    return panelAdress;
    
}

async function getData(refresh = false) {
    if (refresh) {
        console.log("Refreshing data");
        localStorage.setItem("data", null);
        let panelAdress = await getPanelAdress();
        if (panelAdress == null) {
            console.error("No panel adress");
            return;
        }
        let response = await fetch(panelAdress + "/get");
        let data = await response.json();
        localStorage.setItem("data", JSON.stringify(data));
    }
    let data = localStorage.getItem("data");
    if (data == null) {
        console.log("Missing data, fetching");
        localStorage.setItem("data", null);
        let panelAdress = await getPanelAdress();
        if (panelAdress == null) {
            return null;
        }
        let response = await fetch(panelAdress + "/get");
        let data = await response.json();
        localStorage.setItem("data", JSON.stringify(data));
        return data;
    } else {
        data = JSON.parse(data);
    }
    return data;
}

async function getColorThemes(refresh = false) {
    if (refresh) {
        console.log("Refreshing color themes");
        localStorage.setItem("colorthemes", null);
        let panelAdress = await getPanelAdress();
        if (panelAdress == null) {
            console.error("No panel adress");
            return;
        }
        let response = await fetch(panelAdress + "/get/effect/colortheme");
        let data = await response.json();
        localStorage.setItem("colorthemes", JSON.stringify(data));
    }
    let data = localStorage.getItem("colorthemes");
    if (data == null) {
        console.log("Missing color themes, fetching");
        localStorage.setItem("colorThemes", null);
        let panelAdress = await getPanelAdress();
        if (panelAdress == null) {
            return null;
        }
        let response = await fetch(panelAdress + "/get/effect/colortheme");
        let data = await response.json();
        localStorage.setItem("colorthemes", JSON.stringify(data));
        return data;
    } else {
        data = JSON.parse(data);
    }
    return data;
}

async function setScene(scene) {
    let panelAdress = await getPanelAdress();
    let response = await fetch(panelAdress + "/set?effect=" + scene, {
        method: "POST"
    });
    let responseJson = await response.json();
    console.log(responseJson);
    getData(true)
    .then(() => {
        updateCurrentState();
        setSelectedScene();
    });
    console.log("Scene set to: " + scene);
    
}

async function updateCurrentState() {
    let data = await getData(); 
    if (!data || !data.state || !data.state.on) {
        console.error("Failed to retrieve data or invalid data structure");
        return;
    }
    let state = data.state.on.value
    
    document.getElementById("check-hd-on_off_switch").checked = state;
    console.log("State is set to: " + state)
    if (state == true) {
        await updateDashboardTheme();
    } else {
        document.getElementById("header-dashboard").style.background = "#292928";
    }
}

async function getSceneColortheme(scene, selected = false) {
    let colorThemes = await getColorThemes();
    let sceneColorTheme = colorThemes[scene.innerHTML];
    if (selected) {
        let colorTheme =  `
        linear-gradient(to bottom right, hsl(${sceneColorTheme[0]["hue"]}, ${sceneColorTheme[0]["saturation"]}%, 50%), 
        hsl(${sceneColorTheme[1]["hue"]}, ${sceneColorTheme[1]["saturation"]}%, 40%)) padding-box,
        linear-gradient(to bottom right, hsl(${sceneColorTheme[0]["hue"]}, ${sceneColorTheme[0]["saturation"]}%, 60%), 
        hsl(${sceneColorTheme[1]["hue"]}, ${sceneColorTheme[1]["saturation"]}%, 70%)) border-box`;
        return colorTheme;
    } else {
        let colorTheme =  `
        linear-gradient(to bottom right, hsl(${sceneColorTheme[0]["hue"]}, ${sceneColorTheme[0]["saturation"]}%, 20%), 
        hsl(${sceneColorTheme[1]["hue"]}, ${sceneColorTheme[1]["saturation"]}%, 20%)) padding-box,
        linear-gradient(to bottom right, hsl(${sceneColorTheme[0]["hue"]}, ${sceneColorTheme[0]["saturation"]}%, 60%), 
        hsl(${sceneColorTheme[1]["hue"]}, ${sceneColorTheme[1]["saturation"]}%, 70%)) border-box`;
        return colorTheme;
    }
}

async function appendScenes() {
    let data = await getData();
    let scenes = data.effects.effectsList;
    let sceneContainer = document.getElementById("sm-selector");
    sceneContainer.innerHTML = "";
    for (let scene of scenes) {
        var item = document.createElement("button")
        item.id = "sm-selector-item"
        item.innerHTML = scene

        item.onclick = async function() {
            await setScene(scene);
        }
        item.style.background = await getSceneColortheme(item);
        sceneContainer.appendChild(item);
    }
    await setSelectedScene();
}

async function setSelectedScene() {
    let data = await getData();
    let sceneContainer = document.getElementById("sm-selector");
    let selectedScene = data.effects.current;
    let items = sceneContainer.getElementsByTagName("button");
    for (let item of items) {
        if (item.innerHTML == selectedScene) {
            item.style.background = await getSceneColortheme(item, true);
            item.style.border = "2px solid transparent";
        } else {
            item.style.background = await getSceneColortheme(item);
            item.style.border = null
        }
    }
}

async function updateDashboardTheme () {
    console.log("Updating dashboard theme");
    let data = await getData();
    let headerdashboard = document.getElementById("header-dashboard");
    let appendedScenes = document.getElementById("sm-selector");
    for (let scene of appendedScenes.children) {
        if (scene.innerHTML == data.effects.current) {
            headerdashboard.style.background = await getSceneColortheme(scene, true);
        }
    }

}


async function toggleState() {
    let data = await getData();
    let state = data.state.on.value;
    let panelAdress = await getPanelAdress();
    let newState = !state;
    let response = await fetch(panelAdress + "/power?state=" + newState, {
        method: "POST"
    }
    );
    let responseJson = await response.json();
    console.log(responseJson);
    getData(true)
    .then(() => {
        updateCurrentState();
    });
    console.log("State toggled to: " + newState);
}

async function updateDashboardTexts() {
    let data = await getData();
    let state = data.state.on.value;
    let brightness = data.state.brightness.value;
    let brightnessText = document.getElementById("span-brightness");
    let brightnessSlider = document.getElementById("range-hd-brightness");
    brightnessText.innerHTML = "Brightness: " + brightness + "%";
    brightnessSlider.value = brightness;
    let currentScene = data.effects.current;
    document.getElementById("hd-title").innerHTML = currentScene;
}

async function changeBrightness() {
    let data = await getData();
    let brightness = document.getElementById("range-hd-brightness").value;
    let panelAdress = await getPanelAdress();
    let response = await fetch(panelAdress + "/set?brightness=" + brightness, {
        method: "POST"
    });
    let responseJson = await response.json();
    console.log(responseJson);
    getData(true)
    .then(() => {
        updateDashboardTexts();
    });
    console.log("Brightness set to: " + brightness);
    
}

async function changedBrightnessPreview() {
    let brightness = document.getElementById("range-hd-brightness").value;
    let brightnessText = document.getElementById("span-brightness");
    brightnessText.innerHTML = "Brightness: " + brightness + "%";
}



async function initial_load() {
    await getData(true);
    let data = await getData();
    console.log(data);
    document.getElementById("header-dashboard").onclick = async function() {
        if (event.target.id === "range-hd-brightness") {
            event.target.oninput = async function() {
                await changedBrightnessPreview();
            }
            event.target.onchange = async function() {
                await changeBrightness();
            }
        } else {
            await toggleState();
        }
    }
    await getColorThemes(true);
    await appendScenes();
    await updateDashboardTexts();
    await updateCurrentState();
}

window.onload = async function() {
    await initial_load();

    document.getElementById("settings").onclick = async function() {
        window.location.href = "settings.html";
    }
}