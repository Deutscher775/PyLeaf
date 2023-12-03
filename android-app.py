import eel
import requests
import datetime

eel.init("web")


def be_get_data():
    return requests.get("https://api.deutscher775.de/nanoleaf/get").json()


def be_get_greeting():
    dt = datetime.datetime.now()
    if dt.time() < datetime.time(12, 0, 0):
        return "morning"
    elif dt.time() >= datetime.time(12, 0, 0):
        return "noon"
    elif dt.time() >= datetime.time(18, 0, 0):
        return "evening"


def be_get_scenes():
    return requests.get("https://api.deutscher775.de/nanoleaf/get").json()["effects"]["effectsList"]


def be_get_brightness():
    data = be_get_data()
    return data["state"]["brightness"]["min"], data["state"]["brightness"]["max"], data["state"]["brightness"]["value"]


@eel.expose
def hd_toggle_on_off():
    data = be_get_data()
    if not data["state"]["on"]["value"]:
        requests.post("https://api.deutscher775.de/nanoleaf/power?state=true")
    elif data["state"]["on"]["value"]:
        requests.post("https://api.deutscher775.de/nanoleaf/power?state=false")


@eel.expose
def get_greeting():
    g = be_get_greeting()
    if g == "morning":
        eel.set_greeting("Good morning!")
    elif g == "noon":
        eel.set_greeting("Good afternoon!")
    elif g == "evening":
        eel.set_greeting("Good evening!")


@eel.expose
def scenes_set_scene(scene: str):
    data = be_get_data()
    current_scene = data["effects"]["current"]
    if scene in be_get_scenes() and not scene == current_scene:
        requests.post(f"https://api.deutscher775.de/nanoleaf/set?effect={scene}")


@eel.expose
def scenes_set_brightness(brightness):
    data = be_get_data()
    current_brightness = data["state"]["brightness"]
    if not brightness == current_brightness:
        requests.post(f"https://api.deutscher775.de/nanoleaf/set?brightness={brightness}")


@eel.expose
def get_brightness():
    b = be_get_brightness()
    eel.set_current_brightness(b[0], b[1], b[2])


@eel.expose
def get_scenes():
    scenes = be_get_scenes()
    eel.set_scenes_option(scenes)


@eel.expose
def get_current_scene():
    data = be_get_data()
    eel.set_current_scene(data["effects"]["current"])

@eel.expose
def get_current_state():
    data = be_get_data()
    eel.set_current_state(data["state"]["on"])

eel.start("index.html")
