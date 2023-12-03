window.onload = async function () {
    eel.get_greeting()
    eel.get_brightness()
    eel.get_scenes()
    eel.get_current_scene()
    eel.get_current_state()
    document.getElementById("check-hd-on_off_switch").onchange = function () {eel.hd_toggle_on_off()}
    document.getElementById("range-hd-brightness").onchange = function () {eel.scenes_set_brightness(document.getElementById("range-hd-brightness").value)}
    document.getElementById("range-hd-brightness").oninput = function () {eel.scenes_set_brightness(document.getElementById("range-hd-brightness").value)}
    document.getElementById("sm-select").oninput = function () {eel.scenes_set_scene(document.getElementById("sm-select").value)}

    /* Actuvate all elements after loading */
    await new Promise(r => setTimeout(r, 1000));
    document.getElementById("check-hd-on_off_switch").disabled = false
    document.getElementById("range-hd-brightness").disabled = false
    document.getElementById("sm-select").disabled = false
}

function set_greeting(greeting) {
    document.getElementById("hd-title").innerHTML = greeting
}
eel.expose(set_greeting)

function set_current_brightness(min, max, current) {
    document.getElementById("range-hd-brightness").min = min
    document.getElementById("range-hd-brightness").max = max
    document.getElementById("range-hd-brightness").value = current
}
eel.expose(set_current_brightness)

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
eel.expose(set_scenes_option)

function set_current_scene(scene) {
    document.getElementById("sm-select").value = scene
}
eel.expose(set_current_scene)

function set_current_state(state) {
    document.getElementById("check-hd-on_off_switch").checked = state
}
eel.expose(set_current_state)
