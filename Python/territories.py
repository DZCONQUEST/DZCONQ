def update_territories(world):
    # Contrôle dynamique par influence autour des villes ; aucune frontière administrative prédéfinie.
    for city in world["cities"].values():
        tid="influence_"+city["id"]
        world["territories"][tid]={"id":tid,"owner_id":city["owner_id"],"center":{"x":city["x"],"z":city["z"]},
          "radius":90+city["population"]*2,"city_id":city["id"],"control_level":1}
