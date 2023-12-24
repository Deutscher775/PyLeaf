window.onload = async function () {
    document.getElementById("cs-btn-address").onclick = function () {setAdress()}
    console.log(document.cookie.split(";")[0].split("=")[1])
    document.getElementById("back").onclick = function () { document.location.assign("/") }
    update()
}

function update () {
    document.getElementById("cs-input-address").value = document.cookie.split(";")[0].split("=")[1]
}

function setAdress () {
    const address = document.getElementById("cs-input-address").value
    console.log(address)
    document.cookie = `panel.address=${address}`
    update()
}