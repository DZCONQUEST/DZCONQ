import json
def serialize_world(world):return json.dumps(world,separators=(",",":"),ensure_ascii=False)
def restore_world(raw):
    data=json.loads(raw)
    if data.get("version")!="3.0.0":raise ValueError("Version de sauvegarde incompatible.")
    return data
