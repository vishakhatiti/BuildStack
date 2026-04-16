const Input = ({ label, id, error = "", hint = "", className = "", ...rest }) => (
  <label htmlFor={id} className="field-label">
    <span>{label}</span>
    <input id={id} className={`input-field ${error ? "is-error" : ""} ${className}`.trim()} {...rest} />
    {hint ? <small className="field-hint">{hint}</small> : null}
    {error ? <small className="field-error">{error}</small> : null}
  </label>
);

export default Input;
