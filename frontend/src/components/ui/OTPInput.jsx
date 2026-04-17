import { useEffect, useRef } from "react";

const OTP_LENGTH = 6;

const OTPInput = ({ value, onChange, disabled = false }) => {
  const refs = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || "");

  useEffect(() => {
    refs.current = refs.current.slice(0, OTP_LENGTH);
    if (!value && !disabled) {
      refs.current[0]?.focus();
    }
  }, [value, disabled]);

  const focusIndex = (index) => {
    refs.current[index]?.focus();
    refs.current[index]?.select();
  };

  const setDigits = (nextDigits) => {
    onChange(nextDigits.join("").slice(0, OTP_LENGTH));
  };

  const handleChange = (index, rawValue) => {
    const clean = rawValue.replace(/\D/g, "");

    if (!clean) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    if (clean.length > 1) {
      const merged = [...digits];
      clean.slice(0, OTP_LENGTH).split("").forEach((digit, offset) => {
        const targetIndex = index + offset;
        if (targetIndex < OTP_LENGTH) merged[targetIndex] = digit;
      });
      setDigits(merged);
      focusIndex(Math.min(index + clean.length, OTP_LENGTH - 1));
      return;
    }

    const next = [...digits];
    next[index] = clean;
    setDigits(next);

    if (index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusIndex(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) focusIndex(index - 1);
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) focusIndex(index + 1);
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] || "");
    setDigits(next);
    focusIndex(Math.min(pasted.length - 1, OTP_LENGTH - 1));
  };

  return (
    <div className="otp-input-group" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          className="otp-digit"
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
