import React from 'react';

const generateTimeIntervals = () => {
  const intervals = [
    "07:10 - 08:00",
    "08:00 - 08:50",
  ];
  let current = new Date("1970-01-01T09:00:00");
  const endDate = new Date("1970-01-01T22:00:00");

  while (current < endDate) {
    const next = new Date(current);
    next.setMinutes(current.getMinutes() + 50);
    intervals.push(
      `${current.toTimeString().slice(0, 5)} - ${next.toTimeString().slice(0, 5)}`
    );
    current = next;
  }

  return intervals;
};

const timeIntervals = generateTimeIntervals();

const Grid = ({ schedule }) => {
  const days = ['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const isInInterval = (interval, start, end) => {
    const [intervalStart, intervalEnd] = interval.split(" - ");
    return (
      (start >= intervalStart && start < intervalEnd) || // Clase empieza dentro del intervalo
      (end > intervalStart && end <= intervalEnd) || // Clase termina dentro del intervalo
      (start <= intervalStart && end >= intervalEnd) // Clase abarca todo el intervalo
    );
  };

  return (
    <div className='table-container'>
      <table border="1">
        <thead>
          <tr>
            {days.map((day, index) => (
              <th key={index}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeIntervals.map((interval, intervalIndex) => (
            <tr key={intervalIndex}>
              <td>{interval}</td>
              {days.slice(1).map((day, dayIndex) => {
                const daySchedule = schedule[day];
                if (daySchedule) {
                  const coursesInInterval = Object.entries(daySchedule)
                    .flatMap(([hour, courses]) =>
                      courses.filter(course =>
                        isInInterval(interval, course.inicio, course.final)
                      )
                    );
                  if (coursesInInterval.length > 0) {
                    return (
                      <td key={dayIndex}>
                        <ul>
                          {coursesInInterval.map((course, index) => (
                            <li key={index} className={course.star === "laboratorio" ? "laboratorio" : ""}>
                              {course.curso} ({course.seccion})
                            </li>
                          ))}
                        </ul>
                      </td>
                    );
                  }
                }
                return <td key={dayIndex}></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
  );
};

export default Grid;
