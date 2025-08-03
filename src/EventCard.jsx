import React from 'react';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-AU', options);
  };

  return (
    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg shadow-sm mb-4">
      <h4 className="text-lg font-bold text-purple-800">{event.summary}</h4>
      <p className="text-purple-700">{formatDate(event.start)}</p>
    </div>
  );
};

export default EventCard;