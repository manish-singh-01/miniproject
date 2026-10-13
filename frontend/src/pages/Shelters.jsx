import { useState, useEffect } from 'react';
import { shelterService } from '../services/services';
import './Shelters.css';

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    loadAll();
    // Try to get user location
    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      setUserCoords({ lat: coords.latitude, lng: coords.longitude });
    });
  }, []);

  const loadAll = async () => {
    try {
      const { data } = await shelterService.getAll();
      setShelters(data);
    } catch {
      setShelters([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNearby = async () => {
    if (!userCoords) return;
    setLoading(true);
    try {
      const { data } = await shelterService.getNearby(userCoords.lat, userCoords.lng);
      setShelters(data);
      setNearbyMode(true);
    } catch {
      setShelters([]);
    } finally {
      setLoading(false);
    }
  };

  const DEMO_SHELTERS = [
    { _id: '1', name: 'Community Relief Centre', address: 'Roorkee, Uttarakhand', capacity: 500, occupancy: 234, contact: '01332-123456', facilities: { food: true, water: true, medical: true, beds: true } },
    { _id: '2', name: 'Emergency Shelter Block A', address: 'Haridwar, Uttarakhand', capacity: 300, occupancy: 100, contact: '01334-567890', facilities: { food: true, water: true, medical: false, beds: true } },
    { _id: '3', name: 'Community School Shelter', address: 'Dehradun, Uttarakhand', capacity: 800, occupancy: 456, contact: '0135-234567', facilities: { food: true, water: true, medical: true, beds: false } },
  ];

  const displayShelters = shelters.length > 0 ? shelters : DEMO_SHELTERS;

  const getOccupancyColor = (shelter) => {
    const pct = (shelter.occupancy / shelter.capacity) * 100;
    if (pct > 80) return '#ef4444';
    if (pct > 50) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className="shelters-page">
      <div className="shelters-page__hero">
        <p className="tagline">Find Help Nearby</p>
        <h1>🏥 Relief Centres & Shelters</h1>
        <p>Locate available shelters, their capacity, and facilities near you.</p>
        <div className="shelters-hero__actions">
          <button className="btn btn-primary" onClick={loadNearby} disabled={!userCoords}>
            📍 Find Nearest to Me
          </button>
          {nearbyMode && (
            <button className="btn btn-secondary" onClick={() => { loadAll(); setNearbyMode(false); }}>
              Show All
            </button>
          )}
        </div>
        {!userCoords && <p className="gps-hint">Allow location access to find nearby shelters</p>}
      </div>

      <div className="section">
        {nearbyMode && <p className="nearby-label">📍 Showing shelters nearest to your location</p>}

        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="shelters-grid">
            {displayShelters.map((shelter) => {
              const occupancyPct = Math.round((shelter.occupancy / shelter.capacity) * 100);
              const color = getOccupancyColor(shelter);
              return (
                <div key={shelter._id} className="shelter-card">
                  <div className="shelter-card__header">
                    <h3>{shelter.name}</h3>
                    <span
                      className="availability-badge"
                      style={{ '--color': color }}
                    >
                      {occupancyPct < 80 ? 'Available' : 'Near Full'}
                    </span>
                  </div>
                  <p className="shelter-card__address">📍 {shelter.address}</p>

                  <div className="shelter-card__capacity">
                    <div className="capacity-bar">
                      <div
                        className="capacity-bar__fill"
                        style={{ width: `${Math.min(occupancyPct, 100)}%`, background: color }}
                      />
                    </div>
                    <span style={{ color }}>{shelter.occupancy}/{shelter.capacity} occupied</span>
                  </div>

                  <div className="shelter-card__facilities">
                    {shelter.facilities?.food && <span className="facility">🍲 Food</span>}
                    {shelter.facilities?.water && <span className="facility">💧 Water</span>}
                    {shelter.facilities?.medical && <span className="facility">🏥 Medical</span>}
                    {shelter.facilities?.beds && <span className="facility">🛏️ Beds</span>}
                  </div>

                  <a href={`tel:${shelter.contact}`} className="shelter-card__contact btn btn-ghost">
                    📞 {shelter.contact}
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shelters;
