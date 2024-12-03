let nombre;
let apellidos; let numControl;let correoE;
let maquina;let estado;let fecha;
let horario;let btnAdd; let btnClean;

document.addEventListener('DOMContentLoaded', function(){
    nombre = document.getElementById('name');
    apellidos = document.getElementById('surname');
    numControl = document.getElementById('nControl');
    correoE = document.getElementById('correo');
    maquina = document.getElementById('mAsignada');
    /*horario = document.getElementById(''); PENDIENTEEEEE*/
    estado = document.querySelector('input[name="status"]:checked');
    fecha = document.getElementById('fIngreso');
    btnAdd = document.getElementById('regisAlum');
    btnClean = document.getElementById('limpiar');

    const modal = document.getElementById('modalHorario');
    const openModalBtn = document.getElementById('openModal');
    const closeModalBtn = document.getElementById('closeModal');
});
