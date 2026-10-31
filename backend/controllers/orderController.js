const db=require('../config/db');
exports.create=async(req,res)=>{
 const conn=await db.getConnection();
 try{
  await conn.beginTransaction();
  const [items]=await conn.query("SELECT ci.product_id,ci.quantity,p.price,p.seller_id,p.stock_quantity,p.product_name FROM cart c JOIN cart_items ci ON ci.cart_id=c.cart_id JOIN products p ON p.product_id=ci.product_id WHERE c.customer_id=? FOR UPDATE",[req.user.id]);
  if(!items.length)throw Error('Your cart is empty');
  let total=0;
  for(const i of items){if(i.stock_quantity<i.quantity)throw Error(`Insufficient stock for ${i.product_name}`);total+=Number(i.price)*i.quantity;}
  const [o]=await conn.query("INSERT INTO orders(customer_id,total_amount,shipping_address,order_status,payment_status) VALUES(?,?,?,'placed','pending')",[req.user.id,total,req.body.shipping_address||'Address not provided']);
  for(const i of items){
   await conn.query('INSERT INTO order_items(order_id,product_id,seller_id,quantity,price,subtotal) VALUES(?,?,?,?,?,?)',[o.insertId,i.product_id,i.seller_id,i.quantity,i.price,i.price*i.quantity]);
   await conn.query('UPDATE products SET stock_quantity=stock_quantity-? WHERE product_id=? AND stock_quantity>=?',[i.quantity,i.product_id,i.quantity]);
  }
  await conn.query('DELETE ci FROM cart_items ci JOIN cart c ON c.cart_id=ci.cart_id WHERE c.customer_id=?',[req.user.id]);
  await conn.commit();res.status(201).json({message:'Order placed',order_id:o.insertId,total});
 }catch(e){await conn.rollback();res.status(400).json({message:e.message});}finally{conn.release();}
};
exports.mine=async(req,res)=>{const [r]=await db.query('SELECT * FROM orders WHERE customer_id=? ORDER BY order_date DESC',[req.user.id]);res.json(r);};
exports.get=async(req,res)=>{const [r]=await db.query("SELECT * FROM orders WHERE order_id=? AND (customer_id=? OR ? IN ('admin','superadmin'))",[req.params.id,req.user.id,req.user.role]);if(!r.length)return res.status(404).json({message:'Order not found'});const [items]=await db.query('SELECT oi.*,p.product_name FROM order_items oi JOIN products p ON p.product_id=oi.product_id WHERE oi.order_id=?',[req.params.id]);res.json({...r[0],items});};
exports.cancel=async(req,res)=>{const [r]=await db.query("UPDATE orders SET order_status='cancelled' WHERE order_id=? AND customer_id=? AND order_status IN ('placed','processing')",[req.params.id,req.user.id]);res.json({message:r.affectedRows?'Order cancelled':'Order cannot be cancelled'});};
