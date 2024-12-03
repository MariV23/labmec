
let btnLogin;
let email;
let password;
let view; let forg; let newPass;

window.onload = function(){
    email = document.getElementById("email")
    password = document.getElementById("password")
    btnLogin = document.getElementById("btnLogin")
    view = document.getElementById("vision");
    forg = document.getElementById("forget");

    const modal = document.getElementById("forgotPasswordModal");
    const spanClose = document.getElementsByClassName("close")[0];
    btnLogin.onclick = async function(event) {
      event.preventDefault();
      const obj = { email: email.value, password: password.value };

      const response = await window.electronAPI.login(obj);
      const errorMessageDiv = document.getElementById('error-message');

      if (response.success) {
          alert(response.message);
          errorMessageDiv.textContent = '';  // Limpiar el mensaje de error
      } else {
          errorMessageDiv.textContent = response.message;
      }
    };

    btnRegis.onclick = async function(event) {
        event.preventDefault(); 
        await window.electronAPI.openRegisterWindow();
    };

    view.addEventListener('click',function(){
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type',type);

        if (type === 'password') {
            view.setAttribute('src', '../assets/eye_hide.png');
        } else {
            view.setAttribute('src', '../assets/view_vision_eye_icon_195036.png'); 
            view.setAttribute('width', '22px');
            view.setAttribute('height', '20px');
        }
    });

    forg.onclick = function(){
        modal.style.display = "block";
    }

    spanClose.onclick = function() {
        modal.style.display = "none";
    }

    document.getElementById('recoverPassword').onclick = async function() {
        const emailIn = document.getElementById("emailInput").value;
        //const obj = { email: emailIn.value};
        console.log('Email ingresado:', emailIn.value);

        if (emailIn) {
          const response = await window.electronAPI.recoverPassword(emailIn);
          if (response.success) {
            // Mostrar la contraseña recuperada
            alert('Tu contraseña es: ' + response.password);
          } else {
            // Mostrar el mensaje de error
            alert(response.message);
          }
        } else {
          alert('Por favor, ingresa un correo válido');
        }
    };

}
