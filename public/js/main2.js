const adduser = document.getElementById('adduser');
const joinuser = document.getElementById('joinuser');

adduser.addEventListener('click',()=>{
    joinuser.style.background = '#e6e9ff';
     joinuser.disabled = false;
})