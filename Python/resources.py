RESOURCE_TYPES={"gold":"Or","food":"Nourriture","wood":"Bois","iron":"Fer","stone":"Pierre"}
def balance(stock,production,consumption,dt=1):return max(0,stock+(production-consumption)*dt)
