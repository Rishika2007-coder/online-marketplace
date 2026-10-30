const API='/api';
function token(){return localStorage.getItem('shop_token');}
async function api(path,options={}){const headers={'Content-Type':'application/json',...(options.headers||{})};if(token())headers.Authorization='Bearer '+token();const res=await fetch(API+path,{...options,headers});const data=await res.json().catch(()=>({message:'Unexpected server response'}));if(!res.ok)throw new Error(data.message||'Request failed');return data;}
function notify(message,type='success'){let box=document.getElementById('notice');if(!box){box=document.createElement('div');box.id='notice';document.querySelector('main')?.prepend(box);}if(box){box.className='notice '+type;box.textContent=message;}}
function currentUser(){try{return JSON.parse(localStorage.getItem('shop_user')||'null')}catch{return null}}
function requireRole(...roles){const u=currentUser();if(!token()||!u||!roles.includes(u.role)){location.href='/pages/login.html';return false;}return true;}
function logout(){localStorage.removeItem('shop_token');localStorage.removeItem('shop_user');location.href='/';}
