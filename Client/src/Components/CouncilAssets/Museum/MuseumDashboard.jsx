import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../Context';
import curatorDyllan from './curatorDyllan.png';

const ENEMY_RANKS = [
  { key: 'Minion',    color: '#8888a0' },
  { key: 'Captain',   color: '#5b9e5b' },
  { key: 'Champion',  color: '#c9a84c' },
  { key: 'Commander', color: '#4a8fbc' },
  { key: 'General',   color: '#c87840' },
  { key: 'Overlord',  color: '#c44040' },
  { key: 'Prophet',   color: '#8844cc' },
  { key: 'Emperor',   color: '#9b6bd4' },
  { key: 'God',       color: '#ffd700' },
];

function MuseumDashboard() {
  const navigate = useNavigate();
  const { killCounts } = useAppContext();

  const totalKills = ENEMY_RANKS.reduce((sum, { key }) => sum + (killCounts?.[key] || 0), 0);

  return (
    <div className="dashboard-page" style={{ '--advisor-color': '#c4714a' }}>
      <img src={curatorDyllan} alt="" className="advisor-char-img" />

      <div className="dashboard-header">
        <button className="dashboard-back" onClick={() => navigate('/council')}>← Council</button>
        <h1 className="dashboard-title">Curator Dyllan - The Museum</h1>
      </div>

      <div className="dashboard-box dashboard-box--standard">

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">Hall of Slain</div>
          <div className="dashboard-panel-content">
            <table className="museum-kill-table">
              <thead>
                <tr>
                  <th>Enemy Type</th>
                  <th>Slain</th>
                </tr>
              </thead>
              <tbody>
                {ENEMY_RANKS.map(({ key, color }) => {
                  const count = killCounts?.[key] || 0;
                  return (
                    <tr key={key} className={count > 0 ? 'museum-kill-row--active' : ''}>
                      <td>
                        <span className="museum-kill-dot" style={{ background: color }} />
                        {key}
                      </td>
                      <td className="museum-kill-count">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="museum-kill-total">
                  <td>Total</td>
                  <td className="museum-kill-count">{totalKills}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">Gallery</div>
          <div className="dashboard-panel-content">
            <p className="dashboard-panel-placeholder">Gallery coming soon.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MuseumDashboard;
