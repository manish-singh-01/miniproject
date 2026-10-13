import './Emergency.css';

const SERVICES = [
  { icon: '🚓', name: 'Police', number: '112', desc: 'For law enforcement and emergency security.' },
  { icon: '🚑', name: 'Ambulance', number: '108', desc: 'Medical emergencies and urgent assistance.' },
  { icon: '🚒', name: 'Fire Brigade', number: '101', desc: 'Fire, rescue and hazardous material.' },
  { icon: '🌊', name: 'Disaster Mgmt', number: '1078', desc: 'NDMA national disaster helpline.' },
  { icon: '👩‍⚕️', name: 'Women Helpline', number: '1091', desc: 'Women in distress emergency support.' },
  { icon: '🏥', name: 'Health Helpline', number: '104', desc: 'Medical advice and ambulance services.' },
];

const TIPS = [
  { icon: '📱', tip: 'Keep your phone charged during emergencies.' },
  { icon: '🏠', tip: 'Know your nearest shelter location before disaster strikes.' },
  { icon: '💧', tip: 'Store at least 3 days of drinking water per person.' },
  { icon: '📋', tip: 'Keep important documents in a waterproof bag.' },
  { icon: '👨‍👩‍👧', tip: 'Have a family emergency meeting point agreed upon.' },
  { icon: '🔦', tip: 'Always keep a flashlight and first-aid kit ready.' },
];

const Emergency = () => (
  <div className="emergency-page">
    <div className="emergency-page__hero">
      <p className="tagline">Quick Access</p>
      <h1>📞 Emergency Services</h1>
      <p>One-tap access to all emergency helplines. Save these numbers!</p>
    </div>

    <div className="section">
      <div className="section-header">
        <h2>Emergency Helplines</h2>
        <p>Tap any card to call directly from your device.</p>
      </div>
      <div className="grid-3">
        {SERVICES.map(({ icon, name, number, desc }) => (
          <a key={number} href={`tel:${number}`} className="service-card">
            <div className="service-card__icon">{icon}</div>
            <div className="service-card__body">
              <h3>{name}</h3>
              <p>{desc}</p>
            </div>
            <div className="service-card__number">{number}</div>
          </a>
        ))}
      </div>

      <div className="section-header" style={{ marginTop: '64px' }}>
        <h2>🛡️ Emergency Preparedness Tips</h2>
        <p>Be ready before disaster strikes.</p>
      </div>
      <div className="grid-3">
        {TIPS.map(({ icon, tip }) => (
          <div key={tip} className="tip-card">
            <span className="tip-card__icon">{icon}</span>
            <p>{tip}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Emergency;
