import { Info } from 'lucide-react';
import './Disclaimer.css';

const Disclaimer = () => {
  return (
    <div className="disclaimer-banner">
      <Info size={16} />
      <span>
        This system is a prototype developed for academic and monitoring purposes only 
        and does not replace or integrate with official government election or Aadhaar systems.
      </span>
    </div>
  );
};

export default Disclaimer;
