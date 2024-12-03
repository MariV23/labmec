
    function mostrarHora() {
        const ahora = new Date();
        const horas = ahora.getHours().toString().padStart(2, '0');
        const minutos = ahora.getMinutes().toString().padStart(2, '0');
    
        // Formato de la hora (HH:MM:SS)
        const horaActual = `${horas}:${minutos}`;
    
        // Actualizar el contenido del span con la hora actual
        document.getElementById('hora').textContent = horaActual;
    }
    setInterval(mostrarHora, 1000);
    
    mostrarHora();

