// src/components/UI/SensorDisplay.jsx
import styled from 'styled-components';

const SensorContainer = styled.div`
  text-align: center;
`;

const Value = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: ${({ warning, theme }) => 
    warning ? theme.colors.danger : theme.colors.text};
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  margin: 0.5rem 0;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background-color: ${({ warning, theme }) => 
    warning ? theme.colors.danger : theme.colors.success};
  width: ${({ percentage }) => percentage}%;
  transition: width 0.5s ease;
`;

const SensorDisplay = ({ 
  value, 
  unit, 
  icon, 
  min = 0, 
  max = 100, 
  warningThreshold = 80 
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const isWarning = value > warningThreshold;
  
  return (
    <SensorContainer>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        {icon}
      </div>
      
      <Value warning={isWarning}>
        {value} {unit}
      </Value>
      
      <ProgressBar>
        <Progress percentage={percentage} warning={isWarning} />
      </ProgressBar>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </SensorContainer>
  );
};

export default SensorDisplay;