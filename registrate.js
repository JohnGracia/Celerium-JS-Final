document.addEventListener("DOMContentLoaded", () => {
    agregarLogoCelerium();

    function agregarLogoCelerium() {
        const logo = document.createElement("img");
        logo.src = "./celerium-galgo.png";
        logo.alt = "Logo Celerium";
        logo.style.width = "200px";
        logo.style.display = "block";
        logo.style.margin = "1rem auto";

        const contenedor = document.getElementById("formulario");
        document.body.insertBefore(logo, contenedor);
    }

    const opcionesClases = [
        { veces: 1, precio: 64000 },
        { veces: 2, precio: 96000 },
        { veces: 3, precio: 120000 }
    ];

    function caracteresValidos(valor) {
        return /^[a-zA-Z\s]+$/.test(valor);
    }

    const datosGuardados = JSON.parse(localStorage.getItem('inscripcionData'));
    if (datosGuardados) {
        mostrarResumen(datosGuardados);
    } else {
        mostrarFormulario();
    }

    function mostrarFormulario(datos = null) {
        const formularioDiv = document.getElementById("formulario");
        formularioDiv.style.display = "block";
        const resumenDiv = document.getElementById("resumen");
        resumenDiv.style.display = "none";

        formularioDiv.innerHTML = `
            <form id="inscripcionForm">
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" required value="${datos?.nombre || ''}">

                <label for="apellido">Apellido:</label>
                <input type="text" id="apellido" required value="${datos?.apellido || ''}">

                <label for="edad">Edad:</label>
                <input type="number" id="edad" required value="${datos?.edad || ''}">

                <label for="diasClase">¿Cuántos días a la semana deseas tomar clases?</label>
                <select id="diasClase">
                    <option value="1">1 día ($64000)</option>
                    <option value="2">2 días ($96000)</option>
                    <option value="3">3 días ($120000)</option>
                    <option value="personalizada">Personalizada ($50000 por hora)</option>
                </select>

                <div id="personalizadoHorasDiv" style="display: none; margin-top: 1rem;">
                    <label for="horas">¿Cuántas horas por semana?</label>
                    <input type="number" id="horas" min="1" placeholder="Ej: 2" value="${datos?.clasesSeleccionadas?.veces === 'Personalizada' ? datos.clasesSeleccionadas.horas : ''}">
                </div>

                <button type="submit">Enviar</button>
            </form>
        `;

        const select = document.getElementById("diasClase");
        const horasDiv = document.getElementById("personalizadoHorasDiv");

        if (datos?.clasesSeleccionadas?.veces === "Personalizada") {
            horasDiv.style.display = "block";
        }

        select.value = datos?.clasesSeleccionadas?.veces?.toString().toLowerCase() || "1";

        select.addEventListener("change", () => {
            horasDiv.style.display = select.value === "personalizada" ? "block" : "none";
        });

        const form = document.getElementById("inscripcionForm");

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const nombre = document.getElementById("nombre").value.trim();
            const apellido = document.getElementById("apellido").value.trim();
            const edad = parseInt(document.getElementById("edad").value);
            const diasClase = select.value;

            if (!caracteresValidos(nombre) || !caracteresValidos(apellido)) {
                Swal.fire("Error", "El nombre y apellido deben contener solo letras.", "error");
                return;
            }

            if (isNaN(edad) || edad <= 0) {
                Swal.fire("Error", "La edad debe ser un número válido y mayor a 0.", "error");
                return;
            }

            let clasesSeleccionadas;
            let valorPagar = 0;

            if (diasClase === "personalizada") {
                const horas = parseInt(document.getElementById("horas").value);
                if (isNaN(horas) || horas <= 0) {
                    Swal.fire("Error", "Por favor, ingresa una cantidad válida de horas.", "error");
                    return;
                }

                clasesSeleccionadas = {
                    veces: "Personalizada",
                    horas,
                    precio: 50000
                };
                valorPagar = horas * 50000;
            } else {
                clasesSeleccionadas = opcionesClases.find(opcion => opcion.veces.toString() === diasClase);
                valorPagar = clasesSeleccionadas ? clasesSeleccionadas.precio : 0;
            }

            const datosInscripcion = {
                nombre,
                apellido,
                edad,
                clasesSeleccionadas,
                valorPagar
            };

            localStorage.setItem('inscripcionData', JSON.stringify(datosInscripcion));
            mostrarResumen(datosInscripcion);
        });
    }

    function mostrarResumen(datos) {
        const formularioDiv = document.getElementById("formulario");
        const resumenDiv = document.getElementById("resumen");

        formularioDiv.style.display = "none";
        resumenDiv.style.display = "block";

        resumenDiv.innerHTML = `
            <h2>Resumen de inscripción:</h2>
            <p><strong>Nombre:</strong> ${datos.nombre}</p>
            <p><strong>Apellido:</strong> ${datos.apellido}</p>
            <p><strong>Edad:</strong> ${datos.edad} años</p>
            <p><strong>Clases:</strong> ${datos.clasesSeleccionadas.veces === "Personalizada"
                ? `Personalizada - ${datos.clasesSeleccionadas.horas} horas por semana`
                : `${datos.clasesSeleccionadas.veces} día(s) a la semana`
            }</p>
            <p><strong>Valor a pagar:</strong> $${datos.valorPagar}</p>
            <button id="confirmarBtn">Confirmar Inscripción</button>
            <button id="editarBtn">Editar Datos</button>
            <button id="pagoBtn">Acceder al Pago en Línea</button>
        `;

        document.getElementById("confirmarBtn").addEventListener("click", async () => {
            try {
                Swal.fire({
                    title: "Enviando inscripción...",
                    icon: "info",
                    showConfirmButton: false,
                    didOpen: () => Swal.showLoading()
                });

                const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(datos)
                });

                if (!response.ok) throw new Error("Error al enviar los datos");

                const result = await response.json();

                Swal.fire("¡Inscripción Exitosa!", `Tu inscripción fue enviada correctamente. ID: ${result.id}`, "success");

                localStorage.removeItem('inscripcionData');
            } catch (error) {
                Swal.fire("Error", "No se pudo completar la inscripción. Inténtalo más tarde.", "error");
            }
        });

        document.getElementById("editarBtn").addEventListener("click", () => {
            mostrarFormulario(datos);
        });

        document.getElementById("pagoBtn").addEventListener("click", async () => {
            Swal.fire({
                title: "Procesando pago...",
                text: "Por favor espera un momento",
                icon: "info",
                showConfirmButton: false,
                timer: 2000,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await new Promise(resolve => setTimeout(resolve, 2000));

                const data = {
                    monto: datos.valorPagar,
                    transaccionId: "ABC123456"
                };

                Swal.fire("Pago exitoso", `Tu pago de $${data.monto} ha sido procesado correctamente.\nID: ${data.transaccionId}`, "success");
            } catch (error) {
                Swal.fire("Error", "Ocurrió un error al procesar el pago simulado.", "error");
            }
        });
    }
});