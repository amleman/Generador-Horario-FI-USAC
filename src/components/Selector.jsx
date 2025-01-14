import React, { useState, useEffect } from 'react';

const Selector = ({ addCourse, selectedCourses }) => {
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [cursosFiltrados, setCursosFiltrados] = useState([]);

    useEffect(() => {
        const cargarCursos = async () => {
            try {
                const response = await fetch('/data/todosLosCursos.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCursos(data);
                setCursosFiltrados(data);
            } catch (error) {
                console.error('Error al cargar los cursos:', error);
            }
        };

        cargarCursos();
    }, []);

    useEffect(() => {
        const resultados = cursos.filter((curso) =>
            curso.toLowerCase().includes(busqueda.toLowerCase())
        );
        setCursosFiltrados(resultados);
    }, [busqueda, cursos]);

    const handleChange = (event) => {
        setCursoSeleccionado(event.target.value);
    };

    const handleAgregarCurso = () => {
        if (cursoSeleccionado && !selectedCourses.includes(cursoSeleccionado)) { // Verifica si ya existe
            addCourse(cursoSeleccionado);
            setCursoSeleccionado('');
        }
        else if (selectedCourses.includes(cursoSeleccionado)){
            alert("Este curso ya ha sido agregado.")
            setCursoSeleccionado('');
        }
    };

    return (
        <div className="selector">
            <div>
                <h3>Seleccione los cursos que desea asignarse en el semestre</h3>
                <div className='selector-container'>
                    <div className="buscador">
                        <label htmlFor="buscador">Buscar curso: </label>
                        <input
                            className='estilo-input'
                            id="buscador"
                            type="text"
                            placeholder="Escriba el nombre del curso"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="selector-cursos">
                        <label htmlFor="course">Cursos: </label>
                        <select id="course" className='estilo-input' value={cursoSeleccionado} onChange={handleChange}>
                            <option value="" disabled>Seleccione un curso</option>
                            {cursosFiltrados.map((curso, index) => (
                                <option key={index} value={curso}>
                                    {curso}
                                </option>
                            ))}
                        </select>
                        <button
                            className='button-add'
                            onClick={handleAgregarCurso} // Usa la nueva función
                            disabled={!cursoSeleccionado}
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <h3>Cursos Seleccionados:</h3>
                <ul>
                    {selectedCourses.map((course, index) => (
                        <li key={index}>{course}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Selector;