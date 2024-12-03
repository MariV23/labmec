const {app,BrowserWindow,ipcMain,dialog} = require('electron/main')
const {getConnection} = require('./database');
const path = require('path');
const fs = require('fs')
const PDFDocument = require('pdfkit');
require('electron-reload')(__dirname);
const QRCode = require('qrcode');
//const { createCanvas, loadImage } = require('canvas');


let window;
let windDash;
let registerWindow;


function createWindow(){
    try {
        window = new BrowserWindow(
            {
                icon: __dirname + './view/assets/logo.jpg',
                width:800,
                height:600,
                webPreferences: {
                    preload: path.join(__dirname, 'preload.js'),
                    nodeIntegration:false,
                    contextIsolation: true,
                    enableRemoteModule: false
                }
            }
        );
        window.loadFile('src/view/login/index.html');
    } catch (error) {
        console.error('Error al crear la ventana: ',error);
    }
    
}

function windDashboard(usuario,email){
    windDash = new BrowserWindow(
        {
            icon: __dirname + './view/assets/logo.jpg',
            width:1650,
            height:850,
            webPreferences: {
                preload: path.join(__dirname,'preload.js'),
                nodeIntegration:false,
                contextIsolation: true,
                enableRemoteModule: false
            }
        }
    )
    windDash.loadFile('src/view/dashboard/dashboard.html');
    windDash.webContents.on('did-finish-load', () => {
        windDash.webContents.send('send-email', { usuario,email });
    });
    window.close();
}

function createRegisterWindow() {
    registerWindow = new BrowserWindow({
        icon: __dirname + './view/assets/logo.jpg',
        width: 1000,
        height: 650,
        webPreferences: {
            preload:path.join(__dirname,'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    registerWindow.loadFile('src/view/register/register.html');
    window.close();
}

/**Cargar archivo */
ipcMain.handle('load-file', async (event, filePath) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        return { success: true, data };
    } catch (err) {
        return { success: false, message: err.message };
    }
});

/**Guardar el horario seleccionado */

ipcMain.handle('guardarHorario', async (event, schedule,numControl) => {
    try {
        const conn = await getConnection();
        const alumnoId = numControl; //ID Alumno
        const results = await Promise.all(schedule.map(({ day, hour }) => {
            return conn.query('INSERT INTO horario (dia, hora,idAlumno) VALUES (?, ?, ?)', [day, hour,alumnoId]);
        }));
        if (results) {
            console.log('Registro exitoso del horario');
            
        } else {
            console.log('no se pudo registrar a la DB el horario');
        }
        console.log('Horario registrado');
    } catch (error) {
        console.error('Error al guardar horario:', error);
    }
});

ipcMain.handle('register-Student', async(event, {nombre,apellidos,nControl,correo,maquina,estado,fechaIngreso}) => {
    try {
        const conn = await getConnection();
            //Agregar un alumno a la tabla de la base de datos
            const result = await conn.query('INSERT INTO alumno (id_nControl,nombre, apellidos, nControl, correo, mAsignada,estado, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                [nControl,nombre, apellidos, nControl, correo, maquina, estado, fechaIngreso]);
    
            if (result.affectedRows > 0) {
                console.log("Alumno registrado exitosamente")
            } else {
                console.log('Error al registrar a el alumno en a la BD');
            }
    } catch (error) {
        console.log('Error al registrar a el alumno en a la  por:', error);
        
    }
});

ipcMain.handle('deleteAlumno', async (event, alumnoId) => {
    try {
        const conn = await getConnection();
        const result = await conn.query('DELETE FROM alumno WHERE nControl = ?', [alumnoId]);
        return { success: result.affectedRows > 0 };
    } catch (error) {
        console.error('Error deleting data:', error);
        return { success: false, message: 'Error al eliminar el alumno' };
    }
});

/**Editar alumno */
ipcMain.handle('getAlumnoById', async (event, alumnoId) => {
    try {
        const conn = await getConnection();
        const [result] = await conn.query('SELECT * FROM alumno WHERE nControl = ?', [alumnoId]);
        return result ? result : null;
    } catch (error) {
        console.error('Error fetching data for student:', error);
        return null;
    }
});
ipcMain.handle('getHorarioByAlumnoId', async (event, alumnoId) => {
    
    try {
        //console.log(alumnoId);
        const conn = await getConnection();
        const horarios = await conn.query('SELECT dia,hora FROM horario WHERE idAlumno = ?', [alumnoId]);
        //console.log(horarios);
        return { success: true, horarios };
    } catch (error) {
        console.error('Error obteniendo los datos del horario:', error);
        return { success: false, message: 'Error obteniendo los datos del horario' };
    }
});


ipcMain.handle('updateStudent', async (event, alumnoId, data) => {
    try {
        const conn = await getConnection();
        const result = await conn.query('UPDATE alumno SET nombre = ?, apellidos = ?, correo = ?, mAsignada = ?, estado = ?, fecha_Ingreso = ? WHERE nControl = ?', 
            [data.nombre, data.apellidos, data.correo, data.maquina, data.estado, data.fechaIngreso, alumnoId]);

        return { success: result.affectedRows > 0 };
    } catch (error) {
        console.error('Error updating student:', error);
        return { success: false, message: 'Error al actualizar el alumno' };
    }
});

ipcMain.handle('updateHorario', async (event, alumnoId, data) => {
    try {
        const conn = await getConnection();
        const result = await conn.query('UPDATE horario SET dia = ?, hora = ? WHERE nControl = ?', 
            [data.dia, data.hora, alumnoId]);

        return { success: result.affectedRows > 0 };
    } catch (error) {
        console.error('Error al actualizar horario:', error);
        return { success: false, message: 'Error al actualizar el horario' };
    }
});

/**Registrar asistencia de entrada en la base de datos */
ipcMain.handle('regisAsistenciaEnt',async(event,idAlumnoEnt) => {
    try {
        const fechaActual = new Date().toISOString().split('T')[0];
        const conn =await getConnection();
        // Verificar el último registro de asistencia del alumno
        const ultimoRegistro = await conn.query(`
            SELECT * 
            FROM registro_asistencia
            WHERE idAlumno = ? AND fecha = ? 
            ORDER BY horaEntrada DESC
            LIMIT 1
        `, [idAlumnoEnt, fechaActual]);
        console.log(ultimoRegistro)

        if (!ultimoRegistro.length || ultimoRegistro[0].horaSalida) {
            // Caso 1: No hay registro pendiente o el último ya tiene hora de salida
            // Registrar una nueva entrada
            await conn.query(`
                INSERT INTO registro_asistencia (idAlumno, fecha, horaEntrada)
                VALUES (?, CURRENT_DATE(), CURRENT_TIME())
            `, [idAlumnoEnt]);

            return { success: true, message: 'Entrada registrada correctamente.' };
        } else {
            /*
            // Caso 2: Existe un registro pendiente de salida
            await conn.query(`
                UPDATE registro_asistencia
                SET horaSalida = CURRENT_TIME()
                WHERE idregistro_Asistencia = ?
            `, [ultimoRegistro[0].idRegistro]);
            */
            return { success: true, message: 'Hay una salida pendiente por registrar, por favor ingresa tu salida' };
        }
    } catch (error) {
        console.error('Error al insertar la entrada:', error);
        return { success: false, message: 'Error al agregar la entrada' };
    }
})

/**Registrar asistencia de salida en la base de datos */
ipcMain.handle('regisAsistenciaSal',async(event,idAlumnoSal) => {
    console.log('Entraaquiii');
    try {
        
        const fechaActual = new Date().toISOString().split('T')[0];
        console.log('fecha sal: ',fechaActual);
        const conn = await getConnection();
        // Verificar el último registro de asistencia del alumno
        const ultimoRegistro = await conn.query(`
            SELECT * 
            FROM registro_asistencia
            WHERE idAlumno = ? AND fecha = ? 
            ORDER BY horaEntrada DESC
            LIMIT 1
        `, [idAlumnoSal, fechaActual]);
        /*
        console.log('Ultimo registro',ultimoRegistro[0]);
        console.log('ID del registro a actualizar:', ultimoRegistro[0].idregistro_Asistencia);
        console.log('Hora actual:', new Date().toLocaleTimeString());*/
        if (!ultimoRegistro.length || ultimoRegistro[0].horaSalida) {
            return { success: true, message: 'Antes registra tu entrada' };
        } else {
            // Caso 2: Existe un registro pendiente de salida
            await conn.query(`
                UPDATE registro_asistencia
                SET horaSalida = CURRENT_TIME()
                WHERE idregistro_Asistencia = ?
            `, [ultimoRegistro[0].idregistro_Asistencia]);
            return { success: true, message: 'Salida registrada correctamente.' };
        }
    } catch (error) {   
        console.error('Error al insertar la salida:', error);
        return { success: false, message: 'Error al agregar la salida' };
    }
})

/**Registrar asistencia con el lector*/
ipcMain.handle('regisAsistenciaLector',async(event,idAlumno) => {
    try {
        const fechaActual = new Date().toISOString().split('T')[0];
        const conn =await getConnection();
        // Verificar el último registro de asistencia del alumno
        const ultimoRegistro = await conn.query(`
            SELECT * 
            FROM registro_asistencia
            WHERE idAlumno = ? AND fecha = ? 
            ORDER BY horaEntrada DESC
            LIMIT 1
        `, [idAlumno, fechaActual]);

        if (!ultimoRegistro.length || ultimoRegistro[0].horaSalida) {
            // Caso 1: No hay registro pendiente o el último ya tiene hora de salida
            // Registrar una nueva entrada
            await conn.query(`
                INSERT INTO registro_asistencia (idAlumno, fecha, horaEntrada)
                VALUES (?, CURRENT_DATE(), CURRENT_TIME())
            `, [idAlumno]);

            return { success: true, message: 'Entrada registrada correctamente.' };
        } else {
            await conn.query(`
                UPDATE registro_asistencia
                SET horaSalida = CURRENT_TIME()
                WHERE idregistro_Asistencia = ?
            `, [ultimoRegistro[0].idregistro_Asistencia]);
            return { success: true, message: 'Salida registrada correctamente.' };
        }
    } catch (error) {
        console.error('Error al insertar la entrada:', error);
        return { success: false, message: 'Error al agregar la entrada' };
    }
})

app.whenReady().then(() => {

    /**Login */
    ipcMain.handle('login', async (event, { email, password }) => {
        try {
            const conn = await getConnection(); // Obtenemos la conexión a la BD
            const result = await conn.query('SELECT * FROM users WHERE correo = ?  OR nUsuario= ? AND contraseña = ?', [email, email,password]);
            
            if (result.length > 0) {
                /**Recuperar el usuario que inicio sesión */
                const user = result[0];
                windDashboard(user.nUsuario, user.correo);
                return { success: true, message: 'Usuario válido',usuario:user.nUsuario, email:user.correo };
            } else {
                return { success: false, message: 'Credenciales inválidas' };
            }
        } catch (error) {
            console.error('Error during login', error);
            return { success: false, message: 'Error during login' };
        }
    });

    ipcMain.handle('open-register-window', () => {
        createRegisterWindow(); // Abre la ventana de registro
    });
    //Regresar al logín desde la ventana registro
    ipcMain.handle('go-to-login', () => {
        if (registerWindow) {
            registerWindow.close();
        }else{
            if (windDash) {
                windDash.close();
            }}
        createWindow()  
    });

    /**Recuperar contraseña */

    ipcMain.handle('recuperar-password',async (event,{email}) => {

        console.log('estro aqui');
    try {
        
        const conn = await getConnection();
        const result = await conn.query('SELECT contraseña FROM users WHERE correo = ?', [email]);
        
        console.log('Resultado de la consulta:', result); 

        if (result.length > 0) {
            return { success: true, password: result[0].contraseña};
        } else {
            return { success: false, message: 'Correo no encontrado' };
        }
    } catch (error) {
        console.error('Error durante la recuperación', error);
        return { success: false, message: 'Error durante la recuperación' };
    }
    });
    createWindow()

    /**Registrar un usuario */
    ipcMain.handle('open-register', async (event,{nombre, apellidos, nControl, tel, email, nUser, password, pss}) => {
        try {
            if (password !== pss) {
                return { success: false, message: 'Las contraseñas no coinciden' };
            }
    
            const conn = await getConnection();
    
            // Insertar un nuevo usuario en la tabla 'users'
            const result = await conn.query('INSERT INTO users (nombre, apellidos, nControl, nTelefono, nUsuario,correo, contraseña) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                [nombre, apellidos, nControl, tel, nUser, email, password]);
    
            if (result.affectedRows > 0) {
                return { success: true, message: 'Usuario registrado exitosamente' };
            } else {
                return { success: false, message: 'Error al registrar el usuario' };
            }
        } catch (error) {
            console.error('Error during registration', error);
            return { success: false, message: 'Error durante el registro' };
        }
    
    });

    /**Datos de la tabla */
    ipcMain.handle('viewAlumnos', async () => {
        //console.log('Si entra aquiii:');
        try {
            const conn = await getConnection();
            const result = await conn.query('SELECT * FROM alumno'); 
            if (result.length > 0) {
                return { success: true, alumnos: result };
            } else {
                return { success: false, message: 'No se encontraron alumnos.' };
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return {success:false, message:'Error al obtener los alumnos'};
        }
    });

    /**Datos de la tabla de los alumnos activos*/
    ipcMain.handle('viewAlumnosActivos', async () => {
        //console.log('Si entra aquiii:');
        try {
            const conn = await getConnection();
            const result = await conn.query('SELECT nControl,nombre, mAsignada from alumno where estado="activo"'); 
            if (result.length > 0) {
                return { success: true, alumnos: result };
            } else {
                return { success: false, message: 'No se encontraron alumnos.' };
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return {success:false, message:'Error al obtener los alumnos'};
        }
    });

    /**Datos de la tabla de los alumnos inactivos*/
    ipcMain.handle('viewAlumnosInactivos', async () => {
        try {
            const conn = await getConnection();
            const result = await conn.query('SELECT nControl,nombre, mAsignada from alumno where estado="capacitacion"'); 
            if (result.length > 0) {
                return { success: true, alumnos: result };
            } else {
                return { success: false, message: 'No se encontraron alumnos.' };
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return {success:false, message:'Error al obtener los alumnos'};
        }
    });

    /**Datos de asistencia */
    ipcMain.handle('viewAsistencia', async () => {
        try {
            const fechaActual = new Date().toISOString().split('T')[0];
            const conn = await getConnection();
            const result = await conn.query('SELECT a.nombre,a.mAsignada,SEC_TO_TIME(FLOOR(SUM(TIMESTAMPDIFF(SECOND, ra.horaEntrada, ra.horaSalida)))) AS tiempoTotal FROM registro_asistencia ra JOIN alumno a ON ra.idAlumno = a.nControl WHERE ra.fecha = ? AND ra.horaSalida IS NOT NULL GROUP BY ra.idAlumno, ra.fecha',fechaActual); 
            if (result.length > 0) {
                return { success: true, alumnos: result };
            } else {
                return { success: false, message: 'No se encontraron datos.' };
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return {success:false, message:'Error al obtener los alumnos'};
        }
    });

    /**Generar los reportes por alumno*/
ipcMain.handle('generarReporteAlumno', async (event, datos) => {
    try {
        console.log("Datos: ",datos)
        console.log('Generando reporte');
        const conn = await getConnection();
        const result1 = await conn.query(
            `
                select id_nControl,nombre,apellidos,mAsignada from alumno  where id_nControl = ?
            `,
            [datos.NumeroControl]);
        console.log("Datos Alumno ",result1);
        const result2 = await conn.query(`
            SELECT 
                rA.fecha,
                rA.horaEntrada,
                rA.horaSalida 
            FROM alumno a 
            INNER JOIN registro_asistencia rA 
                ON a.id_nControl = rA.idAlumno 
            WHERE a.id_nControl = ? 
              AND DATE(rA.fecha) >= ? 
              AND DATE(rA.fecha) <= CURDATE();
            `,
            [datos.NumeroControl,datos.Fecha]); 

        console.log("result asistencia",result2);
        if (result2.length == 0) {
            throw new Error('No se encontró al alumno o no hay registros de asistencia en el rango de fechas especificado.');
        }
        const dAlum = result1;
        const alumno = result2;
        console.log(dAlum);
        //console.log("alumno:::: ",alumno);
    
        // Segunda consulta: Total de horas del alumno
        const totalHorasRow = await conn.query(
            `
            SELECT 
            idAlumno, 
            SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, horaEntrada, horaSalida))) AS tiempoTotal 
            FROM registro_asistencia 
            WHERE idAlumno = ? 
            GROUP BY idAlumno;
            `,
            [datos.NumeroControl]
        );
    
        const tiempoTotal = totalHorasRow[0].tiempoTotal;
        console.log("Tiempo total: ",tiempoTotal);
        // Mostrar diálogo para guardar archivo
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Guardar Reporte',
            defaultPath: `reporte-${datos.NumeroControl}.pdf`,
            filters: [
                { name: 'PDF Files', extensions: ['pdf'] }, //solo permite guardar como PDF
            ],
        });

        if (canceled || !filePath) {
            return null; // El usuario canceló
        }

        // Crear el documento PDF
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        const imagePath = path.join(__dirname, '/view/assets/logo.jpg');
        if (fs.existsSync(imagePath)) {
            doc.image(imagePath, {
                fit: [50, 50], // Ajusta el tamaño de la imagen si es necesario
                align: 'left', // Alinea horizontalmente
                valign: 'top' // Alinea verticalmente
            });
            doc.moveDown();
        } else {
            console.warn('La imagen no se encontró en la ruta especificada:', imagePath);
        }

        // Cabecera del reporte
        //doc.image('../assets/logo.jpg');
        doc.fontSize(18).text('Reporte Individual del Alumno', { align: 'center' });
        doc.moveDown();
        doc.fontSize(13).text(`Número de Control: ${dAlum[0].id_nControl}`);
        doc.text(`Nombre: ${dAlum[0].nombre} ${dAlum[0].apellidos}`);
        doc.text(`Máquina Asignada: ${dAlum[0].mAsignada}`);
        doc.moveDown();
        doc.text('Historial de Asistencias:');
        doc.moveDown();
        doc.text(`N°:    Fecha:             Hora Entrada:            HoraSalida:`);

        // Verificar que hay registros para agregar
        if (result2 && result2.length > 0) {
            result2.forEach((registro, index) => {
                // Formateamos la fecha como 'YYYY-MM-DD'
                const fechaFormateada = registro.fecha.toISOString().split('T')[0];
                doc.fontSize(12).text(
                    `#${index + 1}    ${fechaFormateada}            ${registro.horaEntrada}                    ${registro.horaSalida}`
                );
            });
        } else {
            doc.fontSize(12).text('No se encontraron registros de asistencia.');
        }

        doc.moveDown();
        doc.fontSize(14).text(`Tiempo Total Registrado: ${tiempoTotal}`);
        doc.moveDown();

        // Finalizar el documento
        doc.end();

        // Esperar a que el archivo termine de guardarse
        await new Promise((resolve) => writeStream.on('finish', resolve));

        // Retornar la ruta del archivo guardado
        return filePath;
    } catch (error) {
        console.error('Error generando el PDF:', error);
        throw error;
    }
});
/**Generar los reportes por mes*/
ipcMain.handle('generar-reporteMes', async (event, datos) => {
    try {
        //Consulta para reporte por mes
        console.log("Datos: ",datos)
        console.log('Generando reporte');
        const conn = await getConnection();
        const result1 = await conn.query(
            `
                select a.id_nControl, a.nombre,a.apellidos,a.mAsignada,SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, ra.horaEntrada, ra.horaSalida))) AS tiempoTotal from alumno a inner join registro_asistencia rA on rA.idAlumno  = a.id_nControl where month(rA.fecha) = ? and year(rA.fecha) = ? and a.estado= ? AND ra.horaSalida IS NOT NULL GROUP BY ra.idAlumno;
            `,
            [datos.Mes,datos.Anio,datos.Estado]);
        console.log("Datos alumnos ",result1);
        if (result1.length == 0) {
            throw new Error('No se encontraron a los alumnos o no hay registros de asistencia en el mes.');
        }

        // Mostrar diálogo para guardar archivo
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Guardar Reporte',
            defaultPath: `reporte-${Date.now()}.pdf`, // Nombre sugerido
            filters: [
                { name: 'PDF Files', extensions: ['pdf'] }, // Solo permite guardar como PDF
            ],
        });

        if (canceled || !filePath) {
            return null; // El usuario canceló
        }

        // Crear el documento PDF
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        const imagePath = path.join(__dirname, '/view/assets/logo.jpg');
        if (fs.existsSync(imagePath)) {
            doc.image(imagePath, {
                fit: [50, 50], // Ajusta el tamaño de la imagen si es necesario
                align: 'left', // Alinea horizontalmente
                valign: 'top' // Alinea verticalmente
            });
            doc.moveDown();
        } else {
            console.warn('La imagen no se encontró en la ruta especificada:', imagePath);
        }

        // Agregar contenido al PDF
        doc.fontSize(18).text('Reporte mensual', { align: 'center' });
        doc.moveDown();
        doc.fontSize(13).text('Asistencia del mes');
        doc.text(`N° Control:    Nombre:                            Máquina:            Tiempo Total:`)
        if (result1 && result1.length > 0) {
            result1.forEach((registro, index) => {
                const id = `#${registro.id_nControl}`.padEnd(12, ' '); // 10 caracteres para ID
                const nombre = `${registro.nombre} ${registro.apellidos}`.padEnd(40, ' '); // 30 caracteres para nombre
                const maquina = `${registro.mAsignada}`.padEnd(30, ' '); // 20 caracteres para máquina
                const tiempo = `${registro.tiempoTotal}`; // Tiempo no necesita relleno
            
                doc.fontSize(12).text(`${id}${nombre}${maquina}${tiempo}`);
            });
        } else {
            doc.fontSize(12).text('No se encontraron registros de asistencia.');
        }

        // Finalizar el documento
        doc.end();

        // Esperar a que el archivo termine de guardarse
        await new Promise((resolve) => writeStream.on('finish', resolve));

        // Retornar la ruta del archivo guardado
        return filePath;
    } catch (error) {
        console.error('Error generando el PDF:', error);
        throw error;
    }
});
/**Códigos QR */
ipcMain.handle('generarCodigo',async (event, numControl)=>{
    try {
        const qrCode = await QRCode.toDataURL(numControl);
        return qrCode; // Retorna el QR como base64
    } catch (err) {
        console.error('Error generando el código QR:', err);
        throw err;
    }
});

ipcMain.handle('guardarCodigo',async (event, dato) =>{
    try {
        /*
        const conn = await getConnection();
        const result1 = await conn.query(
            `
                select id_nControl, nombre,apellidos from alumno  where id_nControl = ?;`,
            [dato]);
        console.log("Datos alumnos cod: ",result1);
        const student = result1[0]; // Datos del estudiante
        const dataForQR = `ID: ${student.id_nControl}, Nombre: ${student.nombre} ${student.apellidos}`;
        const canvas = createCanvas(300,400);
        const ctx = canvas.getContext('2d');
        const qrCodeImage = await QRCode.toCanvas(canvas,dataForQR,{width:300})
           // Dibujar texto en el canvas (debajo del QR)
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        ctx.fillText(`ID: ${student.id_nControl}`, canvas.width / 2, 320); // Texto centrado debajo del QR
        ctx.fillText(`${student.nombre} ${student.apellidos}`, canvas.width / 2, 350);*/
        // Mostrar diálogo para seleccionar dónde guardar el archivo
        const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Guardar Código QR',
        defaultPath: `CódigoQR-${dato}.png`,
        filters: [
          { name: 'Imágenes', extensions: ['png'] },
        ],
      });
      if (canceled) {
        return { success: false, message: 'El usuario canceló la operación.' };
      }
  
      // Generar el QR y guardarlo en el archivo seleccionado
        await QRCode.toFile(filePath, dato);
        return { success: true, filePath };
    } catch (error) {
        console.error('Error al guardar el código QR:', err);
        return { success: false, message: err.message };
    }
});

})


//module.exports = { createWindow }

