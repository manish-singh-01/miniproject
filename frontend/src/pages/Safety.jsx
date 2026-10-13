import './Safety.css';

const GUIDES = [
  {
    icon: '🌊', type: 'Flood Safety', color: '#3b82f6',
    before: ['Move valuables to upper floors', 'Store food, water and medicines', 'Know your evacuation route', 'Keep emergency contacts handy'],
    during: ['Move to higher ground immediately', 'Do not walk through flowing water', 'Avoid contact with floodwater', 'Stay tuned to emergency broadcasts'],
    after: ['Return home only when authorities say safe', 'Check for structural damage', 'Boil water before drinking', 'Watch out for contaminated food'],
  },
  {
    icon: '🌍', type: 'Earthquake Safety', color: '#f97316',
    before: ['Secure heavy furniture and appliances', 'Keep an emergency kit ready', 'Know the safe spots in each room', 'Practice Drop, Cover, Hold drills'],
    during: ['Drop to hands and knees', 'Take Cover under sturdy furniture', 'Hold on until shaking stops', 'Stay away from windows and doors'],
    after: ['Check for injuries and provide first aid', 'Expect aftershocks', 'Do not use elevators', 'Inspect utilities before use'],
  },
  {
    icon: '🌀', type: 'Cyclone Safety', color: '#8b5cf6',
    before: ['Reinforce doors, windows and roofs', 'Stock up on emergency supplies', 'Identify the nearest cyclone shelter', 'Keep battery-operated radio handy'],
    during: ['Stay indoors away from windows', 'Secure loose objects outside', 'Follow official updates closely', 'Keep pets inside'],
    after: ['Do not go out until all-clear issued', 'Beware of damaged power lines', 'Avoid flooded roads', 'Report damage to authorities'],
  },
  {
    icon: '🔥', type: 'Fire Safety', color: '#ef4444',
    before: ['Install smoke detectors', 'Keep fire extinguishers accessible', 'Plan and practice escape routes', 'Never leave cooking unattended'],
    during: ['Alert everyone and call 101', 'Crawl low under smoke', 'Use stairs, not elevators', 'Close doors to slow fire spread'],
    after: ['Do not re-enter until firefighters clear', 'Contact insurance immediately', 'Watch for re-ignition', 'Seek temporary shelter if needed'],
  },
];

const Safety = () => {
  return (
    <div className="safety-page">
      <div className="safety-page__hero">
        <p className="tagline">Be Prepared</p>
        <h1>🛡️ Safety Guidelines</h1>
        <p>Learn what to do before, during, and after every type of disaster.</p>
      </div>

      <div className="section">
        <div className="guides-grid">
          {GUIDES.map((guide) => (
            <div key={guide.type} className="guide-card" style={{ '--guide-color': guide.color }}>
              <div className="guide-card__header">
                <span className="guide-card__icon">{guide.icon}</span>
                <h2>{guide.type}</h2>
              </div>
              <div className="guide-card__phases">
                {[
                  { phase: 'Before', steps: guide.before, icon: '⏰' },
                  { phase: 'During', steps: guide.during, icon: '⚡' },
                  { phase: 'After', steps: guide.after, icon: '✅' },
                ].map(({ phase, steps, icon }) => (
                  <div key={phase} className="phase">
                    <div className="phase__label">
                      <span>{icon}</span>
                      <strong>{phase}</strong>
                    </div>
                    <ul className="phase__steps">
                      {steps.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Safety;
