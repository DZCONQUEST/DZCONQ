def trade(world,seller_id,buyer_id,resource,quantity,price):
    s=world["civilizations"].get(seller_id);b=world["civilizations"].get(buyer_id)
    if not s or not b or quantity<=0 or s["resources"].get(resource,0)<quantity or b["resources"]["gold"]<price:return {"ok":False}
    s["resources"][resource]-=quantity;b["resources"][resource]+=quantity
    b["resources"]["gold"]-=price;s["resources"]["gold"]+=price
    return {"ok":True}
