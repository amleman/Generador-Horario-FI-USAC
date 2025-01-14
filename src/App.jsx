import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Selector from './components/Selector';
import Grid from './components/Grid';
import './styles/main.css';

const App = () => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [sections, setSections] = useState([]);
  const [extraInfo, setExtraInfo] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [removedEntries, setRemovedEntries] = useState([]);
  const apiUrl = 'api-generador-horario-fi-usac-production.up.railway.app';

  const addCourse = (course) => {
    if (!selectedCourses.includes(course)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const generateSchedule = async () => {
    setLoading(true);
    setError(null);
    setShowExtraInfo(false); // Ocultar info extra al generar nuevo horario

    try {
      const cursos_disponibles = selectedCourses.map(course => course.slice(0, 4));
      const requestBody = { cursos_disponibles };

      const response = await fetch(`${apiUrl}/horario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      setShowExtraInfo(true);

      // Procesar datos DESPUÉS de recibir la respuesta
      if (data && Object.keys(data).length > 0) {
        const allCourses = Object.values(data).flatMap(day => Object.values(day).flat());
        setAvailableCourses(Array.from(new Set(allCourses.map(course => course.curso))));
      } else {
          setAvailableCourses([]);
          setSections([]);
          setExtraInfo([]);
      }
      setSchedule(data);

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelection = (event) => {
    setSelectedCourseName(event.target.value);
    setSelectedSection(""); // Reiniciar la selección de sección al cambiar el curso

    if (event.target.value && schedule) {
        const allCourses = Object.values(schedule).flatMap(day => Object.values(day).flat());
        const selectedCourseData = allCourses.filter(course => course.curso === event.target.value);
        setSections(Array.from(new Set(selectedCourseData.map(course => course.seccion))));
    } else {
        setSections([]);
        setExtraInfo([]);
    }
  };

  const handleSectionSelection = (event) => {
    setSelectedSection(event.target.value);
    if (selectedCourseName && schedule && event.target.value) {
        const allCourses = Object.values(schedule).flatMap(day => Object.values(day).flat());
        const selectedCourseData = allCourses.filter(course => course.curso === selectedCourseName && course.seccion === event.target.value);

        // CORRECCIÓN: Tomar solo el primer elemento
        const firstCourseData = selectedCourseData[0];

        if (firstCourseData) { // Verificar que exista firstCourseData
            setExtraInfo([{
                horaInicio: firstCourseData.inicio,
                horafinal: firstCourseData.final,
                catedratico: firstCourseData.catedratico,
                auxiliar: firstCourseData.aux,
                star: firstCourseData.star,
                restricciones: firstCourseData.restricciones,
                salon: firstCourseData.salon,
            }]);
            setShowExtraInfo(true);
        } else {
            setExtraInfo([]);
            setShowExtraInfo(false);
        }
    } else {
        setExtraInfo([]);
        setShowExtraInfo(false);
    }
  };
  
  // Aqui empieza la logica de los botones para agregar y esconder cursos en la tabla
  const handleHideCourse = useCallback(() => {
    if (!selectedCourseName || !selectedSection) return;

    setSchedule((prevSchedule) => {
      const updatedSchedule = {};

      for (const day in prevSchedule) {
        updatedSchedule[day] = {};
        for (const hour in prevSchedule[day]) {
          updatedSchedule[day][hour] = prevSchedule[day][hour].filter(
            (course) =>
              course.curso !== selectedCourseName ||
              course.seccion !== selectedSection
          );
          if (updatedSchedule[day][hour].length === 0) {
            delete updatedSchedule[day][hour];
          }
        }
        if (Object.keys(updatedSchedule[day]).length === 0) {
          delete updatedSchedule[day];
        }
      }

      return updatedSchedule;
    });

    setRemovedEntries((prev) => [
      ...prev,
      { curso: selectedCourseName, seccion: selectedSection },
    ]);
  }, [selectedCourseName, selectedSection]);

  const handleShowCourse = useCallback(() => {
    if (!selectedCourseName || !selectedSection) return;

    const removedEntry = removedEntries.find(
      (entry) =>
        entry.curso === selectedCourseName && entry.seccion === selectedSection
    );

    if (removedEntry) {
      setSchedule((prevSchedule) => {
        const updatedSchedule = {};
        for (const day in prevSchedule) {
          updatedSchedule[day] = {...prevSchedule[day]};
          for (const hour in prevSchedule[day]) {
            updatedSchedule[day][hour] = [...(prevSchedule[day][hour] || [])];
            const coursesAtHour = updatedSchedule[day][hour];
            const matchingCourse = coursesAtHour.find(
              (course) =>
                course.curso === removedEntry.curso &&
                course.seccion === removedEntry.seccion
            );

            if (!matchingCourse) {
              updatedSchedule[day][hour].push(removedEntry);
            }
          }
        }
        return updatedSchedule;
      });

      setRemovedEntries((prev) =>
        prev.filter(
          (entry) =>
            entry.curso !== removedEntry.curso ||
            entry.seccion !== removedEntry.seccion
        )
      );
    }
  }, [selectedCourseName, selectedSection, removedEntries]);

  const renderExtraInfo = () => (
    <ul>
      {extraInfo.map((info, index) => (
        <React.Fragment key={index}> {/* Usar React.Fragment para evitar un div extra */}
          <li>
            <strong>Hora:</strong> {info.horaInicio || "No disponible"} - {info.horafinal || "No disponible"}
          </li>
          <li>
              <strong>Catedrático:</strong> {info.catedratico || "No disponible"}
          </li>
          <li>
              <strong>Auxiliar:</strong> {info.auxiliar || "No disponible"}
          </li>
          <li>
              <strong>Tipo de clase:</strong> {info.star || "No disponible"}
          </li>
          <li>
              <strong>Restricciones:</strong> {info.restricciones || "No disponible"}
          </li>
          <li>
              <strong>Salón:</strong> {info.salon || "No disponible"}
          </li>
        </React.Fragment>
      ))}
    </ul>
  );

  return (
    <div className='container'>
      <Header title="Horarios Facultad de Ingenieria" />
      <div className="beta-notice">
        <h2>Beta Inicial</h2>
        <p>
          Estamos en una versión beta inicial del programa. ¡Todos los comentarios son bienvenidos! Tu opinión nos ayuda a mejorar.
        </p>
        <a 
          href="https://forms.gle/h1Nv6qpSgWtvbxJN8" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="beta-link"
        >
          Haz clic aquí para enviar tus comentarios
        </a>
      </div>
      <div className="fixed-left">
        Creado por Anthony
      </div>
      <Selector addCourse={addCourse} selectedCourses={selectedCourses} />
      <button className='button-add' onClick={generateSchedule} disabled={selectedCourses.length === 0 || loading}>
        {loading ? 'Generando...' : 'Generar Horario'}
      </button>
      <hr className="linea-divisoria"></hr>

      {showExtraInfo && (
        <div className='horario-editor'>
          <p>Las opciones a continuación son para editar el contenido del horario</p>
          <div className='checkbox-lab'>
            <input type="checkbox" id="laboratorio" name="laboratorio" />
            <label htmlFor="laboratorio"> Laboratorio</label>
          </div>
          <br />
          <div className='seleccion-cursos'>
            <label htmlFor="disponibles">Disponibles:</label>
            <select id="disponibles" name="disponibles" className='estilo-input' onChange={handleCourseSelection} value={selectedCourseName}>
              <option value="">Seleccionar</option>
              {availableCourses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <label htmlFor="secciones">Secciones:</label>
            <select id="secciones" name="secciones" className='estilo-input' onChange={handleSectionSelection} value={selectedSection}> {/* Nuevo onChange */}
              <option value="">Seleccionar</option>
              {sections.map((section, index) => (
                <option key={index} value={section}>
                    {section}
                </option>
              ))}
            </select>
          </div>
          <div className='botones-modificadores'>
            <button className='button-add' onClick={handleHideCourse} disabled={!selectedCourseName || !selectedSection}>
              Ocultar
            </button>
            <button className='button-add' onClick={handleShowCourse} disabled={!selectedCourseName || !selectedSection}>
              Mostrar
            </button>
          </div>
          <div className='info-extra'>
            <label>Información extra:</label>
            {renderExtraInfo()}
          </div>
        </div>
      )}

      {Object.keys(schedule).length > 0 && <Grid schedule={schedule} />}

    </div>
  );
};

export default App;