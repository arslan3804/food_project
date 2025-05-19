import { useEffect, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import api from '../../services/api';

const wheelData = [
  { option: '5%', discount: 5 },
  { option: '7%', discount: 7 },
  { option: '8%', discount: 8 },
  { option: '10%', discount: 10 },
  { option: '12%', discount: 12 },
  { option: '15%', discount: 15 },
  { option: 'Пусто', discount: 0 },
];

export default function PromoCodes() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [hasAttempt, setHasAttempt] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [spinningResult, setSpinningResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/promo-codes/'),
      api.get('/promo-codes/has_attempt/')
    ])
      .then(([codesRes, attemptRes]) => {
        setPromoCodes(codesRes.data);
        setHasAttempt(attemptRes.data.has_attempt);
      })
      .catch(err => console.error('Ошибка:', err))
      .finally(() => setLoading(false));
  }, []);

  const spinWheel = () => {
  setSpinning(true);
  api.get('/promo-codes/current/')
    .then(res => {
      const result = res.data;
      setSpinningResult(result);

      const index = wheelData.findIndex(d => d.discount === result.discount_percent);
      setPrizeNumber(index !== -1 ? index : 0);
      setMustSpin(true);

      setHasAttempt(false);
    })
    .catch(() => {
      alert('Не удалось получить промокод');
      setSpinning(false);
    });
  };

  const onStopSpinning = () => {
    setMustSpin(false);
    setSpinning(false);

    if (spinningResult && spinningResult.discount_percent > 0) {
    setPromoCodes([spinningResult]);
  }
  };


  if (loading) return <p className="text-center mt-4">Загрузка...</p>;

  return (
    <div className="container mt-4 text-center">
      <h2>Активные промокоды</h2>

      {promoCodes.length === 0 ? (
        <p>Активных промокодов нет.</p>
      ) : (
        <ul className="list-group my-3">
          {promoCodes.map(({ code, discount_percent, expires_at }) => (
            <li key={code} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{code}</strong> — скидка {discount_percent}%
              </div>
              <small>Действует до: {new Date(expires_at).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
                })}
              </small>
            </li>
          ))}
        </ul>
      )}

      {hasAttempt && !spinning && (
        <button className="btn btn-primary mt-3" onClick={spinWheel}>
          Крутить рулетку
        </button>
      )}

      {spinning && (
        <div className="d-flex flex-column align-items-center mt-4">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={wheelData}
            backgroundColors={['#ffcc00', '#ff6666']}
            textColors={['#000']}
            onStopSpinning={onStopSpinning}
            outerBorderColor="#ccc"
            innerRadius={30}
          />
          <p className="mt-3">Крутим...</p>
        </div>
      )}
    </div>
  );
}
