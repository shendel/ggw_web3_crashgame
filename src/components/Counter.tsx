import React, { useEffect, useRef, useState } from 'react';
import BigNumber from "bignumber.js"

const Counter = (props) => {
  const {
    value,
    duration = 200,
    showPlus = false,
    prefix = '',
    toFixed = 2,
    hideOnZero = false
  } = props
  const [displayValue, setDisplayValue] = useState(value);
  const currentValue = useRef(value);

  useEffect(() => {
    if (value === currentValue.current) return;
    const start = currentValue.current;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newValue = Number(start) + (Number(end) - Number(start)) * progress;

      setDisplayValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentValue.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  if (hideOnZero && new BigNumber(displayValue).isEqualTo(0)) return null
  return (
    <>
      {showPlus && (
        <>
          {displayValue > 0 && (<>{`+`}</>)}
        </>
      )}
      {new BigNumber(displayValue).toFixed(toFixed)}
      {prefix}
    </>
  );
}

export default Counter