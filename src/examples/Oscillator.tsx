import React, { useEffect, useContext, useState } from "react";
import context from "../components/Context";

// https://madewithlove.com/blog/software-engineering/creating-a-declarative-oscillator-component-with-react-hooks/

export default ({ frequency = 130, type = "sine" } = {}) => {
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  const { ctx } = useContext(context);

  useEffect(() => {
    const oscillator = ctx.createOscillator();

    oscillator.frequency.value = frequency;
    oscillator.type = type as OscillatorType;

    oscillator.start();
    oscillator.connect(ctx.destination);

    setOscillator(oscillator);

    return () => {
      oscillator.stop();
      oscillator.disconnect();
    };
  }, []);

  useEffect(() => {
    if (oscillator) {
      oscillator.frequency.value = frequency;
    }
  }, [frequency]);

  return null;
};
