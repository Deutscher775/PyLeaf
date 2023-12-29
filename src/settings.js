window.onload = async function () {
    syncStorage()
    liveURLTokenParamtype()
    syncStorage()
    document.getElementById("cs-btn-address").onclick = function () {setAdress()}
    document.getElementById("cs-btn-token-paramtype").onclick = function () {setTokenParamtype()}
    document.getElementById("back").onclick = function () { document.location.assign("./index.html") }
    update()
    document.getElementById("cs-input-token-paramtype-paramname").oninput = function () {liveURLTokenParamtype()}
    document.getElementById("cs-input-token-paramtype-paramvalue").oninput = function () {liveURLTokenParamtype()}
    document.getElementById("cs-input-address").oninput = function () {liveURLTokenParamtype()}
}

function update () {
    document.getElementById("cs-input-address").value = localStorage.getItem("panel.address")
    document.getElementById("cs-input-token-paramtype-paramname").value = localStorage.getItem("token").split(";")[1].split("=")[0]
    document.getElementById("cs-input-token-paramtype-paramvalue").value = localStorage.getItem("token").split(";")[1].split("=")[1]
}


function setAdress () {
    const address = document.getElementById("cs-input-address").value
    console.log(address)
    sessionStorage.setItem("panel.address", address)
    update()
}

function setTokenParamtype () {
    const token = `${document.getElementById("cs-input-token-paramtype-paramname").value}=${document.getElementById("cs-input-token-paramtype-paramvalue").value}`
    console.log(token)
    sessionStorage.setItem("token", `parameter;${token}`)
    update()
}

function liveURLTokenParamtype() {
    const preview = document.getElementById("cs-p-token-paramtype-preview")
    preview.innerHTML = ""
    const baseURL = document.getElementById("cs-input-address").value
    const paramname = document.getElementById("cs-input-token-paramtype-paramname").value
    const paramvalue = document.getElementById("cs-input-token-paramtype-paramvalue").value
    if (paramname && paramvalue){
        preview.innerHTML = `${baseURL}?${paramname}=${paramvalue}`
    } else {
        preview.innerHTML = baseURL
    }
}

function syncStorage () {
    for (item of Object.keys(sessionStorage)) {
        localStorage.setItem(item, sessionStorage.getItem(item))
    }
}