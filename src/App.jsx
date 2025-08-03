// Filename: src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import NewsCard from './NewsCard';
import EventCard from './EventCard';

// StaffNetwork Component
const StaffNetwork = ({ staff, onStaffClick }) => {
  const svgRef = useRef(null);
  const nodesContainerRef = useRef(null);
  const width = 800;
  const height = 600;
  const simulationRef = useRef(null);
  const nodesDataRef = useRef([]);

  const memoizedStaff = React.useMemo(() => staff, [staff]);

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("line").remove();

    if (!simulationRef.current) {
      simulationRef.current = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(70))
        .force("x", d3.forceX(width / 2).strength(0.01))
        .force("y", d3.forceY(height / 2).strength(0.01));
    }

    const simulation = simulationRef.current;
    const newNodes = memoizedStaff.map(d => ({ ...d }));

    const oldNodesMap = new Map(nodesDataRef.current.map(d => [d.id, d]));
    newNodes.forEach(node => {
      const oldNode = oldNodesMap.get(node.id);
      if (oldNode) {
        Object.assign(node, { x: oldNode.x, y: oldNode.y, vx: oldNode.vx, vy: oldNode.vy });
      } else {
        Object.assign(node, { x: width / 2 + (Math.random() - 0.5) * 10, y: height / 2 + (Math.random() - 0.5) * 10 });
      }
    });

    const nodesContainer = d3.select(nodesContainerRef.current);

    const nodeDivs = nodesContainer.selectAll(".staff-node")
      .data(newNodes, d => d.id)
      .join(
        enter => {
          const div = enter.append("div")
            .attr("class", "staff-node absolute flex flex-col items-center justify-center text-center")
            .style("width", "60px").style("height", "60px")
            .style("border-radius", "50%").style("background-color", "#AEC6CF")
            .style("background-size", "cover").style("background-position", "center")
            .style("border", "2px solid #4F46E5").style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
            .style("cursor", "pointer").style("opacity", 0)
            .style("transform", "scale(0.5)")
            .on("click", (event, d) => onStaffClick(d));

          div.append("div").attr("class", "w-full h-full rounded-full")
            .style("background-image", d => `url(${d.photo})`)
            .style("background-size", "cover").style("background-position", "center");
          div.append("span").attr("class", "text-xs font-semibold text-gray-800 mt-1 whitespace-nowrap")
            .style("position", "absolute").style("top", "65px").text(d => d.name);

          div.transition().duration(500).ease(d3.easeElasticOut)
            .style("opacity", 1).style("transform", "scale(1)");

          return div;
        },
        update => update,
        exit => exit.transition().duration(300).ease(d3.easeLinear)
          .style("opacity", 0).style("transform", "scale(0.5)").remove()
      )
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    simulation.nodes(newNodes).on("tick", () => {
      nodeDivs.style("left", d => `${d.x - 30}px`).style("top", d => `${d.y - 30}px`);
    });

    nodesDataRef.current = newNodes;
    simulation.alpha(0.5).restart();

    return () => { simulation.stop(); };
  }, [memoizedStaff, onStaffClick]);

  return (
    <div className="relative w-full h-[600px] flex justify-center items-center overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 bg-gray-50 rounded-lg shadow-inner border border-gray-200"></svg>
      <div ref={nodesContainerRef} className="absolute inset-0"></div>
    </div>
  );
};

// Staff Profile Modal Component
const StaffProfileModal = ({ staff, onClose }) => {
  if (!staff) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="flex flex-col items-center text-center mb-4">
          <img src={staff.photo} alt={staff.name} className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg mb-4" onError={(e) => { e.target.src="https://placehold.co/128x128/AEC6CF/000000?text=No+Photo"; }}/>
          <h2 className="text-2xl font-bold text-indigo-800">{staff.name}</h2>
          <p className="text-md text-gray-600">Years at RAH: {staff.startYear} - {staff.endYear}</p>
        </div>
        <div className="text-gray-700 text-base leading-relaxed">
          <h3 className="text-xl font-semibold text-indigo-700 mb-2">About {staff.name.split(' ')[0]}</h3>
          <p className="whitespace-pre-wrap">{staff.Bio || "No biography available yet."}</p>
        </div>
      </div>
    </div>
  );
};


// Main App Component
function App() {
  const [staffData, setStaffData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 30); // Default to 30 years ago
  const [minSliderYear, setMinSliderYear] = useState(1960);
  const [maxSliderYear, setMaxSliderYear] = useState(new Date().getFullYear());
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState(null);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState(null);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  const GOOGLE_SHEET_STAFF_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOJ_2QH2IbRx7aPgNX3cizzFlGTrX5lMJxc8HjvmIu50jC9auJzKWyAsZB4JZvFTeaEIRQjo17UC8r/pub?gid=0&single=true&output=csv";
  const GOOGLE_SHEET_NEWS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOJ_2QH2IbRx7aPgNX3cizzFlGTrX5lMJxc8HjvmIu50jC9auJzKWyAsZB4JZvFTeaEIRQjo17UC8r/pub?gid=1356740728&single=true&output=csv";
  const GOOGLE_CALENDAR_EMBED_URL = "https://calendar.google.com/calendar/embed?src=7c6f2ac4d6ba4eae4e1d42304ef0ce92c7a578dbc7753d7492545e49f3317758%40group.calendar.google.com&ctz=Australia%2FAdelaide";
  const GOOGLE_APPS_SCRIPT_EVENTS_URL = "https://script.google.com/macros/s/AKfycbyrnuDs44TiDaqAqAJIeHlwmMGFPbn09PzbreJeCsmQzZ8EeHOEyW2NgssmxgtPq9h7DQ/exec";
  
  // Fetch Staff Data
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const data = await d3.csv(GOOGLE_SHEET_STAFF_URL);
        const parsedData = data.map(row => ({
          ...row,
          startYear: parseInt(row.startYear, 10) || null,
          endYear: parseInt(row.endYear, 10) || null,
          bio: row.Bio,
        })).filter(staff => staff.id && staff.name && staff.startYear && staff.endYear);

        setStaffData(parsedData);

        if (parsedData.length > 0) {
            const allYears = parsedData.flatMap(d => [d.startYear, d.endYear]);
            if (allYears.length > 0) {
              const minYear = Math.min(...allYears);
              const maxYear = Math.max(...allYears);
              const mostRecentStartYear = Math.max(...parsedData.map(d => d.startYear));
              setMinSliderYear(minYear);
              setMaxSliderYear(maxYear);
              setSelectedYear(mostRecentStartYear); // Set initial year to the most recent start year
            }
        }
      } catch (e) {
        setStaffError(`Failed to load staff data. Check browser console for details.`);
        console.error("Staff fetch error:", e);
      } finally {
        setStaffLoading(false);
      }
    };
    fetchStaffData();
  }, [GOOGLE_SHEET_STAFF_URL]);

  // Fetch News Data
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const data = await d3.csv(GOOGLE_SHEET_NEWS_URL);
        const parsedNews = data.map(row => {
          return {
            headline: row.title,
            date: new Date(row.date),
            content: row.content,
            image: row.imageUrl,
          };
        });
        setNews(parsedNews);
      } catch (e) {
        setNewsError("Failed to load news data.");
        console.error("News fetch error:", e);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNewsData();
  }, [GOOGLE_SHEET_NEWS_URL]);

  // Fetch Events Data
  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_EVENTS_URL);
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        // Sort events to show the soonest first
        const sortedEvents = data.sort((a, b) => new Date(a.start) - new Date(b.start));
        setEvents(sortedEvents);
      } catch (e) {
        setEventsError("Failed to load events data.");
        console.error("Events fetch error:", e);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEventsData();
  }, [GOOGLE_APPS_SCRIPT_EVENTS_URL]);

  const filteredStaff = staffData.filter(staff => selectedYear >= staff.startYear && selectedYear <= staff.endYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 p-4 sm:p-6 flex flex-col items-center">
      <header className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-200 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-800 mb-4 drop-shadow-sm">
          Royal Adelaide Hospital Retired Staff Network
        </h1>
        <p className="text-lg text-gray-700">Connecting our valued former colleagues.</p>
         <nav className="mt-6 flex flex-wrap justify-center gap-4">
           <a href="#staff-network-section" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-md">Staff Network</a>
           <a href="#news-section" className="px-6 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors shadow-md">News</a>
           <a href="#events-section" className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors shadow-md">Events</a>
         </nav>
      </header>

      <section id="staff-network-section" className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg border border-blue-200 mb-8">
        <h2 className="text-3xl font-semibold text-indigo-700 mb-6 text-center">Our Staff Network</h2>
        <div className="flex flex-col w-full">
          <div className="w-full p-4 mb-6 rounded-xl bg-gray-50 border border-gray-200">
            <label htmlFor="year-slider" className="block text-xl font-semibold text-indigo-700 mb-2 text-center">Select Year: <span className="font-bold text-indigo-600">{selectedYear}</span></label>
            <input id="year-slider" type="range" min={minSliderYear} max={maxSliderYear} value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex-1 min-h-[600px] flex flex-col justify-center items-center">
            {staffLoading ? <p>Loading staff data...</p> : staffError ? <p className="text-red-500">{staffError}</p> : <StaffNetwork staff={filteredStaff} onStaffClick={setSelectedStaffProfile} />}
          </div>
        </div>
      </section>

      <section id="news-section" className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg border border-green-200 mb-8">
        <h2 className="text-3xl font-semibold text-green-700 mb-6 text-center">Latest News</h2>
        {newsLoading ? (
          <p>Loading news...</p>
        ) : newsError ? (
          <p className="text-red-500">{newsError}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article, index) => (
              <NewsCard key={index} article={article} />
            ))}
          </div>
        )}
      </section>

      <section id="events-section" className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg border border-purple-200 mb-8">
        <h2 className="text-3xl font-semibold text-purple-700 mb-6 text-center">Upcoming Events</h2>
        <div className="mb-8">
          {eventsLoading ? (
            <p>Loading events...</p>
          ) : eventsError ? (
            <p className="text-red-500">{eventsError}</p>
          ) : events.length > 0 ? (
            events.map(event => <EventCard key={event.uid} event={event} />)
          ) : (
            <p>No upcoming events found.</p>
          )}
        </div>
        <h3 className="text-2xl font-semibold text-purple-700 mb-4 text-center">Full Events Calendar</h3>
        <iframe
          src={GOOGLE_CALENDAR_EMBED_URL}
          style={{ borderWidth: 0 }}
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="no"
          title="Events Calendar"
        ></iframe>
      </section>

      <StaffProfileModal staff={selectedStaffProfile} onClose={() => setSelectedStaffProfile(null)} />
    </div>
  );
}

export default App;