import React from 'react';
import PropTypes from 'prop-types';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function Calendar({
  value, onChange, minDate, maxDate,
}) {
  return (
    <ReactCalendar
      onChange={onChange}
      value={value}
      minDate={minDate}
      maxDate={maxDate}
      calendarType="US"
      locale="en-US"
      tileDisabled={({ date }) => date < new Date(1900, 0, 1)}
      navigationLabel={({
        date, label, locale, view,
      }) => label}
      prevLabel="‹"
      nextLabel="›"
      prev2Label="«"
      next2Label="»"
      aria-label="Calendar"
    />
  );
}

Calendar.propTypes = {
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
};

Calendar.defaultProps = {
  value: new Date(),
  minDate: undefined,
  maxDate: undefined,
};

export default Calendar;
