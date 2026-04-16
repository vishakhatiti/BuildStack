const Button = ({
  children,
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}) => {
  const classes = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <span className="spinner small" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
