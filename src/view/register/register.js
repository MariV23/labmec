//const { ipcRenderer} = require('electron')

let btnRegistrar;
let nombre;
let apellidos;
let nControl;let nTelefono; let correo;let nUsuario; let contraseña; let confirContra;
let view;

document.addEventListener('DOMContentLoaded', function(){
    btnRegistrar = document.getElementById("btnRegistrar");
    nombre = document.getElementById('name');
    apellidos = document.getElementById("surnames");
    nControl = document.getElementById("nControl");
    nTelefono = document.getElementById("nPhone");
    correo = document.getElementById("email");
    nUsuario = document.getElementById("nameUser");
    contraseña = document.getElementById("pas");
    confirContra = document.getElementById("conpas");
    view = document.getElementById("vision");
    viewCon = document.getElementById("visionCon");
    btnBack = document.getElementById("back");

    btnRegistrar.onclick = async function(event) {
        event.preventDefault();
        const obj = { nombre: nombre.value, apellidos:apellidos.value,
            nControl:nControl.value,tel:nTelefono.value,email: correo.value,nUser:nUsuario.value,
            password: contraseña.value, pss:confirContra.value};

        const response = await window.electronAPI.registerUser(obj)
            const errorMessageDiv = document.getElementById('error-message');
        
            if (response.success) {
                alert(response.message);
                errorMessageDiv.textContent = '';  //Limpiar el mensaje de error
                console.log('Registro exitoso');
                //redireccion a otra ventana
                //registerWindow.location.href = 'index.html';//ver si me dirige a la ventana
                
            } else {
                const adv = document.createElement('img');
                adv.src='../assets/info-circle-regular-24.png';
                adv.style.marginRight = '10px';
                const message = document.createElement('span');
                message.textContent = response.message;
                errorMessageDiv.appendChild(adv);
                errorMessageDiv.appendChild(message);
                //Habilitar los campo para editar
                /*
                document.getElementById('email').disabled = false;
                document.getElementById('password').disabled = false;*/
            }
    };

    view.addEventListener('click',function(){
        const type = contraseña.getAttribute('type') === 'password' ? 'text' : 'password';
        contraseña.setAttribute('type',type);

        if (type === 'password') {
            view.setAttribute('src', '../assets/eye_hide.png');
        } else {
            view.setAttribute('src', '../assets/view_vision_eye_icon_195036.png'); 
            view.setAttribute('width', '22px');
            view.setAttribute('height', '20px');
        }
    });

    viewCon.addEventListener('click',function(){
        const type2 = confirContra.getAttribute('type') === 'password' ? 'text' : 'password';
        confirContra.setAttribute('type',type2);

        if (type2 === 'password') {
            viewCon.setAttribute('src', '../assets/eye_hide.png');
        } else {
            viewCon.setAttribute('src', '../assets/view_vision_eye_icon_195036.png'); 
            viewCon.setAttribute('width', '22px');
            viewCon.setAttribute('height', '20px');
        }
    });

    btnBack.onclick = async function (event) {
        event.preventDefault();
        await window.electronAPI.openLoginWindow();
    };
});