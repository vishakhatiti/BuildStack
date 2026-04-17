const Card = ({ children, className = "", as = "div", ...rest }) => {
  const Tag = as;

  return (
    <Tag className={["card", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </Tag>
  );
};

export default Card;
