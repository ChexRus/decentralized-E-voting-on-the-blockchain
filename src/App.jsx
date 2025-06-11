import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract } from 'wagmi';
import votingABI from './votingABI.json';

const CONTRACT_ADDRESS = '0xE075d9002833791d120bA509aceE340661500bD0';

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, isPending, error: writeError } = useWriteContract();

  const [candidateName, setCandidateName] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [description, setDescription] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [showVoters, setShowVoters] = useState(false);

  const { data: admin, error: adminError, isLoading: adminLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: votingABI,
    functionName: 'admin',
  });
  const isAdmin = address && address.toLowerCase() === admin?.toLowerCase();

  const { data: candidates, error: candidatesError, isLoading: candidatesLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: votingABI,
    functionName: 'getAllCandidates',
  });

  const { data: voters, error: votersError, isLoading: votersLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: votingABI,
    functionName: 'getAllRegisteredVoters',
  });

  const { data: winner, error: winnerError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: votingABI,
    functionName: 'getWinner',
  });

  const handleRegisterCandidate = () => {
    if (candidateName) {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: votingABI,
        functionName: 'registerCandidate',
        args: [candidateName],
      });
      setCandidateName('');
    }
  };

  const handleRegisterVoter = () => {
    if (voterAddress) {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: votingABI,
        functionName: 'registerVoter',
        args: [voterAddress],
      });
      setVoterAddress('');
    }
  };

  const handleSetDescription = () => {
    if (candidateId && description) {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: votingABI,
        functionName: 'setCandidateDescription',
        args: [BigInt(candidateId), description],
      });
      setCandidateId('');
      setDescription('');
    }
  };

  const handleVote = (candidateId) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: votingABI,
      functionName: 'vote',
      args: [BigInt(candidateId)],
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Roboto', sans-serif",
        background: 'linear-gradient(to bottom, #4facfe, #00f2fe)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '48px',
          fontWeight: 'bold',
          background: 'linear-gradient(to bottom, #ffffff, #0000ff, #ff0000)',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        GolosWeb3
      </div>

      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '100px',
        }}
      >
        {isConnected ? (
          <button
            onClick={disconnect}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#c82333')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#dc3545')}
          >
            Отключиться
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#218838')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#28a745')}
          >
            Подключиться через Metamask
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          padding: '80px 30px 30px',
          maxWidth: '800px',
          margin: '0 auto',
          background: 'linear-gradient(to bottom, #ffffff, #f0f8ff)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          {isConnected && (
            <p style={{ color: '#333333', fontSize: '16px' }}>
              <strong>Подключен:</strong> {address}
            </p>
          )}
          <div style={{ marginTop: '10px' }}>
            {adminLoading ? (
              <p style={{ color: '#666666' }}>Загрузка адреса администратора...</p>
            ) : adminError ? (
              <p style={{ color: '#666666' }}>
                {adminError.message.includes('reverted') 
                  ? 'Ошибка доступа к администратору' 
                  : 'Ошибка при загрузке администратора'}
              </p>
            ) : (
              <p style={{ color: '#333333' }}>
                <strong>Администратор:</strong> {admin}
              </p>
            )}
          </div>
          {isConnected && isAdmin && (
            <button
              onClick={() => setIsAdminPanelOpen(true)}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                backgroundColor: '#1e90ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#4682b4')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#1e90ff')}
            >
              Админ-панель
            </button>
          )}
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2f4f4f', marginBottom: '15px' }}>Кандидаты</h2>
        {candidatesLoading ? (
          <p style={{ color: '#666666' }}>Загрузка кандидатов...</p>
        ) : candidatesError ? (
          <p style={{ color: '#666666' }}>
            {candidatesError.message.includes('No candidates registered yet')
              ? 'Кандидаты еще не зарегистрированы'
              : 'Ошибка при загрузке кандидатов'}
          </p>
        ) : candidates && candidates.length > 0 ? (
          <ul>
            {candidates.map((candidate, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  background: 'linear-gradient(to right, #e6f0fa, #f7f9fc)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  marginBottom: '15px',
                }}
              >
                <span style={{ color: '#333333' }}>
                  <strong>{index}.</strong> {candidate.name} - Голосов:{' '}
                  {candidate.voteCount ? candidate.voteCount.toString() : '0'} -{' '}
                  {candidate.description || 'Нет описания'}
                </span>
                <button
                  onClick={() => handleVote(index)}
                  disabled={isPending || !isConnected}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: isPending || !isConnected ? '#a9a9a9' : '#1e90ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isPending || !isConnected ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseOver={(e) => {
                    if (!isPending && isConnected) e.target.style.backgroundColor = '#4682b4';
                  }}
                  onMouseOut={(e) => {
                    if (!isPending && isConnected) e.target.style.backgroundColor = '#1e90ff';
                  }}
                >
                  {isPending ? 'Голосование...' : 'Проголосовать'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#666666' }}>Кандидаты еще не зарегистрированы</p>
        )}

        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2f4f4f', marginBottom: '15px', marginTop: '20px' }}>
          Зарегистрированные голосующие
        </h2>
        <button
          onClick={() => setShowVoters(!showVoters)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1e90ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            marginBottom: '15px',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#4682b4')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#1e90ff')}
        >
          {showVoters ? 'Скрыть голосующих' : 'Показать голосующих'}
        </button>
        {showVoters && (
          <>
            {votersLoading ? (
              <p style={{ color: '#666666' }}>Загрузка голосующих...</p>
            ) : votersError ? (
              <p style={{ color: '#666666' }}>
                {votersError.message.includes('No voters registered yet')
                  ? 'Голосующие еще не зарегистрированы'
                  : 'Ошибка при загрузке голосующих'}
              </p>
            ) : voters && voters.length > 0 ? (
              <ul>
                {voters.map((voter, index) => (
                  <li
                    key={index}
                    style={{
                      padding: '10px',
                      background: 'linear-gradient(to right, #e6f0fa, #f7f9fc)',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      color: '#333333',
                    }}
                  >
                    {voter}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666666' }}>Голосующие еще не зарегистрированы</p>
            )}
          </>
        )}

        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2f4f4f', marginBottom: '15px', marginTop: '20px' }}>
          Победитель
        </h2>
        {winnerError ? (
          <p style={{ color: '#666666' }}>
            {winnerError.message.includes('No candidates registered') 
              ? 'Победитель еще не определен (нет кандидатов)' 
              : 'Ошибка при загрузке победителя'}
          </p>
        ) : winner && winner[0] ? (
          <p style={{ color: '#333333' }}>
            {winner[0]} - {winner[1] ? winner[1].toString() : '0'} голосов
          </p>
        ) : (
          <p style={{ color: '#666666' }}>Победитель еще не определен</p>
        )}

        {writeError && <p style={{ color: 'red', marginTop: '20px' }}>Ошибка: {writeError.message}</p>}
      </div>

      {isConnected && isAdmin && isAdminPanelOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            background: 'linear-gradient(to bottom, #ffffff, #f0f8ff)',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 1000,
            transition: 'opacity 0.3s',
            opacity: isAdminPanelOpen ? 1 : 0,
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2f4f4f', marginBottom: '20px' }}>Админ-панель</h2>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Имя кандидата"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '16px',
              }}
            />
            <button
              onClick={handleRegisterCandidate}
              disabled={isPending}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: isPending ? '#a9a9a9' : '#1e90ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => {
                if (!isPending) e.target.style.backgroundColor = '#4682b4';
              }}
              onMouseOut={(e) => {
                if (!isPending) e.target.style.backgroundColor = '#1e90ff';
              }}
            >
              {isPending ? 'Регистрация...' : 'Зарегистрировать кандидата'}
            </button>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              placeholder="Адрес голосующего (0x...)"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '16px',
              }}
            />
            <button
              onClick={handleRegisterVoter}
              disabled={isPending}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: isPending ? '#a9a9a9' : '#1e90ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => {
                if (!isPending) e.target.style.backgroundColor = '#4682b4';
              }}
              onMouseOut={(e) => {
                if (!isPending) e.target.style.backgroundColor = '#1e90ff';
              }}
            >
              {isPending ? 'Регистрация...' : 'Зарегистрировать голосующего'}
            </button>
          </div>
          <div>
            <input
              type="number"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              placeholder="ID кандидата"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '16px',
              }}
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание кандидата"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '16px',
              }}
            />
            <button
              onClick={handleSetDescription}
              disabled={isPending}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: isPending ? '#a9a9a9' : '#1e90ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => {
                if (!isPending) e.target.style.backgroundColor = '#4682b4';
              }}
              onMouseOut={(e) => {
                if (!isPending) e.target.style.backgroundColor = '#1e90ff';
              }}
            >
              {isPending ? 'Обновление...' : 'Обновить описание'}
            </button>
          </div>
          <button
            onClick={() => setIsAdminPanelOpen(false)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              marginTop: '20px',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#c82333')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#dc3545')}
          >
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
}

export default App;