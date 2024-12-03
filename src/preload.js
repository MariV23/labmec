const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    recoverPassword: (email) => ipcRenderer.invoke('recuperar-password', { email }),
    login: (obj) => ipcRenderer.invoke('login', obj),
    sendUsuarioToDashboard: (usuario, email) => ipcRenderer.send('send-email', { usuario, email }),
    openRegisterWindow: () => ipcRenderer.invoke('open-register-window'),
    openLoginWindow: () => ipcRenderer.invoke('go-to-login'),
    registerUser: (data) => ipcRenderer.invoke('open-register', data),
    closeCurrentWindow: () => ipcRenderer.invoke('close-window'),
    loadFile: (filePath) => ipcRenderer.invoke('load-file', filePath),
    viewAlumnos: () => ipcRenderer.invoke('viewAlumnos'),
    registerStudent: (data) => ipcRenderer.invoke('register-Student', data),
    guardarHorario: (schedule, numControl) => ipcRenderer.invoke('guardarHorario', schedule, numControl),
    buscarAlumno: (data) => ipcRenderer.invoke('search-Student', data),
    deleteAlumno: (alumnoId) => ipcRenderer.invoke('deleteAlumno', alumnoId),
    getAlumnoById: (alumnoId) => ipcRenderer.invoke('getAlumnoById', alumnoId),
    updateStudent: (alumnoId, data) => ipcRenderer.invoke('updateStudent', alumnoId, data),
    getHorarioByAlumnoId: (alumnoId) => ipcRenderer.invoke('getHorarioByAlumnoId', alumnoId),
    updateHorario: (alumnoId, datos) => ipcRenderer.invoke('updateHorario', alumnoId, datos),
    viewAlumnosActivos: () => ipcRenderer.invoke('viewAlumnosActivos'),
    viewAlumnosInactivos: () => ipcRenderer.invoke('viewAlumnosInactivos'),
    regisAsistenciaEnt: (idAlumnoEnt) => ipcRenderer.invoke('regisAsistenciaEnt', idAlumnoEnt),
    regisAsistenciaSal: (idAlumnoSal) => ipcRenderer.invoke('regisAsistenciaSal', idAlumnoSal),
    regisAsistenciaLector: (idAlumno) => ipcRenderer.invoke('regisAsistenciaLector', idAlumno),
    viewAsistencia: () => ipcRenderer.invoke('viewAsistencia'),
    generarReporteAlumno: (datos) => ipcRenderer.invoke('generarReporteAlumno', datos),
    generarReporteMes: (datos) => ipcRenderer.invoke('generar-reporteMes', datos),
    generarCodigo: (numControl) => ipcRenderer.invoke('generarCodigo', numControl),
    guardarCodigo: (dato) => ipcRenderer.invoke('guardarCodigo', dato),

    on: (channel, callback) => ipcRenderer.on(channel, callback)
});