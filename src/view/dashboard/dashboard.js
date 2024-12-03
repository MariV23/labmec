//const fs = require('fs');
//const path = require('path');
//const {ipcRenderer} = require('electron');



const contentArea = document.querySelector('.interno-opciones');

const btnMenu = document.getElementById("btn-menu");
const menuLateral = document.querySelector(".menu-lateral");
const spans = document.querySelectorAll("span");
const main = document.querySelector("main");
const closeSesion = document.getElementById("menu-toggle");
const logOut = document.getElementById("logout");


const ini = document.getElementById('inicio');

const act = document.getElementById('add-new-user');
const act2 = document.getElementById('alumActives');
const act3 = document.getElementById('list_inactive_students');
const act4 = document.getElementById('register_attendance');
const act5 = document.getElementById('attendance_for_day');
const act6 = document.getElementById('reports');
const act7 = document.getElementById('codigos');

/**Cierre de sesión */

closeSesion.addEventListener("click", function () {
    const dropdownMenu = document.getElementById("dropdown-menu");
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
});

logOut.addEventListener("click", function () {
    // Cerrar sesión: Aquí puedes llamar a una función que limpie los datos del usuario.
    console.log("Cerrando sesión...");
    // Redirigir al login
    window.electronAPI.openLoginWindow();
});

// Opcional: Cerrar el menú si se hace clic fuera
document.addEventListener("click", function (event) {
    const dropdownMenu = document.getElementById("dropdown-menu");
    const toggle = document.getElementById("menu-toggle");
    if (!toggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = "none";
    }
});


ini.classList.toggle("active");
/*const menuOptions = document.querySelectorAll('.menu-select');*/

btnMenu.addEventListener("click",() => {
    menuLateral.classList.toggle("mini-menu-lateral");
    main.classList.toggle("min-main");

    spans.forEach(span => {
        span.classList.toggle("oculto");
    });
});

window.electronAPI.on('send-email', (event, { usuario, email }) => {

    const us = document.getElementById('user-name');
    const mail = document.getElementById('user-email');
    us.innerText = usuario;
    mail.innerText = email;
    console.log("Usuario:", usuario);
    console.log("Email:", email);
});


/**CARGAR VENTANA DE TABLA DE ALUMNOS */
function loadAddUser(url){
    window.electronAPI.loadFile(url).then(response =>  {
        if (!response.success) {
            console.error('Error loading content:', response.message);
            contentArea.innerHTML = `<p>Error loading content: ${response.message}</p>`;
            return;
        }
        contentArea.innerHTML = response.data;
        //loadTableData(contentArea);
        const nuevo = contentArea.querySelector('#btnNew');
        if (nuevo) {
            nuevo.addEventListener('click', function () {
              cargarVista('/view/register_alumnos/registrar.html');
            });
        }

        /**Buscar alumno por numero de control o nombre*/
        const btnBuscar = contentArea.querySelector('#search');
        if(btnBuscar){
            btnBuscar.addEventListener('input',()=>{
                const query = btnBuscar.value.trim().toLowerCase();
                loadTableData(query);
            });
        }
        loadTableData();     
    })
    .catch(error => {
        console.error('Error loading content: ',error);
        contentArea.innerHTML = `<p>Error loading content: ${error.message}</p>`;
    });
}

document.getElementById('add-new-user').addEventListener('click', (e) => {
    e.preventDefault();
    ini.classList.remove("active");
    act.classList.toggle("active");
    act2.classList.remove("active");
    act3.classList.remove("active");
    act4.classList.remove("active");
    act5.classList.remove("active");
    act6.classList.remove("active");
    act7.classList.remove("active");

    loadAddUser('/view/register_alumnos/register_student.html');
    /*loadTableData();*/
});
function cargarVista(url,alumnoId=null ){
    window.electronAPI.loadFile(url).then(response =>  {
        if (!response.success) {
            console.error('Error loading content:', response.message);
            contentArea.innerHTML = `<p>Error loading content: ${response.message}</p>`;
            return;
        }
        contentArea.innerHTML = response.data;
        const back = contentArea.querySelector('#regresar')
        /**Recuperar todos los datos del alumno a registrar */
        const nameAlum = contentArea.querySelector('#name');
        const apellidosAlum = contentArea.querySelector('#surname');
        const numControl = contentArea.querySelector('#nControl');
        const correoAlum = contentArea.querySelector('#correo');
        const mAsignada = contentArea.querySelector('#mAsignada');
        const estadoAlumRad = contentArea.querySelectorAll('input[name="status"]');
        let maqSeleccionada;
        let estadoAlum;
        mAsignada.addEventListener('change', () => {
            maqSeleccionada = mAsignada.value;
            console.log("Máquina seleccionada:", maqSeleccionada);
        });
        
        estadoAlumRad.forEach(radio => {
            radio.addEventListener('change', () => {
                estadoAlum = contentArea.querySelector('input[name="status"]:checked').value;
                console.log('Estado:', estadoAlum);
            });
        });
        const fIngreso  = contentArea.querySelector('#date')

        const btnRegistrar = contentArea.querySelector('#regisAlum');
        const btnLimpiar = contentArea.querySelector('#limpiar');



        /**Editar el alumno */
        if (alumnoId) {
            window.electronAPI.getAlumnoById(alumnoId).then(alumno => {
                if (alumno) {

                    /**Actualizar el botón */
                    if (btnRegistrar) {
                        btnRegistrar.innerText = "Actualizar";
                        console.log("Texto actualizado del botón:", btnRegistrar.innerText);
                    } else {
                        console.error("btnRegistrar no se encontró en el DOM.");
                    }

                    // Rellenar los campos con los datos del alumno
                    nameAlum.value = alumno.nombre;
                    apellidosAlum.value = alumno.apellidos;
                    numControl.value = alumno.nControl;
                    correoAlum.value = alumno.correo;
                    
                    if (alumno.mAsignada) {
                        mAsignada.value = alumno.mAsignada;
                    } else {
                        console.warn('Máquina no asignada para el alumno con ID:', alumnoId);
                        mAsignada.value = ''; // Puedes asignar un valor por defecto aquí si es necesario
                    }

                    estadoAlumRad.forEach(radio => {
                        radio.checked = (radio.value === alumno.estado);
                    });

                    const formatDate = (dateString) => {
                        if (!dateString) return '';
                        const date = new Date(dateString);
                        if (isNaN(date.getTime())) {
                            console.warn('Fecha inválida:', dateString);
                        }
                        return date.toISOString().split('T')[0];
                    };
                    fIngreso.value = formatDate(alumno.fecha_ingreso);

                    estadoAlumRad.forEach(radio => {
                        if (radio.value === alumno.estado) {
                            radio.checked = true;
                        }
                    });
                    



                } else {
                    console.error('No se encontraron datos para el alumno con ID:', alumnoId);
                }
            }).catch(error => {
                console.error('Error al obtener los datos del alumno:', error);
            });
        }


        btnRegistrar.onclick = async function(event) {
            try {
                event.preventDefault();
                const obj = { nombre: nameAlum.value, apellidos:apellidosAlum.value,
                    nControl:numControl.value,correo: correoAlum.value,maquina:maqSeleccionada,
                    estado: estadoAlum, fechaIngreso:fIngreso.value};
                

                try {
                    let response;
                    if (alumnoId) {
                        // Actualizar si alumnoId está presente
                        response = await window.electronAPI.updateStudent(alumnoId, obj);
                    } else {
                        // Registrar nuevo alumno
                        response = await window.electronAPI.registerStudent(obj);
                        alert('Alumno registrado');
                        
                    }

                    if (response.success) {
                        console.log(alumnoId ? 'Actualización exitosa' : 'Registro exitoso');
                        alert('Alumno actualizado');
                        //loadTableData();  // Recargar la tabla de alumnos no es necesario 
                    } else {
                        console.log('Error en la operación:', response.message);
                    }
                } catch (error) {
                    console.error('No se pudo procesar la operación',error);
                }
            } catch (error) {
                console.log('no se pudo registrar:', error);
            } 
        }

        btnLimpiar.onclick = async function (event) {
            try {
                const formRegis = contentArea.querySelector('#formRegis');
                const formRegis2 = contentArea.querySelector('#formRegis2');
                event.preventDefault();
                const inputs = formRegis.querySelectorAll('input');
                const inputs2 = formRegis2.querySelectorAll('input');
                mAsignada.value = '';
                estadoAlumRad.forEach(radio => {
                    radio.checked = false;
                });
                
                inputs.forEach(input => {
                    input.value = ''; 
                });
                inputs2.forEach(input => {
                    input.value = ''; 
                });
            } catch (error) {
                console.log('no se pudo borrar:', error);
            }
        }
        /**Modal del horario */


        const modal = contentArea.querySelector('#modal');
        const openModalBtn = contentArea.querySelector('#openModal');
        const closeModalBtn = contentArea.querySelector('#closeModal');
        const btnRegisHorario = contentArea.querySelector('#regisHorario');
        const btnLimHoraio = contentArea.querySelector('#limpiarHorario');

        if (modal && openModalBtn && closeModalBtn) {
            openModalBtn.onclick = () => {
                cargarHorarioAlumno(alumnoId);
                modal.style.display = "block";
            };
            closeModalBtn.onclick = () => closeModal();
    
            function closeModal() {
                modal.style.display = "none";
            }
        } else {
            console.warn('Modal elements not found in the content');
        }

        /**Dias de la semana */
        const days = ["Lunes","Martes","Miércoles","Jueves","Viernes"];
        const hours = ["8:00am","9:00am","10:00am","11:00am","12:00pm","1:00pm","2:00pm","3:00pm","4:00pm","5:00pm","6:00pm","7:00pm"];
        
        let daysContainer = contentArea.querySelector('#days');
        const headerRow = document.createElement("div");
        headerRow.classList.add("grid-row");
        headerRow.classList.add("header-row");

        days.forEach(day => {
            const dayHeader = document.createElement("div");
            dayHeader.classList.add("day-header");
            dayHeader.textContent = day;
            headerRow.appendChild(dayHeader);
        });

        daysContainer.appendChild(headerRow);

        // Crear las filas de horas, donde cada botón representa una combinación de día y hora
        hours.forEach(hour => {
            const row = document.createElement("div");
            row.classList.add("grid-row");

            days.forEach(() => {
                const hourBtn = document.createElement("button");
                hourBtn.classList.add("hour-btn");
                hourBtn.textContent = hour;

                // Agregar un evento para marcar como seleccionada la hora
                hourBtn.onclick = () => {
                    hourBtn.classList.toggle("selected");
                };

                row.appendChild(hourBtn);
            });

            daysContainer.appendChild(row);
        });

        /**Enviar las horas seleccionadas */
        btnRegisHorario.onclick = () => {
            //console.log('numero:', numControl.value);
            const selectedHours = [];
        
            daysContainer.querySelectorAll('.grid-row').forEach((row, rowIndex) => {
                if (rowIndex === 0) return; // Saltar la fila de encabezados
        
                const hour = hours[rowIndex - 1]; // Obtener la hora correspondiente a la fila
        
                row.querySelectorAll('.hour-btn').forEach((hourBtn, dayIndex) => {
                    if (hourBtn.classList.contains('selected')) {
                        const day = days[dayIndex];
                        selectedHours.push({ day, hour });
                    }
                });
            });
        
            // Enviar los datos seleccionados al backend
            window.electronAPI.guardarHorario(selectedHours,numControl.value);
            alert('Horario registrado exitosamente');
            try {
                const formRegis = contentArea.querySelector('#formRegis');
                const formRegis2 = contentArea.querySelector('#formRegis2');
                //event.preventDefault();
                const inputs = formRegis.querySelectorAll('input');
                const inputs2 = formRegis2.querySelectorAll('input');
                mAsignada.value = '';
                
                estadoAlumRad.forEach(radio => {
                    radio.checked = false;
                });

                inputs.forEach(input => {
                    input.value = ''; 
                });
                inputs2.forEach(input => {
                    input.value = ''; 
                });
            } catch (error) {
                console.log('no se pudo borrar:', error);
            }
            const selecButtons = daysContainer.querySelectorAll('.hour-btn.selected');
            selecButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
        };
        btnLimHoraio.onclick = () => {
            const selectedButtons = daysContainer.querySelectorAll('.hour-btn.selected');
            selectedButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
        };

        if (back) {
            back.addEventListener('click', function () {
                loadAddUser('/view/register_alumnos/register_student.html');
                loadTableData();
            });
        }
    })
}
function cargarHorarioAlumno(alumnoId) {
    // Llamada a la API para obtener el horario del alumno
    const days = ["Lunes","Martes","Miercoles","Jueves","Viernes"];
    const hours = ["8:00am","9:00am","10:00am","11:00am","12:00pm","1:00pm","2:00pm","3:00pm","4:00pm","5:00pm","6:00pm","7:00pm"];
    console.log(alumnoId);
    window.electronAPI.getHorarioByAlumnoId(alumnoId).then(response => {
        const horario = response.horarios;
        const daysContainer = contentArea.querySelector('#days'); // Asegúrate de que el selector es correcto


        // Verifica que el contenedor existe
        if (!daysContainer) {
            console.error('El contenedor daysContainer no se encontró en el DOM.');
            return;
        }
        if (horario.length > 0) {
            console.log('horarios',horario);
            //console.log('entra al if')
            // Limpiar selección actual antes de marcar nuevas horas
            const selectedButtons = daysContainer.querySelectorAll('.hour-btn.selected');
            selectedButtons.forEach(btn => btn.classList.remove('selected'));

            // Iterar sobre los horarios del alumno para seleccionarlos en el modal
            horario.forEach(({ dia, hora }) => {
                // Buscar el botón correspondiente al día y la hora
                const dayIndex = days.indexOf(dia);
                const hourIndex = hours.indexOf(hora);
                console.log(`Día: ${dia}, Índice de Día: ${dayIndex}, Hora: ${hora}, Índice de Hora: ${hourIndex}`);
                
                if (dayIndex >= 0 && hourIndex >= 0) {
                    // Seleccionar el botón si se encuentra en la grilla
                    const row = daysContainer.querySelectorAll('.grid-row')[hourIndex + 1];
                    const button = row.querySelectorAll('.hour-btn')[dayIndex];
                    button.classList.add('selected');
                }
            });
            //PENDIENTE EL ACTUALIZAR HORARIO
        } else {
            console.log('No se encontraron horarios registrados para este alumno.');
        }


    }).catch(error => {
        console.error('Error al obtener el horario del alumno:', error);
    });
}


function loadTableData(query = '') {
    console.log('entra aqui')
    console.log('window.electronAPI:', window.electronAPI);
    window.electronAPI.viewAlumnos().then(response => {
        console.log('ingresa')
        console.log(response);
        if (response.success) {
            let alumnos = response.alumnos || [];
            console.log('Datos del alumnos: ',alumnos);

            /**Parte de la busqueda */
            if (query) {
                alumnos = alumnos.filter(alumno =>
                    alumno.nombre.toLowerCase().includes(query) ||
                    alumno.apellidos.toLowerCase().includes(query) ||
                    alumno.nControl.toLowerCase().includes(query)
                );
            }
            // Buscar el tbody después de haber cargado el HTML
            let tableBody = contentArea.querySelector('#alumnosTable tbody');
            if (tableBody) {
                tableBody.innerHTML = '';  // Limpiar el contenido previo

                /*Llena la tabla con los datos de alumnos*/
                alumnos.forEach(alumno => {
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${alumno.nControl}</td>
                        <td>${alumno.nombre}</td>
                        <td>${alumno.apellidos}</td>
                        <td class="acciones">
                            <div class="opcionesAc">
                                <button class="edit-btn" data-id="${alumno.nControl}">
                                    <img src="../assets/edit-alt-solid-24.png" alt="Edit" class="imgEdit">
                                </button>
                                <button class="delete-btn" data-id="${alumno.nControl}">
                                    <img src="../assets/trash-solid-24.png" alt="Delete class="imgDelete">
                                </button>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                if (alumnos.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4">No se encontraron alumnos.</td></tr>`;
                }

                /**Editar un alumno */
                const editButtons = tableBody.querySelectorAll('.edit-btn');
                editButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const alumnoId = e.target.closest('.edit-btn').dataset.id;
                        // Ejemplo: cargar vista de edición
                        cargarVista('/view/register_alumnos/registrar.html', alumnoId);
                    });
                });
                
                /**Eliminar un alumno registrado */
                const deleteButtons = tableBody.querySelectorAll('.delete-btn');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const alumnoId = e.target.closest('.delete-btn').dataset.id;
                        if (confirm(`¿Estás seguro de que quieres eliminar al alumno con ID ${alumnoId}?`)) {
                            window.electronAPI.deleteAlumno(alumnoId).then(response => {
                                if (response.success) {
                                    console.log(`Alumno con ID ${alumnoId} eliminado exitosamente`);
                                    loadTableData(query); // Recargar la tabla después de eliminar
                                } else {
                                    console.error('Error al eliminar el alumno', response.message);
                                }
                            });
                        }
                    });
                });

            } else {
                console.error('No se encontró el tbody de la tabla');
            }
        } else {
            console.error('Error al obtener los alumnos', response.message);
        }
    }).catch(error => {
        console.error('Error al ejecutar viewAlumnos:', error);
    });
}

/**CARGAR VENTANA ALUMNOS ACTIVOS */
function loadAlumActives(url){
    window.electronAPI.loadFile(url).then(response =>  {
        if (!response.success) {
            console.error('Error loading content:', response.message);
            contentArea.innerHTML = `<p>Error loading content: ${response.message}</p>`;
            return;
        }
        contentArea.innerHTML = response.data;
        loadTableDataActivos();
         /**Buscar alumno por numero de control o nombre*/
         const btnBuscar = contentArea.querySelector('#searchAc');
         if(btnBuscar){
             btnBuscar.addEventListener('input',()=>{
                 const query = btnBuscar.value.trim().toLowerCase();
                 loadTableDataActivos(query);
             });
         }

        })
        .catch(error => {
            console.error('Error loading content: ',error);
            contentArea.innerHTML = `<p>Error loading content: ${error.message}</p>`;
    });

}
/**Funcion de cargar tabla de alumnos activos */
function loadTableDataActivos(query = '') {
    //console.log('entra aqui')
    console.log('window.electronAPI:', window.electronAPI);
    window.electronAPI.viewAlumnosActivos().then(response => {
        //console.log('ingresa')
        console.log(response);
        if (response.success) {
            let alumnos = response.alumnos || [];
            console.log('Datos del alumnos: ',alumnos);

            /**Parte de la busqueda */
            if (query) {
                alumnos = alumnos.filter(alumno =>
                    alumno.nombre.toLowerCase().includes(query) ||
                    alumno.mAsignada.toLowerCase().includes(query)
                );
            }
            // Buscar el tbody después de haber cargado el HTML
            let tableBody = contentArea.querySelector('#alumnosActiveTable tbody');
            if (tableBody) {
                tableBody.innerHTML = '';  // Limpiar el contenido previo

                /*Llena la tabla con los datos de alumnos*/
                alumnos.forEach(alumno => {
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="nombre-alumno">${alumno.nombre}</td>
                        <td>${alumno.mAsignada}</td>
                        <td class="horario">
                            <button class="horario-btn" data-id="${alumno.nControl}">
                                Visualizar
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                const horarioButtons = tableBody.querySelectorAll('.horario-btn');
                const days = ["Lunes","Martes","Miercoles","Jueves","Viernes"];
                const hours = ["8:00am","9:00am","10:00am","11:00am","12:00pm","1:00pm","2:00pm","3:00pm","4:00pm","5:00pm","6:00pm","7:00pm"];

                let daysContainer = contentArea.querySelector('#days');

                const headerRow = document.createElement("div");
                headerRow.classList.add("grid-row");
                headerRow.classList.add("header-row");

                days.forEach(day => {
                    const dayHeader = document.createElement("div");
                    dayHeader.classList.add("day-header");
                    dayHeader.textContent = day;
                    headerRow.appendChild(dayHeader);
                });

                daysContainer.appendChild(headerRow);

                // Crear las filas de horas, donde cada botón representa una combinación de día y hora
                hours.forEach(hour => {
                    const row = document.createElement("div");
                    row.classList.add("grid-row");

                    days.forEach(() => {
                        const hourBtn = document.createElement("button");
                        hourBtn.classList.add("hour-btn");
                        hourBtn.textContent = hour;

                        row.appendChild(hourBtn);
                    });

                    daysContainer.appendChild(row);
                });
                
                horarioButtons.forEach(button => {
                    button.addEventListener('click', (event) => {
                        const alumnoId = event.target.dataset.id;

                        const modal = contentArea.querySelector('#modalActivos');
                        const closeModalBtn = contentArea.querySelector('#closeModal');

                        if (modal && closeModalBtn) {
                            // Limpiar selección actual antes de marcar nuevas horas
                            const selectedButtons = daysContainer.querySelectorAll('.hour-btn.selectedAc');
                            selectedButtons.forEach(btn => btn.classList.remove('selectedAc'));
                            const rect = button.getBoundingClientRect();
                            //Cargamos el horario del alumno
                            window.electronAPI.getHorarioByAlumnoId(alumnoId).then(response => {
                                const horario = response.horarios;
                                let daysContainer = contentArea.querySelector('#days');
                        
                        
                                // Verifica que el contenedor existe
                                if (!daysContainer) {
                                    console.error('El contenedor daysContainer no se encontró en el DOM.');
                                    return;
                                }
                                if (horario.length > 0) {
                                    console.log('horarios',horario);
                                    // Iterar sobre los horarios del alumno para seleccionarlos en el modal
                                    horario.forEach(({ dia, hora }) => {
                                        // Buscar el botón correspondiente al día y la hora
                                        const dayIndex = days.indexOf(dia);
                                        const hourIndex = hours.indexOf(hora);
                                        console.log(`Día: ${dia}, Índice de Día: ${dayIndex}, Hora: ${hora}, Índice de Hora: ${hourIndex}`);
                                        
                                        if (dayIndex >= 0 && hourIndex >= 0) {
                                            // Seleccionar el botón si se encuentra en la grilla
                                            const row = daysContainer.querySelectorAll('.grid-row')[hourIndex + 1];
                                            const button = row.querySelectorAll('.hour-btn')[dayIndex];
                                            button.classList.add('selectedAc');
                                        }
                                    });
                                } else {
                                    console.log('No se encontraron horarios registrados para este alumno.');
                                }
                        
                        
                            }).catch(error => {
                                console.error('Error al obtener el horario del alumno:', error);
                            });




                            modal.style.top = `${rect.top + window.scrollY}px`;
                            modal.style.left = `${rect.left + window.scrollX}px`;
                            modal.style.display = "block";
                            closeModalBtn.onclick = () => closeModal();
                            function closeModal() {
                                modal.style.display = "none";
                            }
                        } else {
                            console.warn('Modal elements not found in the content');
                        }
                    });
                });

                if (alumnos.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4">No se encontraron alumnos.</td></tr>`;
                }

            } else {
                console.error('No se encontró el tbody de la tabla');
            }
        } else {
            console.error('Error al obtener los alumnos', response.message);
        }
    }).catch(error => {
        console.error('Error al ejecutar viewAlumnosActivos:', error);
    });
}

// Función para cerrar el modal, puede añadirse a un botón de cerrar en el modal
function cerrarModalHorario() {
    const modal = document.querySelector('#modalHorario');
    if (modal) {
        modal.style.display = 'none';
    }
}

document.getElementById('alumActives').addEventListener('click', (e) => {
    e.preventDefault();
    act2.classList.toggle("active");
    act.classList.remove("active");
    act3.classList.remove("active");
    act4.classList.remove("active");
    act5.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");
    act7.classList.remove("active");
    loadAlumActives('/view/alumnos_activos/list_active_students.html');
});


/**CARGAR VENTANA ALUMNOS NO ACTIVOS */
function loadAlumInactives(url){
    window.electronAPI.loadFile(url).then(response =>  {
        if (!response.success) {
            console.error('Error loading content:', response.message);
            contentArea.innerHTML = `<p>Error loading content: ${response.message}</p>`;
            return;
        }
        contentArea.innerHTML = response.data;
        loadTableDataInactivos();
         /**Buscar alumno por nombre o maquina*/
         
         const btnBuscar = contentArea.querySelector('#searchInac');
         if(btnBuscar){
             btnBuscar.addEventListener('input',()=>{
                 const query = btnBuscar.value.trim().toLowerCase();
                 loadTableDataInactivos(query);
             });
         }

        })
        .catch(error => {
            console.error('Error loading content: ',error);
            contentArea.innerHTML = `<p>Error loading content: ${error.message}</p>`;
    });
}
function loadTableDataInactivos(query = '') {
    //console.log('entra aqui')
    console.log('window.electronAPI:', window.electronAPI);
    window.electronAPI.viewAlumnosInactivos().then(response => {
        //console.log('ingresa')
        console.log(response);
        if (response.success) {
            let alumnos = response.alumnos || [];
            console.log('Datos del alumnos: ',alumnos);

            /**Parte de la busqueda */
            if (query) {
                alumnos = alumnos.filter(alumno =>
                    alumno.nombre.toLowerCase().includes(query) ||
                    alumno.mAsignada.toLowerCase().includes(query)
                );
            }
            // Buscar el tbody después de haber cargado el HTML
            let tableBody = contentArea.querySelector('#alumnosInactiveTable tbody');
            if (tableBody) {
                tableBody.innerHTML = '';  // Limpiar el contenido previo

                /*Llena la tabla con los datos de alumnos*/
                alumnos.forEach(alumno => {
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="nombre-alumno">${alumno.nombre}</td>
                        <td>${alumno.mAsignada}</td>
                        <td class="horario">
                            <button class="horario-btn" data-id="${alumno.nControl}">
                                Visualizar
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                const horarioButtons = tableBody.querySelectorAll('.horario-btn');
                const days = ["Lunes","Martes","Miercoles","Jueves","Viernes"];
                const hours = ["8:00am","9:00am","10:00am","11:00am","12:00pm","1:00pm","2:00pm","3:00pm","4:00pm","5:00pm","6:00pm","7:00pm"];

                let daysContainer = contentArea.querySelector('#days');

                const headerRow = document.createElement("div");
                headerRow.classList.add("grid-row");
                headerRow.classList.add("header-row");

                days.forEach(day => {
                    const dayHeader = document.createElement("div");
                    dayHeader.classList.add("day-header");
                    dayHeader.textContent = day;
                    headerRow.appendChild(dayHeader);
                });

                daysContainer.appendChild(headerRow);

                // Crear las filas de horas, donde cada botón representa una combinación de día y hora
                hours.forEach(hour => {
                    const row = document.createElement("div");
                    row.classList.add("grid-row");

                    days.forEach(() => {
                        const hourBtn = document.createElement("button");
                        hourBtn.classList.add("hour-btn");
                        hourBtn.textContent = hour;

                        row.appendChild(hourBtn);
                    });

                    daysContainer.appendChild(row);
                });
                
                horarioButtons.forEach(button => {
                    button.addEventListener('click', (event) => {
                        const alumnoId = event.target.dataset.id;

                        const modal = contentArea.querySelector('#modalInactivos');
                        const closeModalBtn = contentArea.querySelector('#closeModal');

                        if (modal && closeModalBtn) {
                            // Limpiar selección actual antes de marcar nuevas horas
                            const selectedButtons = daysContainer.querySelectorAll('.hour-btn.selectedAc');
                            selectedButtons.forEach(btn => btn.classList.remove('selectedAc'));
                            const rect = button.getBoundingClientRect();
                            //Cargamos el horario del alumno
                            window.electronAPI.getHorarioByAlumnoId(alumnoId).then(response => {
                                const horario = response.horarios;
                                let daysContainer = contentArea.querySelector('#days');
                        
                        
                                // Verifica que el contenedor existe
                                if (!daysContainer) {
                                    console.error('El contenedor daysContainer no se encontró en el DOM.');
                                    return;
                                }
                                if (horario.length > 0) {
                                    console.log('horarios',horario);
                                    // Iterar sobre los horarios del alumno para seleccionarlos en el modal
                                    horario.forEach(({ dia, hora }) => {
                                        // Buscar el botón correspondiente al día y la hora
                                        const dayIndex = days.indexOf(dia);
                                        const hourIndex = hours.indexOf(hora);
                                        console.log(`Día: ${dia}, Índice de Día: ${dayIndex}, Hora: ${hora}, Índice de Hora: ${hourIndex}`);
                                        
                                        if (dayIndex >= 0 && hourIndex >= 0) {
                                            // Seleccionar el botón si se encuentra en la grilla
                                            const row = daysContainer.querySelectorAll('.grid-row')[hourIndex + 1];
                                            const button = row.querySelectorAll('.hour-btn')[dayIndex];
                                            button.classList.add('selectedAc');
                                        }
                                    });
                                } else {
                                    console.log('No se encontraron horarios registrados para este alumno.');
                                }
                        
                        
                            }).catch(error => {
                                console.error('Error al obtener el horario del alumno:', error);
                            });




                            modal.style.top = `${rect.top + window.scrollY}px`;
                            modal.style.left = `${rect.left + window.scrollX}px`;
                            modal.style.display = "block";
                            closeModalBtn.onclick = () => closeModal();
                            function closeModal() {
                                modal.style.display = "none";
                            }
                        } else {
                            console.warn('Modal elements not found in the content');
                        }
                    });
                });

                if (alumnos.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4">No se encontraron alumnos.</td></tr>`;
                }

            } else {
                console.error('No se encontró el tbody de la tabla');
            }
        } else {
            console.error('Error al obtener los alumnos', response.message);
        }
    }).catch(error => {
        console.error('Error al ejecutar viewAlumnosInactivos:', error);
    });
}


document.getElementById('list_inactive_students').addEventListener('click', (e) => {
    e.preventDefault();
    act3.classList.toggle("active");
    act2.classList.remove("active");
    act.classList.remove("active");
    act4.classList.remove("active");
    act5.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");
    act7.classList.remove("active");
    loadAlumInactives('/view/alumnos_inactivos/list_inactive_students.html');
});

/**CARGAR VENTANA REGISTRAR ASISTENCIA */
function mostrarHora(h) {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');

    // Formato de la hora (HH:MM:SS)
    const horaActual = `${horas}:${minutos}`;

    // Actualizar el contenido del span con la hora actual
    return horaActual;
}

function loadRegisAsistencia(url, callback){
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const año = hoy.getFullYear();
    const fechaActual = `${dia}/${mes}/${año}`;
    console.log(fechaActual);
    window.electronAPI.loadFile(url).then(response =>  {
        if (!response.success) {
            console.error('Error loading content:', response.message);
            contentArea.innerHTML = `<p>Error loading content: ${response.message}</p>`;
            return;
        }
        contentArea.innerHTML = response.data;
        const f = contentArea.querySelector('#fecha');
        const h = contentArea.querySelector('#hora');
        h.textContent = mostrarHora(h);
        f.textContent = fechaActual;

        if (h) {
            function actualizarHora() {
                const ahora = new Date();
                const horas = ahora.getHours().toString().padStart(2, '0');
                const minutos = ahora.getMinutes().toString().padStart(2, '0');
                h.textContent = `${horas}:${minutos}`;
            }

            actualizarHora(); // Mostrar la hora inmediatamente
            setInterval(actualizarHora, 1000); // Actualizar cada segundo
        }

        /**Obtener lo que se esta registrando en el input */
        let inputNcontrol = contentArea.querySelector('#regisAsistencia');
        const btnRegisAsistenciaEnt = contentArea.querySelector('#regisEnt');
        const btnRegisAsistenciaSal = contentArea.querySelector('#regisSal');

        if(inputNcontrol){

            /**Registro manual */
            inputNcontrol.addEventListener('change', () => {
                //btnRegisAsistenciaEnt.disabled = inputNcontrol.value.trim() === ''; // Habilitar el botón si hay texto
                
                btnRegisAsistenciaEnt.addEventListener('click', async() => {
                    const idAlumno = inputNcontrol.value.trim(); // Obtener el código ingresado

                    if (idAlumno !== '') {
                        try {
                            // Llamar a la función IPC para registrar la asistencia
                            const respuestaSal = await window.electronAPI.regisAsistenciaEnt(idAlumno);

                            // Mostrar un mensaje de éxito o error
                            alert(respuestaSal.message);

                            // Limpiar el input y deshabilitar el botón
                            inputNcontrol.value = '';
                            setTimeout(() => inputNcontrol.focus(), 0);
                            
                            //btnRegisAsistenciaEnt.disabled = true;
                        } catch (error) {
                            console.error('Error al registrar entrada:', error);
                            alert('Ocurrió un error al registrar la entrada. Intenta nuevamente.');
                            setTimeout(() => inputNcontrol.focus(), 0);
                        }
                    }

                });
            });


            inputNcontrol.addEventListener('change',async() =>{
                btnRegisAsistenciaSal.addEventListener('click',async() =>{
                    console.log('btnRegistrar salidaaaa')
                    const idAlumnoSal = inputNcontrol.value.trim(); // Obtener el código ingresado
                    console.log('alumno: ',idAlumnoSal)
                    
                    if (idAlumnoSal !== '') {
                        console.log('entro al if: ',idAlumnoSal);
                        try {
                            console.log('entro al try: ',idAlumnoSal);
                            // Llamar a la función IPC para registrar la asistencia
                            const respuesta = await window.electronAPI.regisAsistenciaSal(idAlumnoSal);
                            //console.log('aqui estoy:',respuesta);
                            // Mostrar un mensaje de éxito o error
                            alert(respuesta.message);

                            // Limpiar el input y deshabilitar el botón
                            inputNcontrol.value = '';
                            setTimeout(() => {
                                inputNcontrol.focus();
                                console.log('Enfoque establecido en el input');
                            }, 0);
                            //btnRegisAsistenciaEnt.disabled = true;
                        } catch (error) {
                            console.error('Error al registrar salida:', error);
                            alert('Ocurrió un error al registrar la salida. Intenta nuevamente.');
                            setTimeout(() => inputNcontrol.focus(), 0);
                        }
                    }
                });
            });

            /**Con el lector de código */
            inputNcontrol.addEventListener('change', async (event)=>{
                const codigo = event.target.value.trim(); // Asume que este es el NumControl del alumno
                if (!codigo=='') {
                    const respuesta = await window.electronAPI.regisAsistenciaLector(codigo);
                    alert(respuesta.message);
                    event.target.value = ''; // Limpiar el campo después del registro
                }

            });
        }


        if (typeof callback === 'function') {
            callback();
        }

        })
        .catch(error => {
            console.error('Error loading content: ',error);
            contentArea.innerHTML = `<p>Error loading content: ${error.message}</p>`;
    });
}

document.getElementById('register_attendance').addEventListener('click', (e) => {
    e.preventDefault();
    act4.classList.toggle("active");
    act2.classList.remove("active");
    act3.classList.remove("active");
    act.classList.remove("active");
    act5.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");
    act7.classList.remove("active");
    loadRegisAsistencia('/view/registrar_asistencia/register_attendance.html');
    const element = document.getElementById('#hora'); 
    if (element) {
        console.log('Elemento cargado:', element);
    }
});


/**CARGAR VENTANA ASISTENCIA POR DIA */
function loadAsistencia(url){
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const año = hoy.getFullYear();
    const fechaActual = `${dia}/${mes}/${año}`;
    window.electronAPI.loadFile(url).then(response =>  {
        if (!response.success) {
            console.error('Error loading content:', response.message);
            contentArea.innerHTML = `<p>Error loading content: ${response.message}</p>`;
            return;
        }
        contentArea.innerHTML = response.data;
        const f = contentArea.querySelector('#fecha');
        f.textContent = fechaActual;

        /**Buscar alumno por numero de control o nombre*/
        const btnBuscar = contentArea.querySelector('#searchDay');
        if(btnBuscar){
            btnBuscar.addEventListener('input',()=>{
                const query = btnBuscar.value.trim().toLowerCase();
                loadTableDataAsistencias(query);
            });
        }
        loadTableDataAsistencias();

        })
        .catch(error => {
            console.error('Error loading content: ',error);
            contentArea.innerHTML = `<p>Error loading content: ${error.message}</p>`;
    });
}
/**Cargar tabla de las asistencias del dia */
function loadTableDataAsistencias(query = '') {
    window.electronAPI.viewAsistencia().then(response => {
        if (response.success) {
            let alumnos = response.alumnos || [];
            console.log('Datos del alumnos: ',alumnos);

            /**Parte de la busqueda */
            if (query) {
                alumnos = alumnos.filter(alumno =>
                    alumno.nombre.toLowerCase().includes(query) ||
                    alumno.mAsignada.toLowerCase().includes(query)
                );
            }
            // Buscar el tbody después de haber cargado el HTML
            let tableBody = contentArea.querySelector('#asistencias tbody');
            if (tableBody) {
                tableBody.innerHTML = '';  // Limpiar el contenido previo

                /*Llena la tabla con los datos*/
                alumnos.forEach(alumno => {
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${alumno.nombre}</td>
                        <td>${alumno.mAsignada}</td>
                        <td>${alumno.tiempoTotal}</td>
                    `;
                    tableBody.appendChild(row);
                });
                if (alumnos.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4">No se encontraron alumnos.</td></tr>`;
                }
            } else {
                console.error('No se encontró el tbody de la tabla');
            }
        } else {
            console.error('Error al obtener los datos', response.message);
        }
    }).catch(error => {
        console.error('Error al ejecutar viewAsistencia:', error);
    });
}

document.getElementById('attendance_for_day').addEventListener('click', (e) => {
    e.preventDefault();
    act5.classList.toggle("active");
    act2.classList.remove("active");
    act3.classList.remove("active");
    act.classList.remove("active");
    act4.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");
    act7.classList.remove("active");
    loadAsistencia('/view/attendance_for_day/attendanceDay.html');
});


/**CARGAR VENTANA DE REPORTES */
function loadReportes(url){
    window.electronAPI.loadFile(url).then(response =>  {
        if (!response.success) {
            console.error('Error loading content:', response.message);
            contentArea.innerHTML = `<p>Error loading content: ${response.message}</p>`;
            return;
        }
        contentArea.innerHTML = response.data;
        const btnGenerar = contentArea.querySelector('#generarReport');
        const alum =  contentArea.querySelector('#alumno');
        const nControl= contentArea.querySelector('#nControl');
        const fecha = contentArea.querySelector('#fechaInp');
        const mensual =  contentArea.querySelector('#mensual'); 
        const mes = contentArea.querySelector('#mes');
        const form = contentArea.querySelector('#formReport');
        const inputs = form.querySelectorAll('input');
        const estadoAlumRad = contentArea.querySelectorAll('input[name="status"]');
        let estadoAlum;
        let mesSelec;let alumOp;let mensualOp;
        estadoAlumRad.forEach(radio => {
            radio.addEventListener('change', () => {
                estadoAlum = contentArea.querySelector('input[name="status"]:checked').value;
                console.log('Estado:', estadoAlum);
            });
        });
        mes.addEventListener('change', () => {
            mesSelec = mes.value;
        });
        alum.addEventListener('change',()=>{
            alumOp = alum.checked;
        });
        console.log('selecciono: ',alumOp);
        mensual.addEventListener('change',()=>{
            mensualOp = mensual.checked;
        });
        //Extraer el año
        let anio = new Date().getFullYear();
        btnGenerar.addEventListener('click',async() =>{
            console.log('Evento del boton');
            /*console.log('alumno seleccionado: ',alum)*/
            if(alum.checked){
                /*console.log('alumno seleccionado')*/
                const datos = {
                    NumeroControl: nControl.value,
                    Fecha: fecha.value
                };
                try {
                    const respuesta = await window.electronAPI.generarReporteAlumno(datos);
                    console.log(respuesta);
                    if (respuesta) {
                        inputs.forEach(input => {
                            input.value = ''; 
                            setTimeout(() => {
                                input.focus();
                                console.log('Enfoque establecido en el input');
                            }, 0);
                        });
                        mes.value = '';
                        estadoAlumRad.forEach(radio => {
                            radio.checked = false;
                        });
                        alum.checked = false;
                        alert(`Reporte guardado exitosamente en: ${respuesta}`);
                    } else {
                        alert('El guardado del reporte fue cancelado.');
                    }
                } catch (error) {
                    alert('Error al generar el reporte.',error);
                    console.error(error);
                }

            }else{
                if(mensual.checked){
                    const datosM = {
                        Mes: mesSelec,
                        Estado: estadoAlum,
                        Anio: anio
                    };
                    try {
                        const respuestaM = await window.electronAPI.generarReporteMes(datosM);
                        if (respuestaM) {
                            mes.value = '';
                            inputs.forEach(input => {
                                input.value = ''; 
                            });
                            estadoAlumRad.forEach(radio => {
                                radio.checked = false;
                            });
                            mensual.checked=false;
                            alert(`Reporte guardado exitosamente en: ${respuestaM}`);
                        } else {
                            alert('El guardado del reporte fue cancelado.');
                        }
                    } catch (error) {
                        alert('Error al generar el reporte.');
                        console.error(error);
                    }
                    
                }
            }
            
        });

        })
        .catch(error => {
            console.error('Error loading content: ',error);
            contentArea.innerHTML = `<p>Error loading content: ${error.message}</p>`;
    });
}

document.getElementById('reports').addEventListener('click', (e) => {
    e.preventDefault();
    act6.classList.toggle("active");
    act2.classList.remove("active");
    act3.classList.remove("active");
    act.classList.remove("active");
    act4.classList.remove("active");
    act5.classList.remove("active");
    ini.classList.remove("active");
    act7.classList.remove("active");
    loadReportes('/view/reportes/reports.html');
});

document.getElementById('codigos').addEventListener('click', (e) => {
    e.preventDefault();
    act7.classList.toggle("active");
    act.classList.remove("active");
    act2.classList.remove("active");
    act3.classList.remove("active");
    act4.classList.remove("active");
    act5.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");

    loadCodigos('/view/qr_codigos/codigos.html');
});
function loadCodigos(url){
    window.electronAPI.loadFile(url).then(response =>  {
        if (!response.success) {
            console.error('Error loading content:', response.message);
            contentArea.innerHTML = `<p>Error loading content: ${response.message}</p>`;
            return;
        }
        contentArea.innerHTML = response.data;
        const btnGenerarCod = contentArea.querySelector('#btnGenerar');
        const btnDescargarImg = contentArea.querySelector('#btnDescargarQR');
        const numControl = contentArea.querySelector('#numControl');
        let img = contentArea.querySelector('#imgCodigo');
        let num;
        btnGenerarCod.addEventListener('click',async() =>{
            num = numControl.value;
            try {
                const respuestaCod = await window.electronAPI.generarCodigo(num);
                img.src = respuestaCod;
                console.log('respuesta cod: ',respuestaCod);
            } catch (error) {
                alert('Error al generar el codigo. Revisa la consola para más detalles.');
                console.error(error);
            }
        });
        btnDescargarImg.addEventListener('click',async()=>{
            try {
                const respuestaDesCod = await window.electronAPI.guardarCodigo(num);
                    if (respuestaDesCod) {
                        numControl.value = '';
                        alert(`Código descargado y guardado exitosamente en: ${respuestaDesCod}`);
                    } else {
                        alert('El guardado del código fue cancelado.');
                    }
            } catch (error) {
                
            }
        });

        })
        .catch(error => {
            console.error('Error loading content: ',error);
            contentArea.innerHTML = `<p>Error loading content: ${error.message}</p>`;
    });
}

/**Acessos al menu del dashboard */
document.getElementById('option1').addEventListener('click', (e) => {
    e.preventDefault();
    act.classList.toggle("active");
    act2.classList.remove("active");
    act3.classList.remove("active");
    act4.classList.remove("active");
    act5.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");
    loadAddUser('/view/register_alumnos/register_student.html');
    loadTableData();
});

document.getElementById('option2').addEventListener('click', (e) => {
    e.preventDefault();
    act2.classList.toggle("active");
    act.classList.remove("active");
    act3.classList.remove("active");
    act4.classList.remove("active");
    act5.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");
    loadAlumActives('/view/alumnos_activos/list_active_students.html');
});

document.getElementById('option3').addEventListener('click', (e) => {
    e.preventDefault();
    act3.classList.toggle("active");
    act2.classList.remove("active");
    act.classList.remove("active");
    act4.classList.remove("active");
    act5.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");
    loadAlumInactives('/view/alumnos_inactivos/list_inactive_students.html');
});

document.getElementById('option4').addEventListener('click', (e) => {
    e.preventDefault();
    act4.classList.toggle("active");
    act2.classList.remove("active");
    act3.classList.remove("active");
    act.classList.remove("active");
    act5.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");
    loadRegisAsistencia('/view/registrar_asistencia/register_attendance.html');
    mostrarHora();
    const element = document.getElementById('#hora'); 
    if (element) {
        console.log('Elemento cargado:', element);
    }
});

document.getElementById('option5').addEventListener('click', (e) => {
    e.preventDefault();
    act5.classList.toggle("active");
    act2.classList.remove("active");
    act3.classList.remove("active");
    act.classList.remove("active");
    act4.classList.remove("active");
    act6.classList.remove("active");
    ini.classList.remove("active");
    loadAsistencia('/view/attendance_for_day/attendanceDay.html');
});


document.getElementById('option6').addEventListener('click', (e) => {
    e.preventDefault();
    act6.classList.toggle("active");
    act2.classList.remove("active");
    act3.classList.remove("active");
    act.classList.remove("active");
    act4.classList.remove("active");
    act5.classList.remove("active");
    ini.classList.remove("active");
    loadReportes('/view/reportes/reports.html');
});